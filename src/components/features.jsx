import { Mic, Wand2, Zap } from 'lucide-react'

const features = [
  {
    icon: <Mic className="h-6 w-6 text-violet-600" />,
    title: 'Natural Voice Synthesis',
    description: 'Generate human-like voices with our advanced AI technology.'
  },
  {
    icon: <Wand2 className="h-6 w-6 text-violet-600" />,
    title: 'Custom Voice Creation',
    description: 'Create unique voices tailored to your specific needs and preferences.'
  },
  {
    icon: <Zap className="h-6 w-6 text-violet-600" />,
    title: 'Real-time Processing',
    description: 'Experience lightning-fast voice generation for immediate use.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20  px-4 bg-[#0f0f11]">
      <h2 className="text-3xl font-bold text-center text-white mb-12">Powerful Features</h2>
      <div className="grid  text-white md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="mb-4 inline-block p-3 bg-purple-500 rounded-full">
              {feature.icon}
            </div>
            <h3 className="text-xl animate- font-semibold  mb-2">{feature.title}</h3>
            <p className="text-white  animate-">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}



