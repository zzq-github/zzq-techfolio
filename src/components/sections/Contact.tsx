import { ArrowUpRight, CodeXml, Mail, MapPin } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { profile } from '../../data/profile'
import { Reveal } from '../common/Reveal'

export function Contact() {
  return (
    <section className="contact-section" id="contact">
      <Reveal>
        <p className="section-eyebrow">CONTACT / LET'S BUILD SOMETHING REAL</p>
        <h2>
          有复杂问题？
          <br />
          <span>一起把它做成。</span>
        </h2>
        <p>关注 AI 应用、三维 GIS、数据可视化及全栈业务系统的工程化落地。</p>
        <div className="contact-actions">
          {siteConfig.enableEmail && (
            <a className="button primary" href={`mailto:${profile.email}`}>
              <Mail size={18} aria-hidden="true" /> 发送邮件
            </a>
          )}
          <a className="button ghost" href={profile.github} target="_blank" rel="noreferrer">
            <CodeXml size={18} aria-hidden="true" /> GitHub <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="contact-location">
          <MapPin size={16} aria-hidden="true" /> {profile.location} · China
        </div>
      </Reveal>
    </section>
  )
}
