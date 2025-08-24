'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { APIStatusPanel } from '@/components/common/APIStatusPanel';
import { useBalance, useTextTo3D, useTaskStatus } from '@/hooks/use-meshy';
import { TextTo3DParams, TaskStatusResponse } from '@/shared/meshy/types';
import { calculateCost, estimateGenerationTime } from '@/shared/meshy/config';
import { Sparkles, Clock, DollarSign, Zap } from 'lucide-react';

export default function MeshyTestPage() {
  const [prompt, setPrompt] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Hooks
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const textTo3DMutation = useTextTo3D();
  const { data: taskStatus } = useTaskStatus(currentTaskId) as { data: TaskStatusResponse | undefined };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const params: TextTo3DParams = {
      mode: 'preview',
      prompt: prompt.trim(),
      art_style: 'realistic',
      ai_model: 'meshy-5',
      topology: 'triangle',
      target_polycount: 5000,
      symmetry_mode: 'auto',
    };

    try {
      const result = await textTo3DMutation.mutateAsync(params);
      setCurrentTaskId(result.result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const cost = calculateCost('preview');
  const estimatedTime = estimateGenerationTime('preview', 5000);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Meshy AI SDK Test
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SDK Integration Test
          </h1>
          <p className="text-xl text-muted-foreground">
            Test all features of the Meshy AI SDK
          </p>
        </div>

        {/* API status panel */}
        <APIStatusPanel />

        {/* Balance display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Account Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-green-600">
                {balance?.balance || 0} Credits
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Text-to-3D Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe the 3D model you want to generate:
              </label>
              <Input
                placeholder="e.g., A cute robot with blue eyes"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={600}
              />
              <div className="text-xs text-muted-foreground">
                {prompt.length}/600 chars
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">Cost: {cost} Credits</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">ETA: {estimatedTime}s</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || textTo3DMutation.isPending}
              className="w-full"
              size="lg"
            >
              {textTo3DMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Start Generate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Task status display */}
        {currentTaskId && (
          <Card>
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Task ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {currentTaskId}
                  </code>
                </div>

                {taskStatus && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge
                        variant={
                          taskStatus.status === 'SUCCEEDED' ? 'default' :
                            taskStatus.status === 'FAILED' ? 'destructive' :
                              taskStatus.status === 'IN_PROGRESS' ? 'secondary' :
                                'outline'
                        }
                      >
                        {taskStatus.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{taskStatus.progress}%</span>
                      </div>
                      <Progress value={taskStatus.progress} className="w-full" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Created At:</span>
                      <span>{new Date(taskStatus.created_at).toLocaleString()}</span>
                    </div>

                    {taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">✅ Generation Successful!</h4>
                        <div className="space-y-2 text-sm">
                          {taskStatus.model_urls.glb && (
                            <div>
                              <strong>GLB Model:</strong>
                              <a
                                href={taskStatus.model_urls.glb}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 hover:underline break-all"
                              >
                                {taskStatus.model_urls.glb}
                              </a>
                            </div>
                          )}

                          {/* Model info would come from the task metadata */}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>Task ID: {taskStatus.id}</div>
                            <div>Mode: {taskStatus.mode}</div>
                            <div>Created: {new Date(taskStatus.created_at).toLocaleString()}</div>
                            {taskStatus.finished_at && (
                              <div>Finished: {new Date(taskStatus.finished_at).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {taskStatus.status === 'FAILED' && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">❌ Generation Failed</h4>
                        <p className="text-red-700 text-sm">
                          {taskStatus.task_error || 'Unknown error'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SDK status info */}
        <Card>
          <CardHeader>
            <CardTitle>SDK Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Env:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>API Mode:</strong> {process.env.NODE_ENV === 'development' ? 'Mock' : 'Production'}
              </div>
              <div>
                <strong>Balance:</strong> {balanceLoading ? 'Loading' : '✅ OK'}
              </div>
              <div>
                <strong>Task Creation:</strong> {textTo3DMutation.isError ? '❌ Error' : '✅ OK'}
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Development Mode:</strong> Using mocked API data. No real credits will be consumed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
