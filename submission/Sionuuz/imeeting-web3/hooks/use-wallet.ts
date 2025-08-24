"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletState {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

export function useWallet(): WalletState {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // 检查是否已连接钱包
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)
          }
        } catch (error) {
          console.error("检查钱包连接失败:", error)
        }
      }
    }

    checkConnection()

    // 监听账户变化
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        } else {
          setAddress(null)
          setIsConnected(false)
        }
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "钱包未找到",
        description: "请安装MetaMask或其他Web3钱包以连接萝卜开会平台",
        variant: "destructive",
      })
      return
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      console.log("[v0] 当前网络链ID:", chainId)

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        toast({
          title: "钱包连接成功",
          description: `欢迎使用萝卜开会！已连接到 ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error: any) {
      console.error("[v0] 钱包连接错误:", error)
      toast({
        title: "连接失败",
        description: error.message || "无法连接到钱包，请重试",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    toast({
      title: "钱包已断开",
      description: "您已成功断开萝卜开会平台的钱包连接",
    })
  }

  return {
    isConnected,
    address,
    connect,
    disconnect,
  }
}

// 扩展Window接口以包含ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
