
import Hero from '../components/Hero'
import Features from '../components/Features'
import Navbar from '../components/landingpage/Navbar'
import Pricing from '@/components/pricing'
import Footer from '@/components/footer'
export default function Home() {
  return (
    <main className="container min-h-screen ">
      <Navbar/>
      <Hero />
      <Features />
      <Pricing/>
      <Footer/>
    </main>
  )
}
