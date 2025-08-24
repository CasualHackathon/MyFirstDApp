'use client';

import { useState, useEffect } from 'react';
import { SimpleModel3DViewer } from './SimpleModel3DViewer';
import { TaskStatusResponse } from '@/shared/meshy/types';

interface ClientSideModel3DViewerProps {
  taskResult: TaskStatusResponse;
  className?: string;
  autoDownload?: boolean;
  hideBottomInfo?: boolean;
  textureTaskId?: string | null;
}

export function ClientSideModel3DViewer({ taskResult, className, autoDownload, hideBottomInfo, textureTaskId }: ClientSideModel3DViewerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-96 bg-muted/50 rounded-lg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-muted-foreground">Initializing 3D viewer...</span>
        </div>
      </div>
    );
  }

  return <SimpleModel3DViewer taskResult={taskResult} className={className} hideBottomInfo={hideBottomInfo} textureTaskId={textureTaskId} />;
}
