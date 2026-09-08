import { experiences } from '../../data/profile'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'

export function Experience() {
  return (
    <section className="section" id="experience">
      <Reveal>
        <SectionTitle
          index="03"
          eyebrow="EXPERIENCE"
          title="十年，从交付走向架构。"
          description="持续在业务系统、前端架构、三维 GIS 与 AI 应用之间拓展工程边界。"
        />
      </Reveal>
      <div className="timeline">
        {experiences.map((experience, index) => (
          <Reveal key={experience.company}>
            <article className="timeline-item">
              <div className="timeline-date">
                <span>{experience.period}</span>
                <i>{String(experiences.length - index).padStart(2, '0')}</i>
              </div>
              <div className="timeline-node" aria-hidden="true">
                <span />
              </div>
              <div className="timeline-content">
                <p className="card-kicker">{experience.role}</p>
                <h3>{experience.company}</h3>
                {experience.metric && <strong className="experience-metric">{experience.metric}</strong>}
                <p>{experience.summary}</p>
                <div className="tech-tags">
                  {experience.keywords.map((keyword) => (
                    <TechTag key={keyword}>{keyword}</TechTag>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
