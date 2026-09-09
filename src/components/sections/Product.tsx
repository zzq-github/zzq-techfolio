import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { Wrench } from 'lucide-react'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'

export function Product() {
  const { t } = usePreferences()
  const { product } = useContent()
  return (
    <section className="section product-section">
      <Reveal>
        <SectionTitle
          index="05"
          eyebrow="SIDE PROJECT / PRODUCT"
          title={t('从高频问题出发，做一件趁手工具。')}
        />
      </Reveal>
      <Reveal>
        <article className="product-card">
          <div className="product-mark">
            <Wrench size={30} strokeWidth={1.4} aria-hidden="true" />
            <span>{product.status}</span>
          </div>
          <div className="product-copy">
            <p className="card-kicker">{product.subtitle}</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="tech-tags">
              {product.features.map((feature) => (
                <TechTag key={feature}>{feature}</TechTag>
              ))}
            </div>
          </div>
          <div
            className="product-flow"
            aria-label={t('产品流程：{steps}', { steps: product.flow.join(' → ') })}
          >
            {product.flow.map((step, index) => (
              <div className="product-step" key={step}>
                <span className="product-step-number">0{index + 1}</span>
                <div>
                  <strong>{step}</strong>
                  <small>{product.features[[0, 3, 4, 6][index]]}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </Reveal>
    </section>
  )
}
