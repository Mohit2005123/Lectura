import { Button } from "@/components/ui/button"
import { Image1 } from "./Image1"
export default function Hero() {
  return (
    <section className="py-34 bg-[#0f0f11] bg-[#0f0f11] px-4 text-center" >
       <Image1/>
      <h1 className="text-4xl md:text-6xl text-white animated-letter font-bold mb-6">
        Transform Your Voice with AI     
      </h1>
      <span className="text-transparent bg-clip-text bg-gradient-to-r animated-letter from-green-400 to-blue-500 font-bold text-5xl">AI POWERED SPEECH TO TEXT GENERATOR</span>
      <p className="text-xl p-2 wave-letter text-white  mb-8 max-w-2xl mx-auto">
        Create stunning voiceovers, narrations, and audio content with our cutting-edge AI voice technology.
      </p>
      <div className="flex justify-center space-x-4">
        <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
          Try for Free
        </Button>
        <Button size="lg" className="bg-violet-600 hover:bg-violet-700" variant="outline">
          Learn More
        </Button>
      </div>
    </section>
  )
}
