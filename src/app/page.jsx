import Hero from '../components/Hero'
import Features from '../components/Features'
import Navbar from '../components/landingpage/Navbar'
import Pricing from '../components/pricing'
import Footer from '../components/footer'
import {TimelineDemo}  from '@/components/usage'
import { InfiniteMovingCardsDemo } from '@/components/testimonial'
import DemoVideo from '@/components/vidplayer'
import Developers from '@/components/developers'

export default function Home() {
  return (
    <div className="w-[100%] bg-black ">
      <Navbar/>
      <Hero />
      <Features />
      {/* <Pricing/> */}
      <DemoVideo />
      <TimelineDemo />
      <Developers />
      {/* <InfiniteMovingCardsDemo /> */}
      <Footer/>
    </div>
  )
}
