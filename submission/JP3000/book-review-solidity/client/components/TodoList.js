import Navbar from './Navbar'
import { IoMdAddCircle } from 'react-icons/io'
import Task from './Task'

const TodoList = ({tasks, input, setInput, addTask, deleteTask}) => <div className='w-[70%] bg-gradient-to-br from-[#ffb199] via-[#ff0844] to-[#ffb199] py-4 px-9 rounded-[30px] shadow-2xl overflow-y-scroll'>
  <Navbar />
  <h2 className='text-4xl bolder text-white pb-8 drop-shadow'>
    Hello Solidity Developer!
  </h2>
  <div className='py-3 text-[#fff0e0] font-semibold tracking-wider'>TODAY&apos;S TASKS</div>
  <form className='flex items-center justify-center' onSubmit={addTask}>
    <input
      className='rounded-[10px] w-full p-[10px] border-none outline-none bg-[#fff0e0] text-[#ff0844] mb-[10px] placeholder-[#ff0844] font-medium'
      placeholder='Add a task for today...'
      value={input}
      onChange={e => setInput(e.target.value)}
    />
    <button type="submit" className="bg-transparent border-none p-0 m-0">
      <IoMdAddCircle
        className='text-white text-[50px] cursor-pointer ml-[20px] mb-[10px] drop-shadow'
      />
    </button>
  </form>
  <ul>
    {/* Loop through all tasks here using the Task component */}
    {tasks.map(items => ( 
      <Task 
        key={items.id}
        taskText={items.taskText}
        // onClick delete task
        onClick={deleteTask(items.id)}
      />
    ))}
  </ul>
</div>

export default TodoList