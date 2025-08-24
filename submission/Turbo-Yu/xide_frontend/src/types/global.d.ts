declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isCoinbaseWallet?: boolean
      isTrust?: boolean
      isImToken?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (eventName: string, callback: (...args: any[]) => void) => void
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void
    }
  }
}

export {}