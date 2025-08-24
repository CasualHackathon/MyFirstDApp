import { create } from 'ipfs-http-client'

// IPFS配置
const IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + btoa(process.env.VUE_APP_INFURA_PROJECT_ID + ':' + process.env.VUE_APP_INFURA_PROJECT_SECRET)
  }
}

// 创建IPFS客户端
const ipfs = create(IPFS_CONFIG)

/**
 * IPFS服务类
 * 提供文件上传、下载、JSON数据存储等功能
 */
export class IPFSService {
  
  /**
   * 上传文件到IPFS
   * @param file 要上传的文件
   * @returns IPFS哈希
   */
  static async uploadFile(file: File): Promise<string> {
    try {
      const result = await ipfs.add(file)
      return result.path
    } catch (error) {
      console.error('上传文件到IPFS失败:', error)
      throw new Error('文件上传失败')
    }
  }

  /**
   * 上传JSON数据到IPFS
   * @param data JSON数据
   * @returns IPFS哈希
   */
  static async uploadJSON(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data)
      const result = await ipfs.add(jsonString)
      return result.path
    } catch (error) {
      console.error('上传JSON到IPFS失败:', error)
      throw new Error('数据上传失败')
    }
  }

  /**
   * 从IPFS获取JSON数据
   * @param hash IPFS哈希
   * @returns JSON数据
   */
  static async getJSON(hash: string): Promise<any> {
    try {
      const chunks = []
      for await (const chunk of ipfs.cat(hash)) {
        chunks.push(chunk)
      }
      const data = Buffer.concat(chunks).toString()
      return JSON.parse(data)
    } catch (error) {
      console.error('从IPFS获取JSON失败:', error)
      throw new Error('数据获取失败')
    }
  }

  /**
   * 从IPFS获取文件
   * @param hash IPFS哈希
   * @returns 文件数据
   */
  static async getFile(hash: string): Promise<ArrayBuffer> {
    try {
      const chunks = []
      for await (const chunk of ipfs.cat(hash)) {
        chunks.push(chunk)
      }
      return Buffer.concat(chunks)
    } catch (error) {
      console.error('从IPFS获取文件失败:', error)
      throw new Error('文件获取失败')
    }
  }

  /**
   * 获取IPFS网关URL
   * @param hash IPFS哈希
   * @returns 网关URL
   */
  static getGatewayURL(hash: string): string {
    return `https://ipfs.io/ipfs/${hash}`
  }

  /**
   * 上传任务详情到IPFS
   * @param taskData 任务数据
   * @returns IPFS哈希
   */
  static async uploadTaskDetails(taskData: {
    title: string
    description: string
    requirements: string[]
    attachments?: string[]
    category: string
    tags: string[]
  }): Promise<string> {
    const taskDetails = {
      ...taskData,
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
    return await this.uploadJSON(taskDetails)
  }

  /**
   * 上传任务提交内容到IPFS
   * @param submissionData 提交数据
   * @returns IPFS哈希
   */
  static async uploadTaskSubmission(submissionData: {
    description: string
    files: string[]
    links: string[]
    notes: string
  }): Promise<string> {
    const submission = {
      ...submissionData,
      submittedAt: new Date().toISOString(),
      version: '1.0'
    }
    return await this.uploadJSON(submission)
  }

  /**
   * 上传用户资料到IPFS
   * @param profileData 用户资料数据
   * @returns IPFS哈希
   */
  static async uploadUserProfile(profileData: {
    username: string
    avatar: string
    bio: string
    skills: string[]
    portfolio: string[]
  }): Promise<string> {
    const profile = {
      ...profileData,
      updatedAt: new Date().toISOString(),
      version: '1.0'
    }
    return await this.uploadJSON(profile)
  }
}

/**
 * 任务数据结构
 */
export interface TaskData {
  title: string
  description: string
  requirements: string[]
  attachments?: string[]
  category: string
  tags: string[]
  bounty: string
  deadline: string
  exp: string
}

/**
 * 任务提交数据结构
 */
export interface TaskSubmission {
  description: string
  files: string[]
  links: string[]
  notes: string
}

/**
 * 用户资料数据结构
 */
export interface UserProfile {
  username: string
  avatar: string
  bio: string
  skills: string[]
  portfolio: string[]
}

export default IPFSService
