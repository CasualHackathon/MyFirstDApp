'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTextTo3D, useTaskStatus } from '@/hooks/use-meshy';
import { TaskStatusResponse } from '@/shared/meshy/types';
import { SimpleModel3DViewer } from '@/components/3d/SimpleModel3DViewer';
import { Sparkles, Loader2, Eye } from 'lucide-react';

export default function APITestPage() {
  const [prompt, setPrompt] = useState('Please generate an obsidian NFT with a low-key, deep vibe');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const textTo3DMutation = useTextTo3D();
  const { data: taskStatus } = useTaskStatus(currentTaskId) as { data: TaskStatusResponse | undefined };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const result = await textTo3DMutation.mutateAsync({
        mode: 'preview',
        prompt: prompt.trim(),
        art_style: 'realistic',
        ai_model: 'meshy-5',
        topology: 'triangle',
        target_polycount: 5000,
        symmetry_mode: 'auto',
      });

      console.log('API Response:', result);
      setCurrentTaskId(result.result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Meshy API 3D Model Format Test</h1>
        <p className="text-muted-foreground mb-6">
          Test the compatibility of different 3D model formats in React Three Fiber
        </p>

        {/* Generation Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Generate Test Model</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleGenerate}
                disabled={textTo3DMutation.isPending || !prompt.trim()}
              >
                {textTo3DMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Status */}
        {currentTaskId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Task ID:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{currentTaskId}</code>
                </div>

                {taskStatus && (
                  <>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={taskStatus.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                        {taskStatus.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span>{taskStatus.progress}%</span>
                    </div>

                    {taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
                      <div className="mt-4 p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">✅ Model URLs from API:</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(taskStatus.model_urls).map(([format, url]) => (
                            url && (
                              <div key={format} className="flex justify-between items-center">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {format.toUpperCase()}
                                </span>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs truncate max-w-96"
                                >
                                  {url}
                                </a>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3D Model Format Tests */}
        {currentTaskId && taskStatus && taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">3D Model Format Compatibility</h2>

            {/* GLB format */}
            {taskStatus.model_urls.glb && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>GLB Format</span>
                    <Badge>Recommended</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {taskStatus.model_urls.glb}
                    </code>
                  </div>
                  <SimpleModel3DViewer
                    taskResult={taskStatus}
                  />
                </CardContent>
              </Card>
            )}

            {/* FBX format */}
            {taskStatus.model_urls.fbx && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>FBX Format</span>
                    <Badge variant="outline">Experimental</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {taskStatus.model_urls.fbx}
                    </code>
                  </div>
                  <SimpleModel3DViewer
                    taskResult={taskStatus}
                  />
                </CardContent>
              </Card>
            )}

            {/* OBJ format */}
            {taskStatus.model_urls.obj && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>OBJ Format</span>
                    <Badge variant="outline">Basic</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {taskStatus.model_urls.obj}
                    </code>
                  </div>
                  <SimpleModel3DViewer
                    taskResult={taskStatus}
                  />
                </CardContent>
              </Card>
            )}

            {/* Thumbnail and Video */}
            <Card>
              <CardHeader>
                <CardTitle>Other Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskStatus.thumbnail_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">Thumbnail:</p>
                    <img
                      src={taskStatus.thumbnail_url}
                      alt="Model thumbnail"
                      className="max-w-sm rounded-lg border"
                    />
                  </div>
                )}

                {taskStatus.video_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">Preview Video:</p>
                    <video
                      src={taskStatus.video_url}
                      controls
                      className="max-w-sm rounded-lg border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
