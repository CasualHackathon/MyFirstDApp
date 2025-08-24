import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, Skeleton, Modal } from './ui'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useWriteContract } from 'wagmi'
import { Address, Hex, createPublicClient, decodeEventLog, getAbiItem, http, parseAbi, parseEther } from 'viem'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT as Address
const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Anvil 31337
const anvil = {
  id: 31337,
  name: 'Anvil',
  network: 'anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
} as const

const client = createPublicClient({ chain: anvil, transport: http('http://127.0.0.1:8545') })

const ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobRefunded",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "jobs",
    "outputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint64", "name": "paidAt", "type": "uint64" },
      { "internalType": "bool", "name": "completed", "type": "bool" },
      { "internalType": "bool", "name": "failed", "type": "bool" },
      { "internalType": "string", "name": "reportCID", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reportCID", "type": "string" }
    ],
    "name": "JobCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "JobFailed",
    "type": "event"
  },
] as const

const jobPaidTopic0 = (getAbiItem({ abi: ABI, name: 'JobPaid' }) as any).topic
const jobCompletedTopic0 = (getAbiItem({ abi: ABI, name: 'JobCompleted' }) as any).topic
const jobFailedTopic0 = (getAbiItem({ abi: ABI, name: 'JobFailed' }) as any).topic
const jobRefundedTopic0 = (getAbiItem({ abi: ABI, name: 'JobRefunded' }) as any).topic

type CaseItem = {
  id: bigint
  amount: bigint
  paid_time?: number
  status: 'Completed' | 'Refundable' | 'Pending' | 'Refunded'
  report_cid?: string
  failed?: boolean
}

export default function CaseList({ user }: { user: string }) {
  const [items, setItems] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTitle, setReportTitle] = useState<string>('')
  const [reportContent, setReportContent] = useState<string>('')
  const [reportLoading, setReportLoading] = useState(false)
  const [refundingId, setRefundingId] = useState<bigint | null>(null)
  const { writeContract, isPending: isRefundPending } = useWriteContract()

  const nowTs = () => Math.floor(Date.now() / 1000)

  function computeStatus(it: Partial<CaseItem>): 'Completed' | 'Refundable' | 'Pending' | 'Refunded' {
    if (it.status === 'Completed') return 'Completed'
    if (it.status === 'Refunded') return 'Refunded'
    if (it.failed) return 'Refundable'
    if (it.paid_time) {
      // 前端超時門檻：5 分鐘
      if (nowTs() >= it.paid_time + 5 * 60) return 'Refundable'
    }
    return 'Pending'
  }

  function toReportUrl(cid?: string) {
    if (!cid) return undefined
    if (cid.startsWith('http://') || cid.startsWith('https://')) return cid
    // 相對路徑一律拼接後端基底 URL
    return `${BACKEND}${cid}`
  }

  async function openReport(id: bigint, cid?: string) {
    const url = toReportUrl(cid)
    if (!url) return
    setReportTitle(`# Audit Report — Job ${id.toString()}`)
    setReportLoading(true)
    setReportOpen(true)
    try {
      const res = await fetch(url)
      const text = await res.text()
      setReportContent(text)
    } catch (err) {
      setReportContent('載入失敗，請稍後再試。')
    } finally {
      setReportLoading(false)
    }
  }

  async function loadOnchain() {
    setLoading(true)
    try {
      console.log('[CaseList] loadOnchain start', { contract: CONTRACT_ADDRESS, user })
      const logsPaid = await client.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: 0n,
        toBlock: 'latest',
        topics: [jobPaidTopic0],
      } as any)

      const logsCompleted = await client.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: 0n,
        toBlock: 'latest',
        topics: [jobCompletedTopic0],
      } as any)

      const logsFailed = await client.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: 0n,
        toBlock: 'latest',
        topics: [jobFailedTopic0],
      } as any)

      const logsRefunded = await client.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: 0n,
        toBlock: 'latest',
        topics: [jobRefundedTopic0],
      } as any)

      const completedMap = new Map<bigint, string>()
      for (const log of logsCompleted) {
        try {
          const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
          if (decoded.eventName === 'JobCompleted') {
            console.log('[CaseList] JobCompleted log', decoded.args)
            completedMap.set(decoded.args.id as bigint, decoded.args.reportCID as string)
          }
        } catch {}
      }
      const failedSet = new Set<bigint>()
      for (const log of logsFailed) {
        try {
          const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
          if (decoded.eventName === 'JobFailed') {
            console.log('[CaseList] JobFailed log', decoded.args)
            failedSet.add(decoded.args.id as bigint)
          }
        } catch {}
      }

      const refundedSet = new Set<bigint>()
      for (const log of logsRefunded) {
        try {
          const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
          if (decoded.eventName === 'JobRefunded') {
            refundedSet.add(decoded.args.id as bigint)
          }
        } catch {}
      }

      const result: CaseItem[] = []
      for (const log of logsPaid) {
        try {
          const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
          if (decoded.eventName !== 'JobPaid') continue
          const id = decoded.args.id as bigint
          const amount = decoded.args.amount as bigint
          const logUser = (decoded.args as any).user as string
          console.log('[CaseList] JobPaid log', decoded.args)
          if (logUser.toLowerCase() !== user.toLowerCase()) continue
          const block = await client.getBlock({ blockHash: log.blockHash! })
          const paid_time = Number(block.timestamp)
          // 先讀 storage，避免事件漏接或前端晚啟動
          let completed = false
          let failed = false
          let report: string | undefined = undefined
          try {
            const read = await client.readContract({
              abi: ABI as any,
              address: CONTRACT_ADDRESS,
              functionName: 'jobs',
              args: [id],
            } as any) as any
            completed = Boolean(read?.[3])
            failed = Boolean(read?.[4])
            report = (read?.[5] as string) || undefined
            console.log('[CaseList] storage jobs(id)', id.toString(), {
              user: read?.[0], amount: read?.[1]?.toString?.(), paidAt: read?.[2], completed, failed, report,
            })
          } catch (e) {
            console.warn('[CaseList] readContract jobs(id) failed', id.toString(), e)
          }
          // 後備：用事件彙整補齊
          if (!completed && completedMap.has(id)) {
            completed = true
            report = completedMap.get(id)
          }
          if (!failed && failedSet.has(id)) failed = true

          result.push({
            id,
            amount,
            paid_time,
            status: refundedSet.has(id) ? 'Refunded' : (report ? 'Completed' : (completed ? 'Completed' : computeStatus({ paid_time, failed }))),
            report_cid: report,
            failed,
          })
          console.log('[CaseList] computed status', {
            id: id.toString(), completed, failed, report, status: report ? 'Completed' : (completed ? 'Completed' : computeStatus({ paid_time, failed })),
          })
        } catch {}
      }

      result.sort((a, b) => (b.paid_time ?? 0) - (a.paid_time ?? 0))
      setItems(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadOnchain()
    const unwatchPaid = client.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      eventName: 'JobPaid',
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
            const logUser = (decoded.args as any).user as string
            if (logUser.toLowerCase() !== user.toLowerCase()) continue
            const id = (decoded.args as any).id as bigint
            const amount = (decoded.args as any).amount as bigint
            const block = await client.getBlock({ blockHash: log.blockHash! })
            const paid_time = Number(block.timestamp)
            setItems(prev => {
              const exists = prev.some(x => x.id === id)
              if (exists) return prev
              const next = [{ id, amount, paid_time, status: 'Pending' as const }, ...prev]
              next.sort((a, b) => (b.paid_time ?? 0) - (a.paid_time ?? 0))
              return next
            })
          } catch {}
        }
      },
      poll: true,
    })

    const unwatchCompleted = client.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      eventName: 'JobCompleted',
      onLogs: (logs) => {
        for (const log of logs) {
          try {
            const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
            const id = (decoded.args as any).id as bigint
            const reportCID = (decoded.args as any).reportCID as string
            setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'Completed', report_cid: reportCID } : it))
          } catch {}
        }
      },
      poll: true,
    })

    const unwatchFailed = client.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      eventName: 'JobFailed',
      onLogs: (logs) => {
        for (const log of logs) {
          try {
            const decoded = decodeEventLog({ abi: ABI as any, data: log.data, topics: log.topics })
            const id = (decoded.args as any).id as bigint
            setItems(prev => prev.map(it => it.id === id ? { ...it, failed: true, status: 'Refundable' } : it))
          } catch {}
        }
      },
      poll: true,
    })

    return () => {
      unwatchPaid?.()
      unwatchCompleted?.()
      unwatchFailed?.()
    }
  }, [user])

  async function onRefund(id: bigint) {
    try {
      setRefundingId(id)
      // 先做模擬呼叫以取得可讀的錯誤原因（如 NOT_AUTHORIZED）
      try {
        await client.simulateContract({
          abi: ABI as any,
          address: CONTRACT_ADDRESS,
          functionName: 'refund',
          args: [id],
          account: user as any,
        } as any)
      } catch (simErr: any) {
        const reason = simErr?.shortMessage || simErr?.message || '交易模擬失敗'
        throw new Error(reason)
      }
      await writeContract({
        abi: ABI as any,
        address: CONTRACT_ADDRESS,
        functionName: 'refund',
        args: [id],
      } as any)
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || String(err)
      alert(`退款失敗：${msg}`)
    } finally {
      setRefundingId(current => (current === id ? null : current))
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex justify-between mb-2"><Skeleton className="w-24 h-5" /><Skeleton className="w-16 h-5" /></div>
            <Skeleton className="w-40 h-4 mb-2" />
            <Skeleton className="w-full h-10" />
          </div>
        ))}
      </div>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <div className="mx-auto size-14 rounded-full bg-neutral-800 flex items-center justify-center mb-3">📄</div>
        目前沒有案例記錄
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(it => {
          const reportUrl = toReportUrl(it.report_cid)
          return (
            <Card key={it.id.toString()}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-neutral-400">#{it.id.toString()}</div>
                  <div className="text-lg font-semibold">{it.amount.toString()} wei</div>
                </div>
                {it.status === 'Completed' && <Badge color="green">Completed</Badge>}
                {it.status === 'Refundable' && <Badge color="yellow">Refundable</Badge>}
                {it.status === 'Pending' && <Badge color="gray">Pending</Badge>}
              </div>
              <div className="text-sm text-neutral-400 mt-2">
                {it.paid_time ? new Date(it.paid_time * 1000).toLocaleString() : '-'}
              </div>
              <div className="mt-3 flex gap-2">
                {reportUrl ? (
                  <Button onClick={() => openReport(it.id, it.report_cid)}>查看報告</Button>
                ) : (
                  // 僅在 Pending 時顯示占位，不在 Refundable/Failed 顯示
                  it.status === 'Pending' && !it.failed && (
                    <Button variant="outline" disabled>報告產生中...</Button>
                  )
                )}
                {it.status === 'Refundable' && (
                  <Button variant="danger" onClick={() => onRefund(it.id)} disabled={refundingId === it.id || isRefundPending}>
                    {refundingId === it.id || isRefundPending ? '退款中...' : '退款'}
                  </Button>
                )}
                {it.status === 'Refunded' && (
                  <Button variant="outline" disabled>已退款</Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={reportTitle}>
        {reportLoading ? (
          <div className="text-neutral-400">載入中...</div>
        ) : (
          <article className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportContent}</ReactMarkdown>
          </article>
        )}
      </Modal>
    </>
  )
}
