import { useState } from 'react'

export default function AddReviewForm({ onAdd }) {
  const [bookName, setBookName] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (!bookName || !comment) return
    onAdd(bookName, comment)
    setBookName('')
    setComment('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="db-card flex flex-col gap-4 mb-6 p-6 mx-auto"
      style={{boxSizing:'border-box', maxWidth:'900px', width:'100%'}}>
      <div className="text-2xl font-bold mb-2" style={{color: 'var(--douban-green)'}}>发布书评</div>
      <input
        className="db-input text-lg h-12"
        placeholder="书名（如三体、活着等）"
        value={bookName}
        onChange={e => setBookName(e.target.value)}
      />
      <textarea
        className="db-textarea text-lg"
        style={{minHeight:'3.5em'}}
        placeholder="写下你的书评..."
        value={comment}
        rows={3}
        onChange={e => setComment(e.target.value)}
      />
      <button className="db-btn self-end mt-2 text-lg h-12 px-8" type="submit">
        发布书评
      </button>
    </form>
  )
}
