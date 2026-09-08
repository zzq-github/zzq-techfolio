import { profile } from '../../data/profile'

export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} {profile.name}
      </p>
      <p>AI · GIS · FULL STACK</p>
      <a href="#home">BACK TO TOP ↑</a>
    </footer>
  )
}
