import React from 'react'
import { HiMenuAlt4 } from 'react-icons/hi'
import { BiSearch } from 'react-icons/bi'
import { IoIosNotificationsOutline } from 'react-icons/io'

const Navbar = () => {
  return (
    <div className='w-full flex px-2 py-8 justify-between bg-gradient-to-r from-[#ffb199] via-[#ff0844] to-[#ffb199] rounded-[20px] shadow-md mb-6'>
      <HiMenuAlt4 className='text-white text-3xl cursor-pointer drop-shadow' />
      <div className='flex-1 flex place-content-end gap-[30px]'>
        <BiSearch className='text-white text-3xl cursor-pointer drop-shadow' />
        <IoIosNotificationsOutline className='text-white text-3xl cursor-pointer drop-shadow' />
      </div>
    </div>
  )
}

export default Navbar
