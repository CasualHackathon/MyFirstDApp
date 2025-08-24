import React, { useMemo, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Button, Card } from './ui'
import { parseEther } from 'viem'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT as `0x${string}` | undefined
const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "createAndPay",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const

// 驗證限制
const MAX_LINES = 1200
const MAX_CHARS = 120_000
const REQUIRED_SOLIDITY_MAJOR = 0
const REQUIRED_SOLIDITY_MINOR = 8 // 要求 0.8.x

function validateSource(src: string): string[] {
  const errors: string[] = []
  const trimmed = src.trim()
  if (!trimmed) {
    errors.push('請貼上 Solidity 程式碼')
    return errors
  }
  const lines = trimmed.split(/\r?\n/)
  if (lines.length > MAX_LINES) {
    errors.push(`行數過多（${lines.length} 行），上限為 ${MAX_LINES} 行`)
  }
  if (trimmed.length > MAX_CHARS) {
    errors.push(`字元數過多（${trimmed.length}），上限為 ${MAX_CHARS}`)
  }
  // pragma 檢查（不限制版本，只要求存在）
  const pragmaMatch = trimmed.match(/pragma\s+solidity\s+[^;]+;/i)
  if (!pragmaMatch) {
    errors.push('缺少 pragma solidity 宣告（例如：pragma solidity ^0.8.24;）')
  }
  // 基本語法檢查：是否包含關鍵字、括號平衡
  if (!/\b(contract|interface|library)\b/.test(trimmed)) {
    errors.push('未偵測到 contract/interface/library 關鍵字')
  }
  const openBraces = (trimmed.match(/\{/g) || []).length
  const closeBraces = (trimmed.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push(`花括號不平衡：{=${openBraces}}=${closeBraces}`)
  }
  return errors
}

export default function SubmitCase() {
  const { address, isConnected } = useAccount()
  const { data: wallet } = useWalletClient()
  const [source, setSource] = useState('')
  const [sending, setSending] = useState(false)

  const lineCount = useMemo(() => source.split(/\r?\n/).filter(Boolean).length, [source])
  const pricePerLineEth = 0.00001 // 僅示意，可改為動態
  const totalEth = (lineCount * pricePerLineEth).toFixed(6)

  const errors = useMemo(() => validateSource(source), [source])

  async function onSubmit() {
    if (!isConnected || !wallet) return
    if (!CONTRACT_ADDRESS) return alert('尚未設定合約地址 (VITE_CONTRACT)')
    if (errors.length > 0) return

    try {
      setSending(true)
      // 使用 timestamp 當簡單 id（或可改為後端產生）
      const now = Math.floor(Date.now() / 1000)
      const jobId = BigInt(`${now}`)

      // 1) 鍊上付款建立 case（使用目前錢包所連線的鏈，例如 Anvil 31337）
      await wallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'createAndPay',
        args: [jobId],
        value: parseEther(totalEth),
      })

      // 2) 回報後端啟動審計
      await fetch(`${BACKEND}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(jobId), source }),
      })

      alert('已提交審計任務！')
      setSource('')
    } catch (e) {
      console.error(e)
      alert('提交失敗，請稍後再試')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3">提交合約程式碼</h3>
      <textarea
        className="w-full h-56 rounded-lg bg-neutral-900/60 border border-neutral-800 p-3 font-mono text-sm outline-none focus:border-neutral-600"
        placeholder="貼上 Solidity 程式碼"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <div className="flex items-center justify-between mt-3 text-sm text-neutral-300">
        <div>行數：{lineCount}</div>
        <div>單價：{pricePerLineEth} ETH／行</div>
        <div>總價：{totalEth} ETH</div>
      </div>
      {errors.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-700 bg-amber-900/20 p-3 text-amber-200 text-sm">
          <div className="font-semibold mb-1">請先修正以下問題：</div>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-3">
        <Button disabled={!isConnected || sending || !source.trim() || errors.length > 0} onClick={onSubmit}>
          {sending ? '提交中...' : '支付並建立 Case'}
        </Button>
      </div>
    </Card>
  )
}
