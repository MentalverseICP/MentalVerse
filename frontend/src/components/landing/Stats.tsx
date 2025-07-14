import { FadeInSection } from '@/components/landing/MotionComponent'
import { Phone, Shield, User, Users } from 'lucide-react';

export const Stats: React.FC = () => {
  const stats = [
    { number: '10K+', label: 'Clients Helped', icon: Users },
    { number: '500+', label: 'Licensed Therapists', icon: User },
    { number: '24/7', label: 'Crisis Support', icon: Phone },
    { number: '99.9%', label: 'Uptime Guarantee', icon: Shield }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <FadeInSection key={stat.label} delay={index * 100} className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-green-500/30">
                  <stat.icon className="text-green-400" size={32} />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};