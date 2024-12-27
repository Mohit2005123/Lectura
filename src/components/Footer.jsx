'use client';
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Lectura</h3>
          <p className="text-gray-400">Transforming the way we create and experience voice content.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Product</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">Features</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Pricing</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">API</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">About</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Blog</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Lectura. All rights reserved.</p>
      </div>
    </footer>
  )
}

