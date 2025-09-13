import React from 'react'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { SmilesSection } from '@/components/landing/SmilesSection'
import { Services } from '@/components/landing/Services'
import { WellnessSection } from '@/components/landing/WellnessSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { HealthGuidanceSection } from '@/components/landing/HealthGuidanceSection'
import { AppointmentSection } from '@/components/landing/AppointmentSection'
import { Footer } from '@/components/landing/Footer'
import Chatbot from '@/components/shared/Chatbot'

interface LandingPageProps {
  onWalletDisconnect: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onWalletDisconnect }) => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header onWalletDisconnect={onWalletDisconnect} />
      <Hero />
      <SmilesSection />
      <Services />
      <WellnessSection />
      <TestimonialsSection />
      <HealthGuidanceSection />
      <AppointmentSection />
      <Footer />
      <Chatbot />
    </div>
  )
}

export default LandingPage