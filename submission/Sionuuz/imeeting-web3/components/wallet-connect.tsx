"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

export function WalletConnect() {
  const { isConnected, address, connect, disconnect } = useWallet()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast({
        title: "地址已复制",
        description: "钱包地址已复制到剪贴板",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <Badge
          variant="secondary"
          className="px-3 py-2 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={copyAddress}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {formatAddress(address)}
          {copied ? <Check className="w-4 h-4 ml-2 text-green-600" /> : <Copy className="w-4 h-4 ml-2" />}
        </Badge>
        <Button variant="outline" size="sm" onClick={disconnect}>
          <LogOut className="w-4 h-4 mr-2" />
          断开连接
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={connect}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      <Wallet className="w-4 h-4 mr-2" />
      连接钱包
    </Button>
  )
}
