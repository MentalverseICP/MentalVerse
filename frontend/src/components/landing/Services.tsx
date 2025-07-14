import { FadeInSection } from '@/components/landing/MotionComponent'
import { Brain, Users, User, Phone, Heart, Smile, Shield, Sparkles } from 'lucide-react';


export const Services: React.FC = () => {
  const services = [
    { 
      title: 'Individual Therapy', 
      description: 'One-on-one sessions with licensed therapists tailored to your specific needs.',
      icon: User,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Group Therapy', 
      description: 'Connect with others facing similar challenges in a supportive environment.',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      title: 'Crisis Support', 
      description: '24/7 crisis intervention and emergency mental health support.',
      icon: Phone,
      color: 'from-teal-500 to-teal-600'
    },
    { 
      title: 'Mindfulness & Meditation', 
      description: 'Guided meditation sessions and mindfulness practices for daily wellness.',
      icon: Brain,
      color: 'from-lime-500 to-lime-600'
    },
    { 
      title: 'Couples Counseling', 
      description: 'Relationship therapy to strengthen bonds and improve communication.',
      icon: Heart,
      color: 'from-green-600 to-emerald-600'
    },
    { 
      title: 'Teen & Child Support', 
      description: 'Specialized mental health services for children and adolescents.',
      icon: Smile,
      color: 'from-emerald-600 to-teal-600'
    },
    { 
      title: 'AI-Powered Insights', 
      description: 'Blockchain-secured AI analysis for personalized mental health recommendations.',
      icon: Sparkles,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'Decentralized Records', 
      description: 'Secure, private health records stored on the Internet Computer blockchain.',
      icon: Shield,
      color: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <section id="services" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-12">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Our Services</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Comprehensive Mental Health Support</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            We offer a wide range of mental health services designed to support you at every stage of your journey, powered by cutting-edge Web3 technology.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-left">
          {services.map((service, index) => (
            <FadeInSection key={service.title} delay={index * 100}>
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:shadow-2xl transition-all duration-500 group hover:scale-105 h-full">
                <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="text-white" size={24} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{service.title}</h3>
                <p className="text-gray-300">{service.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};