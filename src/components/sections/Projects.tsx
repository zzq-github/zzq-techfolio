import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { useState } from 'react'
import { ProjectCard } from '../common/ProjectCard'
import { ProjectDialog } from '../common/ProjectDialog'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { SceneLab } from '../scenes/SceneLab'
import type { SceneKind } from '../scenes/sceneData'
import { ArrowUpRight } from 'lucide-react'

export function Projects() {
  const { t } = usePreferences()
  const { projects } = useContent()
  const [selectedId, setSelected] = useState<string | null>(null)
  const selected = projects.find((project) => project.id === selectedId)
  const [scene, setScene] = useState<SceneKind>('earthwork')
  const openScene = (kind: SceneKind) => {
    setScene(kind)
    requestAnimationFrame(() => {
      const lab = document.getElementById('scene-lab')
      lab?.focus({ preventScroll: true })
      lab?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      })
    })
  }
  return (
    <section className="section" id="projects">
      <Reveal>
        <SectionTitle
          index="02"
          eyebrow="SELECTED WORK / 06 PROJECTS"
          title={t('真实业务，真实构建。')}
          description={t('用技术回应具体问题。从空间数据到业务系统，从智能交互到工程交付。')}
        />
      </Reveal>
      <div className="projects-grid featured-projects">
        {projects.slice(0, 2).map((project, index) => (
          <Reveal key={project.id} delay={index * 0.06}>
            <ProjectCard
              project={project}
              featured
              onOpen={(item) => setSelected(item.id)}
              onScene={openScene}
            />
          </Reveal>
        ))}
      </div>
      <SceneLab selected={scene} onSelect={setScene} />
      <div className="work-group-heading">
        <h3>{t('更多工程实践')}</h3>
        <span>AI / ENERGY / DIGITAL TWIN / ARCHITECTURE</span>
      </div>
      <div className="projects-grid supporting-projects">
        {projects.slice(2).map((project, index) => (
          <Reveal key={project.id} delay={(index % 2) * 0.06}>
            <ProjectCard project={project} onOpen={(item) => setSelected(item.id)} onScene={openScene} />
          </Reveal>
        ))}
      </div>
      <div className="campus-callout">
        <div>
          <p className="card-kicker">CAMPUS EXPLORER / {t('概念演示')}</p>
          <h3>{t('园区三维 · 超图相关能力演示')}</h3>
          <p>{t('以概念园区展示建筑查询、图层管理、楼层剖切和日照示意，预留后续实景三维数据接入。')}</p>
        </div>
        <button type="button" className="project-scene-link" onClick={() => openScene('campus')}>
          {t('探索园区场景')}
          <ArrowUpRight size={16} />
        </button>
      </div>
      {selected && <ProjectDialog project={selected} onClose={() => setSelected(null)} onScene={openScene} />}
    </section>
  )
}
