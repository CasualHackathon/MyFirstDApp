import os
import time
import asyncio
import sqlite3
import logging
from contextlib import closing
from typing import Optional, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from web3.middleware import geth_poa_middleware
from fastapi.responses import PlainTextResponse, Response

# 讀取 backend/.env（而非預設 cwd 的 .env）
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'), override=True)

# 初始化 logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# 新增：審計管線模組（改為絕對匯入）
from backend.audit.slither_runner import run_slither
from backend.audit.llm_runner import run_llm
from backend.audit.report_builder import build_report
from backend.audit.storage import save_report

# Environment
RPC = os.getenv("RPC", "http://localhost:8545")
CHAIN_ID = int(os.getenv("CHAIN_ID", "11155111"))
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS") or os.getenv("CONTRACT", "0x0000000000000000000000000000000000000000")
SERVICE_PK = os.getenv("SERVICE_PK", "")
REPORT_ROOT = os.getenv("REPORT_ROOT", "./reports")
INDEX_FROM_BLOCK = int(os.getenv("INDEX_FROM_BLOCK", "0"))

# ABI (minimal) for events and jobs mapping getter
CONTRACT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "id", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"},
        ],
        "name": "JobPaid",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "id", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "reportCID", "type": "string"},
        ],
        "name": "JobCompleted",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "id", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "reason", "type": "string"},
        ],
        "name": "JobFailed",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "id", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "to", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"},
        ],
        "name": "JobRefunded",
        "type": "event",
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "jobs",
        "outputs": [
            {"internalType": "address", "name": "user", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint64", "name": "paidAt", "type": "uint64"},
            {"internalType": "bool", "name": "completed", "type": "bool"},
            {"internalType": "bool", "name": "failed", "type": "bool"},
            {"internalType": "string", "name": "reportCID", "type": "string"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "reason", "type": "string"},
        ],
        "name": "markFailed",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "reportCID", "type": "string"},
        ],
        "name": "complete",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]

# FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB setup
DB_PATH = os.path.join(os.getcwd(), "cases.db")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY,
  user TEXT NOT NULL,
  amount TEXT NOT NULL,
  paid_tx TEXT,
  paid_block INTEGER,
  paid_time INTEGER,
  completed INTEGER DEFAULT 0,
  report_cid TEXT,
  completed_tx TEXT,
  completed_block INTEGER,
  completed_time INTEGER
);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
"""


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_extra_columns(conn: sqlite3.Connection) -> None:
    # 動態新增 failed 與 fail_reason 欄位（若不存在）
    cols = {row[1] for row in conn.execute("PRAGMA table_info(cases)").fetchall()}
    if "failed" not in cols:
        conn.execute("ALTER TABLE cases ADD COLUMN failed INTEGER DEFAULT 0")
    if "fail_reason" not in cols:
        conn.execute("ALTER TABLE cases ADD COLUMN fail_reason TEXT")


def init_db():
    with closing(get_db()) as conn:
        conn.executescript(SCHEMA_SQL)
        _ensure_extra_columns(conn)
        conn.commit()


# Web3 setup
w3 = Web3(Web3.HTTPProvider(RPC, request_kwargs={"timeout": 30}))
# Sepolia uses PoA middleware on some providers
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)


class Case(BaseModel):
    id: int
    amount: str
    paid_time: Optional[int]
    status: str
    report_cid: Optional[str]


class JobRequest(BaseModel):
    id: int
    source: str


@app.on_event("startup")
async def on_startup():
    init_db()
    logger.info(f"Backend startup — RPC={RPC}, CHAIN_ID={CHAIN_ID}, CONTRACT_ADDRESS={CONTRACT_ADDRESS}")
    # backfill then watch
    asyncio.create_task(indexer_main())


async def indexer_main():
    # Backfill
    try:
        await backfill_events(INDEX_FROM_BLOCK)
    except Exception as e:
        # Log error, continue to watch latest
        print("Backfill error:", e)
    # Watch new blocks
    latest = 0
    try:
        latest = w3.eth.block_number
    except Exception as e:
        print("RPC not available yet:", e)
    from_block = max(INDEX_FROM_BLOCK, latest)
    while True:
        try:
            head = w3.eth.block_number
            if head > from_block:
                await backfill_events(from_block + 1, head)
                from_block = head
        except Exception as e:
            print("Watch error:", e)
        await asyncio.sleep(5)


async def backfill_events(from_block: int, to_block: Optional[int] = None):
    if to_block is None:
        try:
            to_block = w3.eth.block_number
        except Exception as e:
            print("Backfill head error:", e)
            return
    if from_block == 0 and to_block:
        from_block = max(1, to_block - 5000)  # safety default range

    print(f"Backfill from {from_block} to {to_block}")
    try:
        paid_logs = contract.events.JobPaid().get_logs(fromBlock=from_block, toBlock=to_block)
        completed_logs = contract.events.JobCompleted().get_logs(fromBlock=from_block, toBlock=to_block)
    except Exception as e:
        print("Log fetch error:", e)
        return

    with closing(get_db()) as conn:
        for log in paid_logs:
            args = log["args"]
            block = w3.eth.get_block(log["blockNumber"])  # for timestamp
            conn.execute(
                """
                INSERT OR REPLACE INTO cases (id, user, amount, paid_tx, paid_block, paid_time)
                VALUES (?, ?, ?, ?, ?, COALESCE((SELECT paid_time FROM cases WHERE id=?), ?))
                """,
                (
                    int(args["id"]),
                    args["user"],
                    str(args["amount"]),
                    log["transactionHash"].hex(),
                    log["blockNumber"],
                    int(args["id"]),
                    block["timestamp"],
                ),
            )
        for log in completed_logs:
            args = log["args"]
            block = w3.eth.get_block(log["blockNumber"])  # for timestamp
            conn.execute(
                """
                UPDATE cases
                SET completed=1, report_cid=?, completed_tx=?, completed_block=?, completed_time=?
                WHERE id=?
                """,
                (
                    args["reportCID"],
                    log["transactionHash"].hex(),
                    log["blockNumber"],
                    block["timestamp"],
                    int(args["id"]),
                ),
            )
        conn.commit()


@app.get("/cases", response_model=List[Case])
async def list_cases(user: str, page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    with closing(get_db()) as conn:
        rows = conn.execute(
            """
            SELECT id, amount, paid_time, completed, report_cid
            FROM cases WHERE LOWER(user)=LOWER(?)
            ORDER BY (paid_time IS NULL) ASC, paid_time DESC, id DESC
            LIMIT ? OFFSET ?
            """,
            (user, limit, offset),
        ).fetchall()

    result: List[Case] = []
    now_ts = int(time.time())
    for r in rows:
        status = "Pending"
        if r["completed"]:
            status = "Completed"
        elif r["paid_time"] is not None:
            if int(r["paid_time"]) + 15 * 60 <= now_ts:
                status = "Refundable"
        result.append(
            Case(
                id=int(r["id"]),
                amount=str(r["amount"]),
                paid_time=int(r["paid_time"]) if r["paid_time"] is not None else None,
                status=status,
                report_cid=r["report_cid"],
            )
        )
    return result


@app.get("/cases/{id}")
async def get_case(id: int):
    with closing(get_db()) as conn:
        row = conn.execute(
            "SELECT * FROM cases WHERE id=?",
            (id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")

    # Cross-check on-chain (defensive)
    try:
        j = contract.functions.jobs(id).call()
        onchain = {
            "user": j[0],
            "amount": str(j[1]),
            "paidAt": int(j[2]),
            "completed": bool(j[3]),
            "reportCID": j[4],
        }
    except Exception:
        onchain = None

    return {
        "id": int(row["id"]),
        "user": row["user"],
        "amount": str(row["amount"]),
        "paid_time": int(row["paid_time"]) if row["paid_time"] is not None else None,
        "completed": bool(row["completed"]),
        "report_cid": row["report_cid"],
        "onchain": onchain,
    }


@app.get("/reports/{id}")
async def get_report(id: int):
    # Serve local files under REPORT_ROOT if present. Prefer Markdown as raw text for direct browser view.
    path_md = os.path.join(REPORT_ROOT, f"{id}.md")
    path_json = os.path.join(REPORT_ROOT, f"{id}.json")
    if os.path.exists(path_md):
        with open(path_md, "r", encoding="utf-8") as f:
            return PlainTextResponse(content=f.read(), media_type="text/markdown; charset=utf-8")
    if os.path.exists(path_json):
        with open(path_json, "r", encoding="utf-8") as f:
            return Response(content=f.read(), media_type="application/json; charset=utf-8")
    raise HTTPException(status_code=404, detail="Report not found")


@app.post("/jobs")
async def create_job(req: JobRequest):
    # 啟動審計背景任務
    asyncio.create_task(audit_and_complete(req.id, req.source))
    return {"id": req.id, "status": "queued"}


def _normalize_pk(pk: str) -> Optional[str]:
    if not pk:
        return None
    return pk if pk.startswith("0x") else ("0x" + pk)


async def audit_and_complete(job_id: int, source: str):
    logger.info(f"[Job {job_id}] 開始審計流程")
    base = os.path.join(os.getcwd(), "tmp", str(job_id))
    os.makedirs(base, exist_ok=True)
    src_path = os.path.join(base, "Source.sol")

    failed = False
    fail_reason = ""

    try:
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(source)
        logger.info(f"[Job {job_id}] 原始碼已寫入 {src_path}")
    except Exception as e:
        failed = True
        fail_reason = f"write_source_error: {e}"
        logger.error(f"[Job {job_id}] Write source error: {e}")

    slither_json = None
    if not failed:
        slither_json_path = os.path.join(base, "slither.json")
        try:
            logger.info(f"[Job {job_id}] Slither 開始")
            slither_json = run_slither(base, slither_json_path)
            logger.info(f"[Job {job_id}] Slither 完成，輸出 {slither_json_path}")
        except Exception as e:
            failed = True
            fail_reason = f"slither_error: {e}"
            logger.error(f"[Job {job_id}] Slither error: {e}")

    analysis = None
    if not failed:
        try:
            logger.info(f"[Job {job_id}] LLM 合成開始")
            # 將完整原始碼傳入 LLM，以利補充與剃除誤報
            summary = source
            analysis = run_llm(summary, slither_json or {"issues": []})
            llm_mode = analysis.get("llm_mode", "degraded")
            if llm_mode != "llm":
                # 任何 LLM 非正常模式一律視為失敗
                failed = True
                fail_reason = f"llm_error: {analysis.get('llm_error') or 'degraded'}"
                logger.error(f"[Job {job_id}] LLM not in normal mode: {llm_mode}")
            else:
                logger.info(f"[Job {job_id}] LLM 合成完成")
        except Exception as e:
            failed = True
            fail_reason = f"llm_exception: {e}"
            logger.error(f"[Job {job_id}] LLM exception: {e}")

    # 若任一步驟失敗：標記 failed，跳過報告與上鏈 complete
    if failed:
        # on-chain markFailed（若有 SERVICE_PK）
        if SERVICE_PK:
            try:
                pk = _normalize_pk(SERVICE_PK)
                acct = w3.eth.account.from_key(pk)
                logger.info(f"[Job {job_id}] markFailed() 準備送出，contract={CONTRACT_ADDRESS}")
                tx = contract.functions.markFailed(job_id, fail_reason).build_transaction({
                    "from": acct.address,
                    "nonce": w3.eth.get_transaction_count(acct.address),
                    "chainId": CHAIN_ID,
                })
                try:
                    tx["gas"] = w3.eth.estimate_gas(tx)
                except Exception:
                    tx["gas"] = 200000
                tx.pop("maxFeePerGas", None)
                tx.pop("maxPriorityFeePerGas", None)
                tx["gasPrice"] = w3.to_wei(1, "gwei")
                signed = acct.sign_transaction(tx)
                tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
                logger.info(f"[Job {job_id}] markFailed() 已送出，tx={tx_hash.hex()}")
                _ = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
            except Exception as e:
                logger.error(f"[Job {job_id}] markFailed tx error: {e}")
        with closing(get_db()) as conn:
            conn.execute(
                "UPDATE cases SET failed=1, fail_reason=? WHERE id=?",
                (fail_reason[:400], job_id),
            )
            conn.commit()
        logger.info(f"[Job {job_id}] 已標記 failed（{fail_reason}），跳過上鏈完成；使用者可退款（依合約規則）")
        return

    # 4) 產報告並儲存（僅在成功時）
    logger.info(f"[Job {job_id}] 報告彙整開始")
    report = build_report(job_id, analysis or {})
    try:
        report_url = save_report(job_id, report)
        logger.info(f"[Job {job_id}] 報告已儲存，URL={report_url}")
    except Exception as e:
        # 將儲存失敗也視為失敗，不進行完成上鏈
        with closing(get_db()) as conn:
            conn.execute(
                "UPDATE cases SET failed=1, fail_reason=? WHERE id=?",
                (f"save_report_error: {e}"[:400], job_id),
            )
            conn.commit()
        logger.error(f"[Job {job_id}] Save report error: {e}")
        return

    # 5) 上鏈標記 complete（若有 SERVICE_PK）
    completed_onchain = False
    if SERVICE_PK:
        try:
            pk = _normalize_pk(SERVICE_PK)
            acct = w3.eth.account.from_key(pk)
            logger.info(f"[Job {job_id}] complete() 準備送出，contract={CONTRACT_ADDRESS}")
            tx = contract.functions.complete(job_id, report_url).build_transaction({
                "from": acct.address,
                "nonce": w3.eth.get_transaction_count(acct.address),
                "chainId": CHAIN_ID,
            })
            # Gas 設定：估算 gas，並強制使用 legacy gasPrice 以相容 anvil
            try:
                tx["gas"] = w3.eth.estimate_gas(tx)
            except Exception:
                tx["gas"] = 300000
            tx.pop("maxFeePerGas", None)
            tx.pop("maxPriorityFeePerGas", None)
            tx["gasPrice"] = w3.to_wei(1, "gwei")
            signed = acct.sign_transaction(tx)
            tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
            logger.info(f"[Job {job_id}] complete() 已送出，tx={tx_hash.hex()}")
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
            completed_onchain = (receipt.status == 1)
            logger.info(f"[Job {job_id}] 上鏈完成狀態={completed_onchain}")
        except Exception as e:
            logger.error(f"[Job {job_id}] Complete tx error: {e}")

    # 6) 更新資料庫（標記 completed 與 report）
    with closing(get_db()) as conn:
        if completed_onchain:
            now_ts = int(time.time())
            conn.execute(
                """
                UPDATE cases SET completed=1, report_cid=? , completed_time=? WHERE id=?
                """,
                (report_url, now_ts, job_id),
            )
            logger.info(f"[Job {job_id}] DB 已標記 completed，report={report_url}")
        else:
            conn.execute(
                "UPDATE cases SET report_cid=? WHERE id=?",
                (report_url, job_id),
            )
            logger.info(f"[Job {job_id}] DB 已更新 report_cid（未上鏈完成）")
        conn.commit()
    logger.info(f"[Job {job_id}] 審計流程結束")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
