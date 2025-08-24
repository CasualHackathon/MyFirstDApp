import { BsFillTrashFill } from 'react-icons/bs'

const Task = ({taskText, onClick}) => {
  return (
    <div className='flex items-center text-white'>
      <div className='bg-gradient-to-r from-[#ffb199] via-[#ff0844] to-[#ffb199] text-white flex w-[70%] rounded-[15px] mb-[10px] flex-1 shadow-lg'>
        <div className='flex items-center justify-between w-full p-[20px] text-xl font-semibold drop-shadow'>
          {/* show taskText */}
          {taskText}
        </div>
      </div>
      <BsFillTrashFill
        className='text-2xl cursor-pointer ml-10 text-white hover:text-[#fff0e0] transition'
        onClick={onClick}
      />
    </div>
  )
}

export default Task
