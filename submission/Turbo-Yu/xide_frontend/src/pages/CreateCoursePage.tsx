import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCourse } from '../lib/apiClient'

interface CreateCoursePayload {
  title: string
  instructor: string
  value: number
  live_time: string
  category: string
  description: string
  cover_image?: string
}

/**
 * 课程创建页面
 * 通过 HTTP POST 调用后端 /api/courses 创建新课程
 */
export function CreateCoursePage() {
  const navigate = useNavigate()
  const [payload, setPayload] = useState<CreateCoursePayload>({
    title: '',
    instructor: '',
    value: 0,
    live_time: new Date().toISOString(),
    category: '',
    description: '',
    cover_image: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const updateField = (field: keyof CreateCoursePayload, value: string) => {
    setPayload(prev => ({
      ...prev,
      [field]: field === 'value' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setSubmitting(true)
    try {
      const body: CreateCoursePayload = {
        ...payload,
        cover_image: payload.cover_image || undefined
      }
      const result = await createCourse(body)
      setSuccessMsg('课程创建成功')
      // 可根据后端返回结果进行跳转或清空
      setTimeout(() => navigate('/'), 800)
      console.log('创建课程返回:', result)
    } catch (err: any) {
      setError(err?.message || '创建课程失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '24px'
    }}>
      <h1 style={{ marginBottom: '16px' }}>创建课程</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>填写课程信息并提交至后端进行创建。</p>

      {error && (
        <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>
      )}
      {successMsg && (
        <div style={{ color: 'green', marginBottom: '12px' }}>{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <label>
          标题
          <input
            required
            value={payload.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="智能合约开发实战"
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          讲师
          <input
            required
            value={payload.instructor}
            onChange={e => updateField('instructor', e.target.value)}
            placeholder="李教授"
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          价值（value）
          <input
            required
            type="number"
            step="0.01"
            value={payload.value}
            onChange={e => updateField('value', e.target.value)}
            placeholder="150"
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          开播时间（ISO）
          <input
            required
            type="datetime-local"
            value={new Date(payload.live_time).toISOString().slice(0,16)}
            onChange={e => updateField('live_time', new Date(e.target.value).toISOString())}
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          分类
          <input
            required
            value={payload.category}
            onChange={e => updateField('category', e.target.value)}
            placeholder="智能合约"
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          描述
          <textarea
            required
            value={payload.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder="深入学习智能合约的开发、部署和测试"
            style={{ width: '100%', padding: '8px', minHeight: '100px' }}
          />
        </label>

        <label>
          封面图片 URL（可选）
          <input
            value={payload.cover_image}
            onChange={e => updateField('cover_image', e.target.value)}
            placeholder="https://example.com/smart-contract.jpg"
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 16px',
              backgroundColor: '#646cff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {submitting ? '提交中...' : '创建课程'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#eee',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            返回首页
          </button>
        </div>
      </form>
    </div>
  )
}


