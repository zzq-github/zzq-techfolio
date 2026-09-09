import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { ArrowUpRight, Braces, BrainCircuit, Database, Orbit } from 'lucide-react'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'

const icons = [BrainCircuit, Orbit, Braces, Database]
const relatedProjects = ['scholardog', 'earthwork', 'micro-frontend', 'uav']

export function Skills() {
  const { t } = usePreferences()
  const { skills, projects } = useContent()
  return (
    <section className="section" id="skills">
      <Reveal>
        <SectionTitle
          index="01"
          eyebrow="CORE CAPABILITIES"
          title={t('跨越智能、空间与工程。')}
          description={t('以可落地的工程能力连接 AI 应用、三维 GIS 和完整业务系统。')}
        />
      </Reveal>
      <div className="skills-grid">
        {skills.map((skill, index) => {
          const Icon = icons[index]
          const related = projects.find((project) => project.id === relatedProjects[index])!
          return (
            <Reveal key={skill.id} delay={(index % 2) * 0.06}>
              <article className={`skill-card skill-${skill.id}`}>
                <div className="card-topline">
                  <span>{skill.number}</span>
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="card-kicker">{skill.title}</p>
                <h3>{skill.subtitle}</h3>
                <p className="card-description">{skill.description}</p>
                <div className="tech-tags">
                  {skill.keywords.map((keyword) => (
                    <TechTag key={keyword}>{keyword}</TechTag>
                  ))}
                </div>
                <a className="skill-project-link" href={`#project-${related.id}`}>
                  <span>
                    {t('关联实践')}
                    <strong>{related.name}</strong>
                  </span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
