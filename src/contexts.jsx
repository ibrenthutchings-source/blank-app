import React from 'react'
import { POLICIES as INITIAL_POLICIES } from './data'

// Toast context
export const ToastContext = React.createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])
  const push = React.useCallback((t) => {
    const id = Math.random().toString(36).slice(2)
    const toast = typeof t === 'string' ? { msg: t } : t
    setToasts(ts => [...ts, { id, ...toast }])
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), toast.duration || 3600)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div style={{ position:'fixed', right:16, top:60, zIndex:100, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} className="lr-toast" style={{
            pointerEvents:'auto', display:'flex', alignItems:'flex-start', gap:10,
            padding:'10px 14px', minWidth:260, maxWidth:360,
            background:'var(--bg-2)', border:'1px solid var(--line-2)',
            borderLeft:'2px solid '+(t.tone==='ok'?'var(--ok)':t.tone==='crit'?'var(--crit)':t.tone==='warn'?'var(--warn)':'var(--accent)'),
            borderRadius:6, fontSize:12.5, color:'var(--fg-0)',
            boxShadow:'0 8px 24px rgba(0,0,0,.4)',
            animation:'lr-toast-in .2s ease-out',
          }}>
            <div style={{flex:1}}>
              {t.title && <div style={{fontWeight:500,marginBottom:2}}>{t.title}</div>}
              <div style={{color:t.title?'var(--fg-2)':'var(--fg-0)'}}>{t.msg}</div>
              {t.hash && <div className="mono" style={{fontSize:11,color:'var(--fg-3)',marginTop:4}}>{t.hash}</div>}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes lr-toast-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() { return React.useContext(ToastContext) }

// Policy context
export const PolicyContext = React.createContext(null)

export function PolicyProvider({ children }) {
  const [policies, setPolicies] = React.useState(INITIAL_POLICIES)
  return (
    <PolicyContext.Provider value={{ policies, setPolicies }}>
      {children}
    </PolicyContext.Provider>
  )
}

export function usePolicies() { return React.useContext(PolicyContext) }
