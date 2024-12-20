import Hero from '../components/Hero'
import Features from '@/components/Features'
import Navbar from '../components/landingpage/Navbar'
import Footer from '../components/Footer'
import {TimelineDemo}  from '@/components/usage'
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
