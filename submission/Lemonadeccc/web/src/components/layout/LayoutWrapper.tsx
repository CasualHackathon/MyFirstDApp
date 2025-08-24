'use client';

import { ReactNode } from 'react';
import TLayout from './tLayout';

interface LayoutWrapperProps {
  children: ReactNode;
  defaultLayout?: 'tStyle';
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <TLayout showNavigation={true}>
      {children}
    </TLayout>
  );
}