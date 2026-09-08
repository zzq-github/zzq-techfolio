import { ArrowRight, Wrench } from 'lucide-react'
import { product } from '../../data/profile'
import { Reveal } from '../common/Reveal'
import { SectionTitle } from '../common/SectionTitle'
import { TechTag } from '../common/TechTag'

export function Product() {
  return (
    <section className="section product-section">
      <Reveal>
        <SectionTitle index="05" eyebrow="SIDE PROJECT / PRODUCT" title="从高频问题出发，做一件趁手工具。" />
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
          <div className="product-flow" aria-label={`产品流程：${product.flow.join('、')}`}>
            {product.flow.map((step, index) => (
              <span key={step}>
                {step}
                {index < product.flow.length - 1 && <ArrowRight size={15} aria-hidden="true" />}
              </span>
            ))}
          </div>
        </article>
      </Reveal>
    </section>
  )
}
