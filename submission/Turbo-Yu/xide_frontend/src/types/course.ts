/**
 * 课程类型定义
 */
export interface Course {
    id: string
    title: string
    description: string
    points: number // 课程价值积分
    duration: string // 课程时长
    rating: number // 评分 (1-5)
    likes: number // 点赞数
    imageUrl?: string // 课程图片
    category: string // 课程分类
    instructor: string // 讲师
    createdAt: string // 创建时间
    updatedAt: string // 更新时间
  }
  
  /**
   * 课程分类
   */
  export interface CourseCategory {
    id: string
    name: string
    description: string
    icon: string
  }
  
  /**
   * 用户积分余额
   */
  export interface UserPoints {
    balance: number
    earned: number
    spent: number
  }