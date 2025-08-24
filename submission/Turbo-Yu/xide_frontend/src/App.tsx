import { useState, useEffect } from 'react'
import { CourseList } from './components/CourseList'
import { courseCategories } from './data/mockCourses'
import { fetchCourses } from './lib/apiClient'
import type { Course } from './types/course'
import './App.css'
import { Link } from 'react-router-dom'

/**
 * 顶部导航：创建研习课程按钮
 */
function CreateCourseNav() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '16px'
    }}>
      <Link
        to="/create-course"
        style={{
          padding: '10px 16px',
          backgroundColor: '#646cff',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      >
        创建研习课程
      </Link>
    </div>
  )
}

/**
 * 主应用组件
 * 展示课程列表页面
 */
function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPoints, setUserPoints] = useState(2000) // 模拟用户积分

  // 获取课程数据
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCourses()
        setCourses(data)
      } catch (err: any) {
        const errorMessage = err.message || '获取课程数据失败'
        setError(errorMessage)
        console.error('加载课程数据时出错:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  /**
   * 处理课程报名
   */
  const handleEnroll = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course) {
      // 扣除积分
      setUserPoints(prev => prev - course.points)
      
      // 这里可以添加报名逻辑，比如调用API
      console.log(`用户报名课程: ${course.title}`)
    }
  }

  /**
   * 处理课程点赞
   */
  const handleLike = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, likes: course.likes + 1 }
        : course
    ))
  }

  // 渲染加载状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red',
        padding: '20px'
      }}>
        <div>错误: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          重新加载
        </button>
      </div>
    )
  }

  return (
    <div className="App">
      <CourseList
        courses={courses}
        categories={courseCategories}
        rightActions={(
          <Link
            to="/create-course"
            style={{
              padding: '10px 16px',
              backgroundColor: '#646cff',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            创建研习课程
          </Link>
        )}
        userPoints={userPoints}
        onEnroll={handleEnroll}
        onLike={handleLike}
      />
    </div>
  )
}

export default App