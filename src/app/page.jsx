import Hero from '../components/Hero'
import Features from '../components/Features';
import Navbar from '../components/landingpage/Navbar'
import Footer from '../components/Footer';
import {TimelineDemo}  from '@/components/usage'
import DemoVideo from '@/components/vidplayer'
import Developers from '@/components/developers'
import { ThreeDMarqueeDemo } from '@/components/gallery';


// hello world
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
      <ThreeDMarqueeDemo />
      <Footer/>
    </div>
  )
}
