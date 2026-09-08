import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { projects, type Project } from '../../data/profile'
import { ProjectCard } from '../common/ProjectCard'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'
import { SceneLab } from '../scenes/SceneLab'
import type { SceneKind } from '../scenes/sceneData'

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  const [scene, setScene] = useState<SceneKind>('earthwork')
  const openScene = (kind: SceneKind) => {
    setScene(kind)
    const lab = document.getElementById('scene-lab')
    lab?.focus({ preventScroll: true })
    lab?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    })
  }
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const node = dialog.current
    if (!selected || !node) return
    node.showModal()
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
      if (node.open) node.close()
      opener.current?.focus()
    }
  }, [selected])
  const openProject = (project: Project) => {
    opener.current = document.activeElement as HTMLElement
    setSelected(project)
  }
  return (
    <section className="section" id="projects">
      <Reveal>
        <SectionTitle
          index="02"
          eyebrow="SELECTED WORK / 06 PROJECTS"
          title="真实业务，真实构建。"
          description="用技术回应具体问题。从空间数据到业务系统，从智能交互到工程交付。"
        />
      </Reveal>
      <SceneLab selected={scene} onSelect={setScene} />
      <div className="projects-grid">
        {projects.map((project) => (
          <Reveal key={project.id}>
            <ProjectCard project={project} onOpen={openProject} onScene={openScene} />
          </Reveal>
        ))}
      </div>
      {selected && (
        <dialog
          ref={dialog}
          className="project-modal"
          aria-labelledby="project-modal-title"
          aria-describedby="project-modal-description"
          onCancel={() => setSelected(null)}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return
            const box = event.currentTarget.getBoundingClientRect()
            if (
              event.clientX < box.left ||
              event.clientX > box.right ||
              event.clientY < box.top ||
              event.clientY > box.bottom
            )
              setSelected(null)
          }}
        >
          <button
            type="button"
            className="modal-close"
            onClick={() => setSelected(null)}
            aria-label="关闭项目详情"
          >
            <X aria-hidden="true" />
          </button>
          <p className="card-kicker">
            CASE {selected.index} / {selected.type}
          </p>
          <h2 id="project-modal-title">{selected.name}</h2>
          <p id="project-modal-description" className="modal-summary">
            {selected.description}
          </p>
          <h3>核心工作</h3>
          <ul>
            {selected.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="tech-tags">
            {selected.technologies.map((tech) => (
              <TechTag key={tech}>{tech}</TechTag>
            ))}
          </div>
          <div className="modal-bottom">ENGINEERING / {selected.technologies[0]}</div>
        </dialog>
      )}
    </section>
  )
}
