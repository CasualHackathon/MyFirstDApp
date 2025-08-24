import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Course, CourseCategory } from '../types/course'
import { CourseCard } from './CourseCard'
import { WalletConnect } from './WalletConnect'

interface CourseListProps {
  courses: Course[]
  categories: CourseCategory[]
  userPoints?: number
  onEnroll?: (courseId: string) => void
  onLike?: (courseId: string) => void
  /**
   * 放置在“钱包余额”右侧的操作区域（例如创建课程按钮）
   */
  rightActions?: ReactNode
}

/**
 * 课程列表页面组件
 */
export function CourseList({ 
  courses, 
  categories, 
  userPoints = 0,
  onEnroll, 
  onLike,
  rightActions
}: CourseListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'points' | 'likes'>('rating')
  /** 钱包余额（GO），来自 WalletConnect 回传 */
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  /** GO 对美元价格（USD/GO） */
  const [goUsdPrice, setGoUsdPrice] = useState<number | null>(null)

  // 过滤和排序课程
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses

    // 按分类过滤
    if (selectedCategory !== 'all') {
      const category = categories.find(cat => cat.id === selectedCategory)
      if (category) {
        filtered = filtered.filter(course => course.category === category.name)
      }
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'points':
          return a.points - b.points
        case 'likes':
          return b.likes - a.likes
        default:
          return 0
      }
    })

    return filtered
  }, [courses, categories, selectedCategory, searchTerm, sortBy])

  const handleEnroll = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course) {
      if (userPoints >= course.points) {
        onEnroll?.(courseId)
        alert(`成功报名课程：${course.title}`)
      } else {
        alert(`积分不足！需要 ${course.points} 积分，您当前有 ${userPoints} 积分`)
      }
    }
  }

  const handleLike = (courseId: string) => {
    onLike?.(courseId)
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* 页面标题 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#333',
          marginBottom: '10px'
        }}>
          📚 习得-教学相长
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          margin: '0'
        }}>
          Teaching is the best way to learn.
        </p>
      </div>

      {/* 钱包连接（回传余额/价格） */}
      <WalletConnect onBalanceChange={setWalletBalance} onPriceChange={setGoUsdPrice} />

      {/* 钱包余额展示 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>
            💼 钱包余额
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0a7d2c'
            }}>
              {walletBalance != null
                ? `GO：${parseFloat(walletBalance).toFixed(4)}（$${(parseFloat(walletBalance) * goUsdPrice).toFixed(4)}）`
                : '—'}
            </div>
            {rightActions}
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* 搜索框 */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="搜索课程、讲师..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* 分类筛选 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          <option value="all">全部分类</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>

        {/* 排序 */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            minWidth: '120px'
          }}
        >
          <option value="rating">按评分排序</option>
          <option value="points">按积分排序</option>
          <option value="likes">按点赞排序</option>
        </select>
      </div>

      {/* 分类标签 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 16px',
            border: selectedCategory === 'all' ? '2px solid #646cff' : '1px solid #ddd',
            borderRadius: '20px',
            backgroundColor: selectedCategory === 'all' ? '#646cff' : 'white',
            color: selectedCategory === 'all' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          全部
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              padding: '8px 16px',
              border: selectedCategory === category.id ? '2px solid #646cff' : '1px solid #ddd',
              borderRadius: '20px',
              backgroundColor: selectedCategory === category.id ? '#646cff' : 'white',
              color: selectedCategory === category.id ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* 课程统计 */}
      <div style={{
        marginBottom: '24px',
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        找到 {filteredAndSortedCourses.length} 门课程
        {selectedCategory !== 'all' && (
          <span>（{categories.find(cat => cat.id === selectedCategory)?.name}分类）</span>
        )}
      </div>

      {/* 课程网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {filteredAndSortedCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={handleEnroll}
            onLike={handleLike}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredAndSortedCourses.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ marginBottom: '8px' }}>没有找到相关课程</h3>
          <p>请尝试调整搜索条件或选择其他分类</p>
        </div>
      )}
    </div>
  )
}