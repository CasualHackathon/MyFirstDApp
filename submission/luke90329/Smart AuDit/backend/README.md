# Backend

## 環境變數

- `RPC=https://sepolia.infura.io/v3/<KEY>`
- `CHAIN_ID=11155111`
- `CONTRACT=0x<部署後地址>`
- `SERVICE_PK=<不含0x>`
- `REPORT_ROOT=./reports`
- `INDEX_FROM_BLOCK=<部署區塊高度>`

## 安裝與啟動

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

啟動後會先回補歷史事件，再持續監看最新區塊，提供：
- `GET /cases?user=0x...&page=1&limit=20`
- `GET /cases/:id`
- `GET /reports/:id`
