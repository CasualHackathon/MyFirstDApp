'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Database, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink 
} from 'lucide-react';

export function APIStatusPanel() {
  const useRealAPI = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
  const hasValidAPIKey = process.env.NEXT_PUBLIC_MESHY_API_KEY && 
                        process.env.NEXT_PUBLIC_MESHY_API_KEY !== 'demo_key';
  const isUsingRealAPI = useRealAPI && hasValidAPIKey;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>API 连接状态</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 当前状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">当前模式:</span>
          </div>
          <Badge variant={isUsingRealAPI ? "default" : "secondary"}>
            {isUsingRealAPI ? "🌐 真实API" : "🧪 模拟数据"}
          </Badge>
        </div>

        {/* API密钥状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span className="text-sm font-medium">API密钥:</span>
          </div>
          <div className="flex items-center space-x-2">
            {hasValidAPIKey ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm">
              {hasValidAPIKey ? "已配置" : "未配置"}
            </span>
          </div>
        </div>

        {/* 配置信息 */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>API密钥: {process.env.NEXT_PUBLIC_MESHY_API_KEY || '未设置'}</div>
          <div>使用真实API: {useRealAPI ? '是' : '否'}</div>
          <div>环境: {process.env.NODE_ENV}</div>
        </div>

        {/* 配置指引 */}
        {!isUsingRealAPI && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p>当前使用模拟数据进行开发。要测试真实API:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>在 <a href="https://app.meshy.ai/profile" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                    Meshy AI官网 <ExternalLink className="h-3 w-3 ml-1" />
                  </a> 获取API密钥</li>
                  <li>编辑 <code>.env.local</code> 文件:</li>
                  <li className="ml-4">
                    <code className="text-xs bg-muted px-1 rounded">
                      NEXT_PUBLIC_MESHY_API_KEY=your_api_key
                    </code>
                  </li>
                  <li className="ml-4">
                    <code className="text-xs bg-muted px-1 rounded">
                      NEXT_PUBLIC_USE_REAL_API=true
                    </code>
                  </li>
                  <li>重启开发服务器</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isUsingRealAPI && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              ✅ 已连接到真实Meshy AI API，将消耗真实Credits进行生成。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}