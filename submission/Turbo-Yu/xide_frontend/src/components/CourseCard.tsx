import type { Course } from '../types/course'

interface CourseCardProps {
  course: Course
  onEnroll?: (courseId: string) => void
  onLike?: (courseId: string) => void
}

/**
 * 课程卡片组件（紧凑样式）
 * 展示课程封面、标题、描述、评分与操作按钮
 */
export function CourseCard({ course, onEnroll, onLike }: CourseCardProps) {
  const handleEnroll = () => {
    onEnroll?.(course.id)
  }

  const handleLike = () => {
    onLike?.(course.id)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffd700' : '#ddd' }}>
          ★
        </span>
      )
    }
    return stars
  }

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      padding: '12px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      width: '95%',
      flex: '1 0 22%',
      minWidth: '220px',
      '@media (maxWidth)': {
        '1200px': {
          flexBasis: '28%',
        },
        '900px': {
          flexBasis: '45%',
        },
        '600px': {
          flexBasis: '100%',
        }
      }
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
    }}
    >
      {/* 课程图片 */}
      <div style={{
        width: '100%',
        height: '140px',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '10px',
        backgroundColor: '#f5f5f5'
      }}>
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#999'
          }}>
            📚
          </div>
        )}
      </div>

      {/* 课程分类 */}
      <div style={{
        fontSize: '12px',
        color: '#666',
        marginBottom: '8px'
      }}>
        {course.category}
      </div>

      {/* 课程标题 */}
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#333',
        lineHeight: '1.3'
      }}>
        {course.title}
      </h3>

      {/* 课程描述 */}
      <p style={{
        fontSize: '13px',
        color: '#666',
        margin: '0 0 10px 0',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        height: '36.39px'
      }}>
        {course.description}
      </p>

      {/* 讲师信息 */}
      <div style={{
        fontSize: '13px',
        color: '#888',
        marginBottom: '12px'
      }}>
        讲师: {course.instructor}
      </div>

      {/* 课程信息行 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <span style={{
          fontSize: '13px',
          color: '#666'
        }}>
          ⏱️ {course.duration}
        </span>
        <span style={{
          fontSize: '13px',
          color: '#666'
        }}>
          💎 {course.points} 积分
        </span>
      </div>

      {/* 评分和点赞 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '14px' }}>
            {renderStars(course.rating)}
          </span>
          <span style={{
            fontSize: '13px',
            color: '#666',
            marginLeft: '4px'
          }}>
            {course.rating}
          </span>
        </div>
        <button
          onClick={handleLike}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            color: '#666'
          }}
        >
          👍 {course.likes}
        </button>
      </div>

      {/* 报名按钮 */}
      <button
        onClick={handleEnroll}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#646cff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#535bf2'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#646cff'
        }}
      >
        立即报名
      </button>
    </div>
  )
}