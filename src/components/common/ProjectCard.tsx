import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { ArrowRight, ArrowUpRight, Boxes, BrainCircuit, Layers3, ScanLine, Waves, Wind } from 'lucide-react'
import type { Project } from '../../data/profile'
import { TechTag } from './TechTag'
import { isSceneKind, type SceneKind } from '../scenes/sceneData'

export function ProjectCard({
  project,
  onOpen,
  onScene,
}: {
  project: Project
  onOpen: (project: Project) => void
  onScene: (kind: SceneKind) => void
}) {
  const { t } = usePreferences()
  const { projectPresentation } = useContent()
  const presentation = projectPresentation[project.id]
  const Icon =
    {
      earthwork: Layers3,
      uav: ScanLine,
      scholardog: BrainCircuit,
      'offshore-wind': Wind,
      'water-twin': Waves,
      'micro-frontend': Boxes,
    }[project.id] ?? Layers3
  return (
    <article className={`project-card accent-${presentation.accent}`}>
      <div
        className="project-diagram"
        aria-label={`${presentation.label}: ${presentation.stages.join(' / ')}`}
      >
        <div className="diagram-caption">
          <span>{presentation.label}</span>
          <span>{project.index} / SYSTEM</span>
        </div>
        <div className="diagram-icon">
          <Icon size={42} strokeWidth={1} aria-hidden="true" />
        </div>
        <div className="diagram-stages">
          {presentation.stages.map((stage, index) => (
            <span key={stage}>
              <span>{stage}</span>
              {index < 2 && <ArrowRight size={14} aria-hidden="true" />}
            </span>
          ))}
        </div>
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span>CASE / {project.index}</span>
          <span>{project.type}</span>
        </div>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="tech-tags">
          {project.technologies.slice(0, 5).map((tech) => (
            <TechTag key={tech}>{tech}</TechTag>
          ))}
        </div>
        {isSceneKind(project.id) && (
          <button
            type="button"
            className="project-scene-link"
            onClick={() => {
              if (isSceneKind(project.id)) onScene(project.id)
            }}
            aria-label={t('体验{name}模拟三维场景', { name: project.name })}
          >
            <Boxes size={15} /> {t('体验三维模拟')} <ArrowUpRight size={14} />
          </button>
        )}
        <button
          type="button"
          className="text-button"
          onClick={() => onOpen(project)}
          aria-label={t('查看{name}详情', { name: project.name })}
        >
          {' '}
          {t('查看项目详情')}{' '}
          <span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </button>
      </div>
    </article>
  )
}
