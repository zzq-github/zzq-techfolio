import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { ArrowUpRight, CodeXml } from 'lucide-react'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'
import { FormulaPreview } from '../common/FormulaPreview'

export function OpenSource() {
  const { t } = usePreferences()
  const { openSourceProjects } = useContent()
  return (
    <section className="section" id="open-source">
      <Reveal>
        <SectionTitle index="04" eyebrow="OPEN SOURCE" title={t('把工程经验沉淀为复用能力。')} />
      </Reveal>
      <div className="opensource-grid">
        {openSourceProjects.map((project, index) => (
          <Reveal key={project.name} delay={index * 0.06}>
            <article className="opensource-card">
              {project.code === 'MATH' ? (
                <FormulaPreview />
              ) : (
                <div className="source-terminal">
                  <div className="terminal-heading">
                    <span>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>QUICK START / TERMINAL</span>
                  </div>
                  <div className="terminal-commands">
                    <code>
                      <span>$</span> pnpm install
                    </code>
                    <code>
                      <span>$</span> pnpm dev
                    </code>
                  </div>
                  <div className="terminal-stack">
                    <span>React</span>
                    <span>TypeScript</span>
                    <span>Vite</span>
                    <span>Ant Design</span>
                  </div>
                </div>
              )}
              <div className="source-preview-caption">
                <b>{project.code}</b>
                <span>{project.code === 'MATH' ? t('公式示例 · LaTeX') : t('本地开发 · 快速启动')}</span>
              </div>
              <div className="opensource-body">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="tech-tags">
                  {project.tags.map((tag) => (
                    <TechTag key={tag}>{tag}</TechTag>
                  ))}
                </div>
                <div className="source-actions">
                  <a href={project.github} target="_blank" rel="noreferrer">
                    <CodeXml size={16} aria-hidden="true" /> {t('查看源码')}
                  </a>
                  {'demo' in project && project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t('打开{name}在线演示', { name: project.name })}
                    >
                      {t('在线演示')} <ArrowUpRight size={16} aria-hidden="true" />
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
