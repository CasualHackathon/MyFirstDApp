'use client';

import { useState } from 'react';
import { TGeneratePage } from '@/components/generation/TGeneratePage';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export default function GeneratePage() {
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);

  const handleTaskCreated = (taskId: string) => {
    setGeneratedTasks(prev => [...prev, taskId]);
  };

  return (
    <LayoutWrapper defaultLayout="tStyle">
      <TGeneratePage onTaskCreated={handleTaskCreated} />
    </LayoutWrapper>
  );
}