import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Hero } from './components/hero/Hero'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Education } from './components/sections/Education'
import { Experience } from './components/sections/Experience'
import { OpenSource } from './components/sections/OpenSource'
import { Product } from './components/sections/Product'
import { Projects } from './components/sections/Projects'
import { Skills } from './components/sections/Skills'
import { TechStack } from './components/sections/TechStack'

export default function App() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <OpenSource />
        <Product />
        <TechStack />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
