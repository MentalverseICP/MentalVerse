import { FadeInSection, MotionDiv, SlideInSection, scrollToSection } from '@/components/landing/MotionComponent'
import { CustomConnectButton, CustomConnectedButton } from './CustomConnectButton';
import { Brain, Calendar } from 'lucide-react';
import { ConnectWallet, ConnectWalletDropdownMenu } from '@nfid/identitykit/react';
import { MouseEvent } from 'react';
import MentalIcon from "@/images/mental_mobile.svg";


export const Hero: React.FC = () => {

  return (
    <section id="about" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeInSection className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-block bg-green-600/20 backdrop-blur-sm border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm mb-6 animate-pulse">
              Your Mental Health Journey Starts Here
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Peace in
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">Your Mind</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Connect with licensed therapists, access mental health resources, and take control of your wellbeing with our comprehensive Web3-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <ConnectWallet
                connectButtonComponent={CustomConnectButton}
                connectedButtonComponent={(props: {connectedAccount?: string; onClick?:(e:MouseEvent<HTMLButtonElement>) => void }) => (
                  <CustomConnectedButton {...props} />
                )}
                dropdownMenuComponent={ConnectWalletDropdownMenu}
              />
              <button
                type='button'
                className="border border-green-500/50 text-green-300 px-8 py-3 rounded-lg text-md font-semibold hover:bg-green-600/20 transition-all transform hover:scale-105"
                onClick={() => scrollToSection('services')}
              >
                Learn More
              </button>
            </div>
          </FadeInSection>
          
          <SlideInSection direction="right" className="relative">
            <div className="relative z-10">
              <MotionDiv className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-3xl p-6 max-w-sm mx-auto shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-spin-slow">
                    {/* <Brain className="text-white" size={32} /> */}
                    <img src={MentalIcon} alt="" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Mental Health Dashboard</h3>
                  <p className="text-gray-400 text-sm">Track your progress</p>
                </div>
                <div className="space-y-4">
                  <MotionDiv className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200 font-medium">Mood Today</span>
                      <span className="text-green-400 font-semibold">Great</span>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded transition-all duration-300 ${i < 4 ? 'bg-green-500' : 'bg-gray-600'}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                    </div>
                  </MotionDiv>
                  <MotionDiv className="bg-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 font-medium">Next Session</span>
                      <Calendar className="text-emerald-400 animate-bounce" size={20} />
                    </div>
                    <p className="text-emerald-400 font-semibold">Tomorrow at 3:00 PM</p>
                  </MotionDiv>
                  <MotionDiv className="bg-teal-600/20 backdrop-blur-sm border border-teal-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 font-medium">Weekly Goal</span>
                      <span className="text-teal-400 font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: '85%'}}></div>
                    </div>
                  </MotionDiv>
                </div>
              </MotionDiv>
            </div>
          </SlideInSection>
        </div>
      </div>
    </section>
  );
};