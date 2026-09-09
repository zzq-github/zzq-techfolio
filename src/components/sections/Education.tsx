import { useContent } from '../../i18n/useContent'
import { Reveal } from '../common/Reveal'

export function Education() {
  const { education } = useContent()
  return (
    <section className="section education-section" aria-labelledby="education-title">
      <Reveal>
        <div className="education-card">
          <p className="section-eyebrow">EDUCATION</p>
          <h2 id="education-title">{education.school}</h2>
          <p>{education.degree}</p>
          <span>{education.period}</span>
        </div>
      </Reveal>
    </section>
  )
}
