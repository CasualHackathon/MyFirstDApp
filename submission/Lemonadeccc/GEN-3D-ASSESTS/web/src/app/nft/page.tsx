'use client';

import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { TNFTPage } from '@/components/nft';

export default function NFTPage() {
  return (
    <LayoutWrapper defaultLayout="tStyle">
      <TNFTPage />
    </LayoutWrapper>
  );
}