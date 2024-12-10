import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Automatic Transciption',
    
    features: ['Speaker Identification', 'Content Summarization', 'Speaker Identification']
  },
  {
    name: 'User Interaction and Collaboration',
   
    features: ['Interactive Search', 'Collaboration Features']
  },
  {
    name: 'Advanced Features and Accessories',
  
    features: ['Real time Quiz', 'Personalized Study Paths']
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-[#0f0f11] ">
      <h2 className="text-3xl font-bold text-white text-center mb-12">Simple Pricing</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div key={index} className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
              {index === 2 ? 'Contact Sales' : 'Get Started'}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}