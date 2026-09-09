import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { Braces, BrainCircuit, Database, Orbit } from 'lucide-react'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'

const icons = [BrainCircuit, Orbit, Braces, Database]

export function Skills() {
  const { t } = usePreferences()
  const { skills } = useContent()
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
          return (
            <Reveal key={skill.id}>
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
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
