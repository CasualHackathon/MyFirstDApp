import React from 'react'

export function Card(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`card ${props.className ?? ''}`.trim()}>{props.children}</div>
}

export function Button(
  { className, variant = 'primary', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' }
) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-outline'
  return <button className={`${base} ${className ?? ''}`.trim()} {...rest} />
}

export function Badge({ children, color }: { children: React.ReactNode, color: 'green' | 'yellow' | 'gray' }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />
}

export function Modal(
  { open, onClose, title, children }:
  { open: boolean, onClose: () => void, title?: React.ReactNode } & React.PropsWithChildren
) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-3xl max-h-[85vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 shrink-0">
          <div className="font-semibold">{title}</div>
          <button className="btn-outline" onClick={onClose}>關閉</button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
