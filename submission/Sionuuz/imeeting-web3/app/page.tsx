"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Shield, Database } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { MeetingDashboard } from "@/components/meeting-dashboard"
import { useWallet } from "@/hooks/use-wallet"

export default function HomePage() {
  const { isConnected, address } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">萝卜开会</h1>
              <p className="text-sm text-gray-600">区块链驱动的会议管理系统</p>
            </div>
          </div>
          <WalletConnect />
        </header>

        {!isConnected ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                萝卜开会
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Web3会议平台
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                连接imeeting.co生态系统，使用Web3技术确保会议记录的透明性和不可篡改性，通过区块链永久保存会议决议和重要文档
              </p>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  安全可信
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Database className="w-4 h-4 mr-2" />
                  链上存储
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  去中心化身份
                </Badge>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Web3身份验证</CardTitle>
                  <CardDescription>
                    通过钱包地址进行身份验证，与imeeting.co无缝集成，无需传统的用户名密码系统
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>链上记录</CardTitle>
                  <CardDescription>
                    会议决议和重要文档永久保存在区块链上，确保数据不可篡改，符合最佳安全实践
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <CardTitle>智能合约管理</CardTitle>
                  <CardDescription>使用智能合约自动化会议流程，提高效率和透明度，确保用户友好的体验</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="p-12 text-center">
                <h3 className="text-3xl font-bold mb-4">开始使用萝卜开会</h3>
                <p className="text-xl mb-8 opacity-90">连接您的钱包，体验去中心化的会议管理</p>
                <WalletConnect />
              </CardContent>
            </Card>
          </div>
        ) : (
          <MeetingDashboard />
        )}
      </div>
    </div>
  )
}
