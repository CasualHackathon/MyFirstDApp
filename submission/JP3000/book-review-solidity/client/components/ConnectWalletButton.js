const ConnectWalletButton = ({connectWallet}) =>
  <button
    className='h-[5rem] text-2xl font-bold py-3 px-12 bg-gradient-to-r from-[#ffb199] via-[#ff0844] to-[#ffb199] text-white rounded-[20px] mb-10 hover:scale-105 transition duration-500 ease-in-out shadow-lg'
    // Add an onClick functionality
    onClick={connectWallet}
  >
    Connect Wallet
  </button>

export default ConnectWalletButton