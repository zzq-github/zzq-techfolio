import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'

export function TechStack() {
  const { t } = usePreferences()
  const { techStack } = useContent()
  return (
    <section className="section" id="tech-stack">
      <Reveal>
        <SectionTitle index="06" eyebrow="TECH UNIVERSE" title={t('技术不是清单，而是组合方式。')} />
      </Reveal>
      <Reveal>
        <div className="universe-grid">
          {techStack.map((group) => (
            <div className="universe-group" key={group.category}>
              <h3>{group.category}</h3>
              <div>
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
