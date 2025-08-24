const WrongNetworkMessage = () => <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3 bg-gradient-to-br from-[#ffb199] via-[#ff0844] to-[#ffb199] p-10 rounded-[30px] shadow-2xl text-white'>
  {/* Prompt to change network to sepolia */}
  <div className='w-full text-center text-[#fff0e0]'>----------------------------------------</div>
  <div className='text-3xl font-extrabold drop-shadow'>Please connect to the Sepolia Testnet</div>
  <div className='text-xl font-medium'>and reload the page</div>
  <div className='w-full text-center text-[#fff0e0]'>----------------------------------------</div>
</div>

export default WrongNetworkMessage