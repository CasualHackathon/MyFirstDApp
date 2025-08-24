import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Web3 新手友善的 DApp 體驗平台
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            提供 Web3 新手一個無需花費真金白銀即可體驗 DApp 常見功能的平台
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Wallet Simulation Card */}
            <Link href="/wallet" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-blue-200 group-hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">錢包模擬</h3>
                  <p className="text-gray-600 mb-6">
                    學習錢包建立、轉帳、收款流程，熟悉基本操作
                  </p>
                  <div className="text-blue-600 font-semibold group-hover:text-blue-700">
                    開始體驗 →
                  </div>
                </div>
              </div>
            </Link>

            {/* DeFi Experience Card */}
            <Link href="/defi" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-green-200 group-hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">DeFi 體驗</h3>
                  <p className="text-gray-600 mb-6">
                    真實合約互動：代幣交換、質押挖礦、流動性提供
                  </p>
                  <div className="text-green-600 font-semibold group-hover:text-green-700">
                    開始體驗 →
                  </div>
                </div>
              </div>
            </Link>

            {/* NFT Experience Card */}
            <Link href="/nft" className="group">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-purple-200 group-hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">NFT 功能</h3>
                  <p className="text-gray-600 mb-6">
                    NFT 鑄造、上架、轉移等完整 NFT 生態體驗
                  </p>
                  <div className="text-purple-600 font-semibold group-hover:text-purple-700">
                    開始體驗 →
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            🚀 這是一個教學用的 DApp，專為 Web3 新手設計
          </p>
          <p className="text-sm text-gray-500 mt-2">
            安全體驗，無需真實資金風險
          </p>
        </div>
      </footer>
    </div>
  );
}
