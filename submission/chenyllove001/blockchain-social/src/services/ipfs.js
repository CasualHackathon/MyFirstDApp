import { create } from 'ipfs-http-client'

// 连接到公共IPFS网关
const client = create({
  url: 'https://rpc.filebase.io',
  headers: {
    Authorization: `Bearer QjlGOTYxODcwOUU1NjI2QTM5QTc6Z2FvaHBNWWFDdkkzdDdSaTdkeWNEeEFna1B5VXpHd2s2YjdKd0V0cjpjaGVueWxpbWFnZXM=`
  }
})

export default {
  async upload(file) {
    try {
      const result = await client.add(file)
      return `https://united-blush-felidae.myfilebase.com/ipfs/${result.cid}`
    } catch (error) {
      console.error("IPFS上传失败:", error)
      return null
    }
  }
}
