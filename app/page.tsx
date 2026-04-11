"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F7F4] to-[#BFD7D2]">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-[#7A9B90]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-[#2C4A52] mb-4">
          Pixie Journey
        </h1>
        <p className="text-2xl text-[#3A4039] mb-2">
          Your Life, Honestly Visualized
        </p>
        <p className="text-lg text-[#7A9B90] mb-8">Plan • Track • Prepare</p>
        
        <div className="flex justify-center gap-4">
          <Link
            href="/signin"
            className="bg-[#7A9B90] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#6a8b80] transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/features"
            className="border-2 border-[#7A9B90] text-[#7A9B90] px-8 py-3 rounded-full font-semibold hover:bg-[#7A9B90] hover:text-white transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#2C4A52] mb-12">
          Why Pixie Journey?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-[#2C4A52] mb-2">
              Layer 1: Structured Data
            </h3>
            <p className="text-[#3A4039]">
              Visual stickers for mood, sleep, and symptoms. Quick 3-tap logging.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💭</div>
            <h3 className="text-xl font-semibold text-[#2C4A52] mb-2">
              Layer 2: Context Notes
            </h3>
            <p className="text-[#3A4039]">
              Capture the "why" behind each entry. Prevents AI misinterpretation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-semibold text-[#2C4A52] mb-2">
              Layer 3: Predictive Analytics
            </h3>
            <p className="text-[#3A4039]">
              Proactive health forecasting from behavioral patterns.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#D4B5AA]/20 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#2C4A52] mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-[#7A9B90] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold text-[#2C4A52] mb-2">Choose Your Path</h3>
              <p className="text-sm text-[#3A4039]">
                Life Track (simple) or Clinical Track (detailed)
              </p>
            </div>

            <div>
              <div className="bg-[#7A9B90] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold text-[#2C4A52] mb-2">Track Daily</h3>
              <p className="text-sm text-[#3A4039]">
                Quick sticker selection with optional context notes
              </p>
            </div>

            <div>
              <div className="bg-[#7A9B90] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold text-[#2C4A52] mb-2">View Patterns</h3>
              <p className="text-sm text-[#3A4039]">
                See your journey in weekly, monthly, and year-in-pixels views
              </p>
            </div>

            <div>
              <div className="bg-[#7A9B90] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                4
              </div>
              <h3 className="font-semibold text-[#2C4A52] mb-2">Get Insights</h3>
              <p className="text-sm text-[#3A4039]">
                AI-powered predictions and early warning alerts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#2C4A52] mb-12">
          Simple, Transparent Pricing
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#BFD7D2]">
            <h3 className="text-2xl font-bold text-[#2C4A52] mb-2">Free</h3>
            <p className="text-4xl font-bold text-[#7A9B90] mb-6">$0</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>2 categories</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>50 stickers/month</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Basic views</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block w-full bg-[#BFD7D2] text-[#2C4A52] py-3 rounded-full font-semibold text-center hover:bg-[#afd0c9] transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#7A9B90] transform scale-105">
            <div className="bg-[#7A9B90] text-white text-sm font-semibold px-4 py-1 rounded-full inline-block mb-4">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-[#2C4A52] mb-2">Premium</h3>
            <p className="text-4xl font-bold text-[#7A9B90] mb-6">$4.99/mo</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Unlimited categories</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>AI pattern detection</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>No ads</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Premium stickers</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block w-full bg-[#7A9B90] text-white py-3 rounded-full font-semibold text-center hover:bg-[#6a8b80] transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* NDIS Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#D4B5AA]">
            <h3 className="text-2xl font-bold text-[#2C4A52] mb-2">NDIS</h3>
            <p className="text-4xl font-bold text-[#D4B5AA] mb-6">$75-100/mo</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Clinical reports</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Support worker portal</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Crisis alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>NDIS-funded (no out-of-pocket)</span>
              </li>
            </ul>
            <Link
              href="/contact"
              className="block w-full bg-[#D4B5AA] text-[#2C4A52] py-3 rounded-full font-semibold text-center hover:bg-[#c4a59a] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C4A52] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Pixie Journey</h4>
              <p className="text-sm text-[#BFD7D2]">
                Your Life, Honestly Visualized
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#BFD7D2]">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/download" className="hover:text-white">Download</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-[#BFD7D2]">
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-[#BFD7D2]">
                <li><Link href="/contact" className="hover:text-white">Get in Touch</Link></li>
                <li><Link href="/ndis" className="hover:text-white">NDIS Information</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#BFD7D2] mt-8 pt-8 text-center text-sm text-[#BFD7D2]">
            <p>© 2026 Pixie Journey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
