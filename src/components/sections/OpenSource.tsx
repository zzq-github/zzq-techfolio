import { ArrowUpRight, CodeXml } from 'lucide-react'
import { openSourceProjects } from '../../data/profile'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'

export function OpenSource() {
  return (
    <section className="section" id="open-source">
      <Reveal>
        <SectionTitle index="04" eyebrow="OPEN SOURCE" title="把工程经验沉淀为复用能力。" />
      </Reveal>
      <div className="opensource-grid">
        {openSourceProjects.map((project) => (
          <Reveal key={project.name}>
            <article className="opensource-card">
              <div className="opensource-code">{project.code}</div>
              <div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="tech-tags">
                  {project.tags.map((tag) => (
                    <TechTag key={tag}>{tag}</TechTag>
                  ))}
                </div>
                <div className="source-actions">
                  <a href={project.github} target="_blank" rel="noreferrer">
                    <CodeXml size={16} aria-hidden="true" /> View GitHub
                  </a>
                  {'demo' in project && project.demo && (
                    <a href={project.demo} target="_blank" rel="noreferrer">
                      Live Demo <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
