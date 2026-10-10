import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const Ctx = createContext<(msg: string) => void>(() => {})
export const useErrorDialog = () => useContext(Ctx)

// Win95 error box. Native <dialog>: top layer above the ads, Esc closes, focus moves to OK.
export function ErrorDialogProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [msg, setMsg] = useState('')
  const show = useCallback((m: string) => {
    setMsg(m)
    if (ref.current && !ref.current.open) ref.current.showModal()
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      <dialog ref={ref} className="dialog window" role="alertdialog" aria-labelledby="err-title" aria-describedby="err-msg">
        <div className="titlebar"><span id="err-title">LINKEDIN caused an error</span></div>
        <div className="dialog-body">
          <div className="dialog-icon" aria-hidden="true">X</div>
          <div>
            <p id="err-msg">{msg}</p>
            <form method="dialog" className="buttons"><button className="default">OK</button></form>
          </div>
        </div>
      </dialog>
    </Ctx.Provider>
  )
}
