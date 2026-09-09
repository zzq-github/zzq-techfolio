import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Boxes, X } from 'lucide-react'
import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import type { Project } from '../../data/profile'
import { isSceneKind, type SceneKind } from '../scenes/sceneData'
import { TechTag } from './TechTag'
import './project-contributions.css'

export function ProjectDialog({
  project,
  onClose,
  onScene,
}: {
  project: Project
  onClose: () => void
  onScene: (kind: SceneKind) => void
}) {
  const { t } = usePreferences()
  const { projectPresentation } = useContent()
  const presentation = projectPresentation[project.id]
  const contribution = project.contribution
  const dialog = useRef<HTMLDialogElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closingRef = useRef(false)
  const [closing, setClosing] = useState(false)
  useLayoutEffect(() => {
    const node = dialog.current!
    const opener = document.activeElement as HTMLElement | null
    node.showModal()
    document.body.classList.add('modal-open')
    return () => {
      if (timer.current) clearTimeout(timer.current)
      document.body.classList.remove('modal-open')
      if (node.open) node.close()
      opener?.focus({ preventScroll: true })
    }
  }, [])
  const close = (scene?: SceneKind) => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    const finish = () => {
      onClose()
      if (scene) requestAnimationFrame(() => onScene(scene))
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish()
    else timer.current = setTimeout(finish, 160)
  }
  return (
    <dialog
      ref={dialog}
      className="project-modal"
      data-closing={closing || undefined}
      aria-labelledby="project-modal-title"
      aria-describedby="project-modal-description"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          close()
      }}
    >
      <button type="button" className="modal-close" onClick={() => close()} aria-label={t('关闭项目详情')}>
        <X aria-hidden="true" />
      </button>
      <p className="card-kicker">
        CASE {project.index} / {presentation.label}
      </p>
      <h2 id="project-modal-title">{project.name}</h2>
      <div className="modal-section">
        <h3>
          <span>01</span>
          {t('业务场景')}
        </h3>
        <p id="project-modal-description" className="modal-summary">
          {project.description}
        </p>
      </div>
      {contribution ? (
        <>
          <section className="modal-section case-contribution" aria-labelledby="case-role-heading">
            <h3 id="case-role-heading">
              <span>02</span>
              {t('我的职责')}
            </h3>
            <p className="case-role">{contribution.role}</p>
          </section>
          <section className="modal-section case-contribution" aria-labelledby="case-challenges-heading">
            <h3 id="case-challenges-heading">
              <span>03</span>
              {t('关键问题与实现')}
            </h3>
            <div className="case-challenges">
              {contribution.challenges.map((challenge) => (
                <div className="case-challenge" key={challenge.problem}>
                  <h4>{challenge.problem}</h4>
                  <p>{challenge.implementation}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="modal-section case-contribution" aria-labelledby="case-deliverables-heading">
            <h3 id="case-deliverables-heading">
              <span>04</span>
              {t('交付内容')}
            </h3>
            <ul className="case-deliverables">
              {contribution.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="case-disclosure">{contribution.disclosure}</p>
          </section>
        </>
      ) : (
        <div className="modal-section">
          <h3>
            <span>02</span>
            {t('核心工作')}
          </h3>
          <ul>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="modal-section">
        <h3>
          <span>{contribution ? '05' : '03'}</span>
          {t('技术路径')}
        </h3>
        <ol className="case-workflow">
          {presentation.stages.map((stage, index) => (
            <li key={stage}>
              <span>{stage}</span>
              {index < presentation.stages.length - 1 && <ArrowRight size={15} aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <div className="tech-tags">
          {project.technologies.map((tech) => (
            <TechTag key={tech}>{tech}</TechTag>
          ))}
        </div>
      </div>
      {isSceneKind(project.id) && (
        <div className="modal-scene-entry">
          <div>
            <strong>{t('在三维场景中探索')}</strong>
            <p>{t('模拟演示 / 非项目实景')}</p>
          </div>
          <button
            type="button"
            className="button ghost"
            onClick={() => {
              if (isSceneKind(project.id)) close(project.id)
            }}
          >
            <Boxes size={17} aria-hidden="true" />
            {t('体验三维模拟')}
          </button>
        </div>
      )}
      <div className="modal-bottom">ENGINEERING / {project.technologies[0]}</div>
    </dialog>
  )
}
