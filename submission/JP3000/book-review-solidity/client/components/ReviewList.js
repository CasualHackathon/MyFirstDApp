export default function ReviewList({ reviews, onDelete, onVote, currentAccount }) {
  if (!reviews.length) return <div className="text-gray-400 text-center mt-8">暂无书评</div>
  return (
    <ul className="flex flex-col gap-4">
      {reviews.map(r => (
        <li key={r.id} className="db-card flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--douban-light-green)] text-[var(--douban-green)] font-bold text-lg">
              {r.bookId && r.bookId[0] ? r.bookId[0].toUpperCase() : (r.bookName && r.bookName[0] ? r.bookName[0].toUpperCase() : '书')}
            </div>
            <div className="text-sm text-gray-500">书名: {r.bookName || r.bookId}</div>
          </div>
          <div className="text-base mb-2" style={{lineHeight:1.7}}>{r.comment}</div>
          <div className="db-divider" />
          <div className="flex items-center gap-4 text-sm">
            <span style={{color:'#888'}}>👍 {r.upvotes}</span>
            <span style={{color:'#888'}}>👎 {r.downvotes}</span>
            {r.rewarded && <span className="text-green-600">已获奖励</span>}
            {r.isDeleted && <span className="text-red-500">已删除</span>}
            {!r.isDeleted && r.owner === currentAccount && (
              <button className="db-btn" style={{background:'#fff',color:'#e74c3c',border:'1px solid #e74c3c'}} onClick={() => onDelete(r.id)}>
                删除
              </button>
            )}
            {!r.isDeleted && r.owner !== currentAccount && (
              <>
                <button className="db-btn" style={{marginRight:4}} onClick={() => { console.log('click upvote', r.id); onVote(r.id, true) }}>点赞</button>
                <button className="db-btn" style={{background:'#fff',color:'#888',border:'1px solid #ddd'}} onClick={() => { console.log('click downvote', r.id); onVote(r.id, false) }}>点踩</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
