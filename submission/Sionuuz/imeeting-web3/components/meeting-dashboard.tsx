"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  participants: string[]
  status: "upcoming" | "ongoing" | "completed"
  blockchainHash?: string
  decisions: string[]
}

export function MeetingDashboard() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
  })
  const [meetingDecision, setMeetingDecision] = useState("")

  // 模拟数据
  useEffect(() => {
    const mockMeetings: Meeting[] = [
      {
        id: "1",
        title: "项目启动会议",
        description: "讨论新项目的启动计划和资源分配",
        date: "2024-01-15T10:00:00Z",
        participants: [address!, "0x742d35Cc6634C0532925a3b8D404d3aABe09e444"],
        status: "completed",
        blockchainHash: "0x1234567890abcdef...",
        decisions: ["批准项目预算", "确定项目时间线", "分配团队成员"],
      },
      {
        id: "2",
        title: "季度业务回顾",
        description: "回顾本季度的业务表现和下季度规划",
        date: "2024-01-20T14:00:00Z",
        participants: [address!, "0x742d35Cc6634C0532925a3b8D404d3aABe09e444", "0x8ba1f109551bD432803012645Hac136c"],
        status: "upcoming",
        decisions: [],
      },
      {
        id: "3",
        title: "技术架构讨论",
        description: "讨论系统架构升级方案",
        date: "2024-01-18T16:00:00Z",
        participants: [address!],
        status: "ongoing",
        decisions: [],
      },
    ]
    setMeetings(mockMeetings)
  }, [address])

  const createMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date) {
      toast({
        title: "错误",
        description: "请填写会议标题和时间",
        variant: "destructive",
      })
      return
    }

    const meeting: Meeting = {
      id: Date.now().toString(),
      title: newMeeting.title,
      description: newMeeting.description,
      date: newMeeting.date,
      participants: [address!],
      status: "upcoming",
      decisions: [],
    }

    setMeetings((prev) => [...prev, meeting])
    setNewMeeting({ title: "", description: "", date: "" })
    setIsCreateDialogOpen(false)

    toast({
      title: "会议创建成功",
      description: "新会议已添加到您的日程中",
    })
  }

  const recordDecision = async () => {
    if (!selectedMeeting || !meetingDecision) return

    try {
      console.log("[v0] 开始记录会议决议到区块链...")

      // 模拟智能合约交互
      const timestamp = Date.now()
      const mockHash = `0x${Math.random().toString(16).substr(2, 40)}${timestamp.toString(16)}`

      // 模拟交易确认延迟
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const updatedMeeting = {
        ...selectedMeeting,
        decisions: [...selectedMeeting.decisions, meetingDecision],
        blockchainHash: mockHash,
        status: "completed" as const,
      }

      setMeetings((prev) => prev.map((m) => (m.id === selectedMeeting.id ? updatedMeeting : m)))

      setMeetingDecision("")
      setIsRecordDialogOpen(false)
      setSelectedMeeting(null)

      console.log("[v0] 会议决议已成功记录到区块链，哈希:", mockHash)

      toast({
        title: "决议已上链成功",
        description: `萝卜开会已将您的决议永久保存到区块链。交易哈希: ${mockHash.slice(0, 10)}...`,
      })
    } catch (error) {
      console.error("[v0] 区块链记录失败:", error)
      toast({
        title: "上链失败",
        description: "记录决议到区块链时发生错误，请重试",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: Meeting["status"]) => {
    switch (status) {
      case "upcoming":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "ongoing":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
    }
  }

  const getStatusText = (status: Meeting["status"]) => {
    switch (status) {
      case "upcoming":
        return "即将开始"
      case "ongoing":
        return "进行中"
      case "completed":
        return "已完成"
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">萝卜开会管理面板</h2>
          <p className="text-gray-600 mt-2">管理您的Web3会议和区块链记录，连接imeeting.co生态系统</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              创建会议
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新会议</DialogTitle>
              <DialogDescription>填写会议信息，创建后将自动添加到您的日程中</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">会议标题</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="输入会议标题"
                />
              </div>
              <div>
                <Label htmlFor="description">会议描述</Label>
                <Textarea
                  id="description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="输入会议描述"
                />
              </div>
              <div>
                <Label htmlFor="date">会议时间</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <Button onClick={createMeeting} className="w-full">
                创建会议
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meetings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {getStatusIcon(meeting.status)}
                  <span>{getStatusText(meeting.status)}</span>
                </Badge>
                {meeting.blockchainHash && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    已上链
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{meeting.title}</CardTitle>
              <CardDescription>{meeting.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(meeting.date).toLocaleString("zh-CN")}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {meeting.participants.length} 位参与者
                </div>

                {meeting.decisions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">会议决议:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {meeting.decisions.map((decision, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {meeting.status === "ongoing" && (
                  <Button
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setIsRecordDialogOpen(true)
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    记录决议
                  </Button>
                )}

                {meeting.blockchainHash && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-800 font-medium">区块链哈希:</p>
                    <p className="text-xs text-green-600 font-mono break-all">{meeting.blockchainHash}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Record Decision Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>记录会议决议</DialogTitle>
            <DialogDescription>记录的决议将永久保存在区块链上，确保不可篡改</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="decision">会议决议</Label>
              <Textarea
                id="decision"
                value={meetingDecision}
                onChange={(e) => setMeetingDecision(e.target.value)}
                placeholder="输入会议决议内容"
                rows={4}
              />
            </div>
            <Button onClick={recordDecision} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              保存到区块链
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
