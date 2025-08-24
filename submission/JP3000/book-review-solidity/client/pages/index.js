
import WrongNetworkMessage from '../components/WrongNetworkMessage'
import AddReviewForm from '../components/AddReviewForm'
import ReviewList from '../components/ReviewList'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import ReviewAbi from '../../backend/build/contracts/ReviewContract.json'
import { ReviewContractAddress } from '../config.js'

/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/


export default function Home() {
  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')
  const [reviews, setReviews] = useState([])
  const [myReviewIds, setMyReviewIds] = useState([])
  const [selectedBookName, setSelectedBookName] = useState('')

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window
        if (!ethereum) return
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setIsUserLoggedIn(true)
          setCurrentAccount(accounts[0])
          let chainId = await ethereum.request({ method: 'eth_chainId' })
          const sepoliaChainId = '0xaa36a7'
          setCorrectNetwork(chainId === sepoliaChainId)
        }
      } catch (err) {
        console.error('check wallet', err)
      }
    }
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    if (isUserLoggedIn && correctNetwork) {
      fetchMyReviews()
    }
  }, [isUserLoggedIn, correctNetwork])

  // helper to convert ethers BigNumber or raw value to number
  const toNumber = v => {
    if (v === undefined || v === null) return 0
    if (typeof v === 'number') return v
    if (typeof v.toNumber === 'function') return v.toNumber()
    return Number(v)
  }

  // 连接钱包
  const connectWallet = async () => {
    console.log('connectWallet clicked')
    try {
      const { ethereum } = window
      console.log('window.ethereum present?', !!ethereum)
      if (!ethereum) {
        console.error('MetaMask not detected')
        alert('MetaMask 未检测到，请先安装或启用 MetaMask 扩展')
        return
      }
      // Request accounts
      let accounts
      try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      } catch (reqErr) {
        console.error('eth_requestAccounts failed', reqErr)
        alert('请求钱包授权被拒绝或失败，请检查 MetaMask')
        return
      }
      console.log('eth_requestAccounts result', accounts)
      if (!accounts || accounts.length === 0) {
        console.warn('No accounts returned')
        return
      }
      setIsUserLoggedIn(true)
      setCurrentAccount(accounts[0])
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      const sepoliaChainId = '0xaa36a7'
      if (chainId !== sepoliaChainId) {
        alert('你未连接到 Sepolia 测试网，请切换网络')
        setCorrectNetwork(false)
        return
      } else {
        setCorrectNetwork(true)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('连接钱包时发生错误，详情见控制台')
    }
  }

  // 断开钱包（前端清理状态）
  const disconnectWallet = async () => {
    try {
      // 前端清理登录状态，MetaMask 不支持通过网页主动完全断开连接
      setIsUserLoggedIn(false)
      setCurrentAccount('')
      setCorrectNetwork(false)
      setReviews([])
      setMyReviewIds([])
      setSelectedBookName('')
    } catch (err) {
      console.error('disconnect', err)
    }
  }

  // 获取当前用户的书评
  const fetchMyReviews = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          ReviewContractAddress,
          ReviewAbi.abi,
          signer
        )
        const data = await contract.getMyReviews()
        // r may be a struct object or tuple array; normalize and convert BigNumber -> number
        const parsed = data.map(r => ({
          id: toNumber(r.id ?? r[0]),
          bookName: r.bookId ?? r.bookName ?? r[1],
          comment: r.comment ?? r[2],
          isDeleted: r.isDeleted ?? r[3],
          upvotes: toNumber(r.upvotes ?? r[4]),
          downvotes: toNumber(r.downvotes ?? r[5]),
          rewarded: r.rewarded ?? r[6],
          owner: currentAccount
        }))
        setReviews(parsed)
        // 保存当前用户的书评 id 列表，供查询时隐藏点赞按钮使用
        setMyReviewIds(parsed.map(p => p.id))
        return parsed
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 获取某本书的所有书评
  const fetchReviewsByBook = async (bookName) => {
    if (!bookName) return
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          ReviewContractAddress,
          ReviewAbi.abi,
          signer
        )
        const data = await contract.getReviewsByBook(bookName)
        const parsed = data.map(r => {
          const id = toNumber(r.id ?? r[0])
          const isMine = myReviewIds.includes(id)
          return {
            id,
            bookName: r.bookId ?? r.bookName ?? r[1],
            comment: r.comment ?? r[2],
            isDeleted: r.isDeleted ?? r[3],
            upvotes: toNumber(r.upvotes ?? r[4]),
            downvotes: toNumber(r.downvotes ?? r[5]),
            rewarded: r.rewarded ?? r[6],
            owner: isMine ? currentAccount : null
          }
        })
        setReviews(parsed)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 添加书评
  const handleAddReview = async (bookName, comment) => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          ReviewContractAddress,
          ReviewAbi.abi,
          signer
        )
        const tx = await contract.addReview(bookName, comment)
        await tx.wait()
        fetchMyReviews()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 删除书评
  const handleDeleteReview = async (reviewId) => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          ReviewContractAddress,
          ReviewAbi.abi,
          signer
        )
        const tx = await contract.deleteReview(reviewId)
        await tx.wait()
        fetchMyReviews()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 点赞/点踩
  const handleVote = async (reviewId, isUpvote) => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.error('Ethereum object not found')
        return
      }
      console.log('Submitting vote', { reviewId, isUpvote })
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        ReviewContractAddress,
        ReviewAbi.abi,
        signer
      )
      const tx = await contract.vote(reviewId, isUpvote)
      console.log('Transaction sent, hash:', tx.hash)
      await tx.wait()
      console.log('Vote transaction confirmed')
      // 投票后刷新当前书籍或我的书评
      if (selectedBookName) {
        fetchReviewsByBook(selectedBookName)
      } else {
        fetchMyReviews()
      }
      return tx
    } catch (error) {
      console.error(error)
    }
  }

  // 书名输入框变化
  const handleBookNameChange = (e) => {
    setSelectedBookName(e.target.value)
  }

  // 查询某本书的书评
  const handleSearchBook = () => {
    fetchReviewsByBook(selectedBookName)
  }

  return (
    <div
      className="min-h-screen w-screen flex flex-col items-center bg-[#f7f7f7]"
      style={{minHeight:'100vh'}}
    >
      {/* 网站标题 */}
      {/* 顶部导航栏样式区 */}
      <div className="w-full flex justify-center mb-8 mt-8">
        <div className="db-card w-full max-w-5xl flex flex-col sm:flex-row items-center gap-4 p-4 flex-wrap" style={{boxSizing:'border-box'}}>
          <div className="flex-1 flex items-center justify-center sm:justify-start">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{color:'var(--douban-green)',letterSpacing:'0.08em'}}>好评图书</span>
          </div>
          <div className="flex-[3] w-full flex flex-col sm:flex-row gap-3 items-center min-w-0">
            <input
              className="db-input flex-1 text-lg h-12"
              style={{minWidth:0}}
              placeholder="输入书名，查询该书所有书评"
              value={selectedBookName}
              onChange={handleBookNameChange}
            />
            <button className="db-btn text-lg h-12 px-6" style={{background:'#888'}} onClick={handleSearchBook}>
              查询
            </button>
            <button className="db-btn text-lg h-12 px-6" style={{background:'#42bd56'}} onClick={fetchMyReviews}>
              我的书评
            </button>
            {/* Connect wallet in the top bar next to 我的书评 */}
            { !isUserLoggedIn ? (
              <button
                className='db-btn text-lg h-12 px-6 bg-gradient-to-r from-[#ffb199] via-[#ff0844] to-[#ffb199] text-white rounded-[8px]'
                onClick={connectWallet}
              >
                连接钱包
              </button>
            ) : (
              <div className="flex items-center gap-3" style={{minWidth:140}}>
                <div className="text-sm px-4 py-2 rounded-md bg-white shadow-inner truncate" style={{fontFamily:'monospace', maxWidth:180}}>
                  {currentAccount ? `${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}` : ''}
                </div>
                <button
                  className='db-btn text-sm h-10 px-4' style={{background:'#e45757', color:'#fff'}}
                  onClick={disconnectWallet}
                >
                  断开钱包
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="w-full max-w-3xl flex flex-col items-center justify-center flex-1">
        { !isUserLoggedIn ? (
          <div className="text-center text-gray-600 mb-6">请点击上方的“连接钱包”按钮连接钱包</div>
        ) : !correctNetwork ? (
          <WrongNetworkMessage />
        ) : (
          <>
            {/* 发布书评大标题 */}
            <div className="w-full flex flex-col items-center mb-2">
              <div className="text-2xl font-bold text-center mb-2" style={{color:'var(--douban-green)'}}></div>
            </div>
            <AddReviewForm onAdd={handleAddReview} />
            <ReviewList
              reviews={reviews}
              onDelete={handleDeleteReview}
              onVote={handleVote}
              currentAccount={currentAccount}
            />
          </>
        )}
      </main>
    </div>
  )
}