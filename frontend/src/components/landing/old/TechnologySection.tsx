import { Globe, Lock, Shield, Zap } from "lucide-react";
import { FadeInSection, SlideInSection } from '@/components/landing/MotionComponent'


export const TechnologySection: React.FC = () => {
  const technologies = [
    {
      title: 'Internet Computer Protocol',
      description: 'Decentralized hosting ensures your data is secure and private',
      icon: Globe,
      color: 'from-primary to-primary/80'
    },
    {
      title: 'Blockchain Security',
      description: 'Immutable records and encrypted communications',
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Smart Contracts',
      description: 'Automated therapy sessions and secure payments',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Zero-Knowledge Privacy',
      description: 'Your mental health data remains completely private',
      icon: Lock,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <section id="technology" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-16">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Technology</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built on Web3 Infrastructure</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            MentalVerse leverages blockchain technology and the Internet Computer Protocol to provide secure, 
            decentralized mental health services with unprecedented privacy and control.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          {technologies.map((tech, index) => (
            <SlideInSection key={tech.title} direction={index % 2 === 0 ? 'left' : 'right'}>
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-500 group hover:scale-105 h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${tech.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                  <tech.icon className="text-white" size={32} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{tech.title}</h3>
                <p className="text-gray-300">{tech.description}</p>
              </div>
            </SlideInSection>
          ))}
        </div>
      </div>
    </section>
  );
};