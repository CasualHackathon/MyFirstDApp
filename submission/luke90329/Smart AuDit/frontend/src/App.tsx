import React from 'react'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import SubmitCase from './components/SubmitCase'
import CaseList from './components/CaseList'
import { Badge, Button, Card } from './components/ui'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connectors, connect, status: connectStatus } = useConnect()
  const { disconnect } = useDisconnect()

  const wrongNetwork = isConnected && chainId !== 31337

  return (
    <div className="min-h-full">
      <header className="border-b border-neutral-800/80 sticky top-0 z-10 backdrop-blur bg-neutral-950/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-brand-500" />
            <h1 className="text-lg font-semibold tracking-wide">Smart AuDit</h1>
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                {wrongNetwork && <Badge color="yellow">請切換至本機 Anvil (31337)</Badge>}
                <Badge color="gray">{address?.slice(0, 6)}...{address?.slice(-4)}</Badge>
                <Button variant="outline" onClick={() => disconnect()}>斷線</Button>
              </>
            ) : (
              connectors.map(c => (
                <Button key={c.uid} onClick={() => connect({ connector: c })}>連線 {c.name}</Button>
              ))
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid gap-4">
        {!isConnected ? (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">連線錢包以開始</h2>
                <p className="text-neutral-400">支援 Injected 錢包（MetaMask 等）。預設網路：Anvil (31337)。</p>
              </div>
              <div className="hidden sm:block text-neutral-400">{connectStatus}</div>
            </div>
          </Card>
        ) : (
          <>
            {wrongNetwork && (
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">網路不正確</h3>
                    <p className="text-neutral-400">目前鏈 ID：{chainId}，請切換至 Anvil (31337)。</p>
                  </div>
                </div>
              </Card>
            )}
            <SubmitCase />
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">我的歷史案例</h2>
              </div>
              <CaseList backend={BACKEND} user={address!} />
            </Card>
          </>
        )}
      </main>

      <footer className="max-w-6xl mx-auto p-6 text-sm text-neutral-500 text-center">
        © {new Date().getFullYear()} Smart AuDit — Anvil
      </footer>
    </div>
  )
}
