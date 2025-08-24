import type { Course, CourseCategory } from '../types/course'

/**
 * 模拟课程分类数据
 */
export const courseCategories: CourseCategory[] = [
  {
    id: '1',
    name: '体育健身',
    description: '游泳、健身、瑜伽等运动课程',
    icon: '🏊‍♂️'
  },
  {
    id: '2',
    name: '数学',
    description: '初中数学、高中数学等',
    icon: '📐'
  },
  {
    id: '3',
    name: '语言学习',
    description: '英语、日语、韩语等',
    icon: '🗣️'
  },
  {
    id: '4',
    name: '编程技术',
    description: 'Web开发、移动开发等',
    icon: '💻'
  },
  {
    id: '5',
    name: '艺术设计',
    description: '绘画、设计、音乐等',
    icon: '🎨'
  }
]

/**
 * 模拟课程数据
 */
export const mockCourses: Course[] = [
  {
    id: '1',
    title: '游泳基础入门',
    description: '从零开始学习游泳，掌握基本技巧和安全知识',
    points: 500,
    duration: '2小时',
    rating: 4.8,
    likes: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
    category: '体育健身',
    instructor: '张教练',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: '初中数学代数基础',
    description: '系统学习初中代数知识，打好数学基础',
    points: 800,
    duration: '3小时',
    rating: 4.6,
    likes: 980,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    category: '数学',
    instructor: '李老师',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '3',
    title: '英语口语提升',
    description: '提升英语口语表达能力，增强交流信心',
    points: 600,
    duration: '2.5小时',
    rating: 4.9,
    likes: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
    category: '语言学习',
    instructor: 'Sarah老师',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  },
  {
    id: '4',
    title: 'React前端开发',
    description: '学习React框架，掌握现代前端开发技术',
    points: 1200,
    duration: '4小时',
    rating: 4.7,
    likes: 1560,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    category: '编程技术',
    instructor: '王工程师',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  },
  {
    id: '5',
    title: '水彩画基础',
    description: '学习水彩画基本技法，创作美丽画作',
    points: 400,
    duration: '1.5小时',
    rating: 4.5,
    likes: 720,
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    category: '艺术设计',
    instructor: '陈艺术家',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14'
  },
  {
    id: '6',
    title: '瑜伽入门',
    description: '学习基础瑜伽动作，提升身心健康',
    points: 300,
    duration: '1小时',
    rating: 4.4,
    likes: 890,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    category: '体育健身',
    instructor: '林老师',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16'
  }
]