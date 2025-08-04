import React from 'react'
import { Enhanced3DBackground } from '@/components/landing/MotionComponent'
import { Interactive3DBrain } from '@/components/landing/Interactive3DBrain'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Services } from '@/components/landing/Services'
import { Stats } from '@/components/landing/Stats'
import { TechnologySection } from '@/components/landing/TechnologySection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
// import { Therapists } from '@/components/landing/Therapists'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { ResourcesSection } from '@/components/landing/ResourcesSection'
import { ContactSection } from '@/components/landing/ContactSection'
import { Footer } from '@/components/landing/Footer'
import Chatbot from '@/components/Chatbot'

interface LandingPageProps {
  onWalletDisconnect: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onWalletDisconnect }) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* All responsiveness handled in child components */}
      <Enhanced3DBackground />
      <Interactive3DBrain />
      <Header onWalletDisconnect={onWalletDisconnect} />
      <Hero />
      <Stats />
      <Services />
      <TechnologySection />
      <FeaturesSection />
      {/* <Therapists /> */}
      <TestimonialsSection />
      <ResourcesSection />
      <ContactSection />
      <Footer />
      <Chatbot />
    </div>
  )
}

export default LandingPage