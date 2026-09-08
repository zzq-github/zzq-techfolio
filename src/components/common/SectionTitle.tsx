type SectionTitleProps = {
  index: string
  eyebrow: string
  title: string
  description?: string
}

export function SectionTitle({ index, eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="section-heading">
      <div className="section-index">/{index}</div>
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
    </div>
  )
}
