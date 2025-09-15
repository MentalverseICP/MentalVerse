import { FadeInSection } from '@/components/landing/MotionComponent'
import { Award, Globe, Lock, Shield, User, Zap } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Decentralized Identity',
      description: 'Your identity is secured on the blockchain, giving you full control over your personal data.',
      icon: User,
      gradient: 'from-primary to-primary/80'
    },
    {
      title: 'Encrypted Communications',
      description: 'All therapy sessions are end-to-end encrypted using advanced cryptographic protocols.',
      icon: Lock,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      title: 'Smart Contracts',
      description: 'Automated session scheduling, payments, and progress tracking through smart contracts.',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Immutable Records',
      description: 'Your therapy progress is stored permanently and securely on the blockchain.',
      icon: Shield,
      gradient: 'from-red-500 to-pink-600'
    },
    {
      title: 'Token Rewards',
      description: 'Earn tokens for consistent therapy attendance and achieving mental health goals.',
      icon: Award,
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Global Accessibility',
      description: 'Access mental health services from anywhere in the world, 24/7.',
      icon: Globe,
      gradient: 'from-teal-500 to-cyan-600'
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-16">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Revolutionary Mental Health Platform</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Experience the future of mental health care with our blockchain-powered platform that prioritizes privacy, security, and accessibility.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center md:text-left">
          {features.map((feature, index) => (
            <FadeInSection key={feature.title} delay={index * 150}>
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group hover:scale-105 h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-white font-bold text-xl mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};
