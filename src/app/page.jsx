import Hero from '../app/components/Hero'
import Features from '../app/components/Features'
import CTA from '../app/components/CTA'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-indigo-900">
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}
