
import Hero from '../components/Hero'
import Features from '../components/Features'
import Navbar from '../components/landingpage/Navbar'
import Pricing from '../components/pricing'
import Footer from '../components/footer'
export default function Home() {
  return (
    <div className="w-[100%] bg-[#0f0f11] ">
      <Navbar/>
      <Hero />
      <Features />
      <Pricing/>
      <Footer/>
    </div>
  )
}
