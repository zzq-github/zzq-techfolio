import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { usePreferences } from '../../preferences/context'

export function CopyEmail({ email }: { email: string }) {
  const { t } = usePreferences()
  const [state, setState] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])
  const copy = async () => {
    if (timer.current) clearTimeout(timer.current)
    setState('pending')
    try {
      await navigator.clipboard.writeText(email)
      if (mounted.current) setState('copied')
    } catch {
      if (mounted.current) setState('error')
    }
    if (mounted.current) timer.current = setTimeout(() => setState('idle'), 5000)
  }
  return (
    <div className="copy-email">
      <div className="email-address-row">
        <a href={`mailto:${email}`}>{email}</a>
        <button
          type="button"
          className="copy-email-button"
          onClick={copy}
          disabled={state === 'pending'}
          aria-label={t('复制邮箱')}
        >
          {state === 'copied' ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          <span>{state === 'copied' ? t('已复制') : t('复制邮箱')}</span>
        </button>
      </div>
      <p className="copy-status" role="status" aria-live="polite">
        {state === 'copied'
          ? t('邮箱已复制，可以粘贴到邮件应用。')
          : state === 'error'
            ? t('暂时无法复制，请选择邮箱地址手动复制，或点击发送邮件。')
            : ''}
      </p>
    </div>
  )
}
