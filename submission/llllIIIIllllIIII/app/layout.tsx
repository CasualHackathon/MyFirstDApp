
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import Providers from './providers'
import Navigation from './components/Navigation'

export const metadata: Metadata = {
  title: 'MyFirstDapp - Web3 新手體驗平台',
  description: '為 Web3 新手提供安全的 Dapp 模擬體驗，包含錢包、DeFi、NFT 等功能',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}