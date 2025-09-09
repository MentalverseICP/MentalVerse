import { ArrowUpRight, Headphones, Phone, TrendingUp, Video, BookOpen, MessageCircle } from "lucide-react";
import { FadeInSection } from "./MotionComponent";

export const ResourcesSection: React.FC = () => {
  const resources = [
    {
      title: 'Mental Health Articles',
      description: 'Expert-written articles on various mental health topics',
      icon: BookOpen,
      type: 'article'
    },
    {
      title: 'Guided Meditations',
      description: 'Audio-guided meditation sessions for stress relief',
      icon: Headphones,
      type: 'audio'
    },
    {
      title: 'Video Workshops',
      description: 'Educational workshops on coping strategies',
      icon: Video,
      type: 'video'
    },
    {
      title: 'Progress Tracking',
      description: 'Tools to monitor your mental health journey',
      icon: TrendingUp,
      type: 'tool'
    },
    {
      title: 'Community Forums',
      description: 'Connect with others on similar journeys',
      icon: MessageCircle,
      type: 'community'
    },
    {
      title: 'Crisis Resources',
      description: 'Immediate help and emergency contacts',
      icon: Phone,
      type: 'emergency'
    }
  ];

  return (
    <section id="resources" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-16">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Resources</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Mental Health Resources</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Access a comprehensive library of mental health resources, tools, and educational materials.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center md:text-left">
          {resources.map((resource, index) => (
            <FadeInSection key={resource.title} delay={index * 100}>
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:shadow-2xl transition-all duration-500 group hover:scale-105 h-full cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <resource.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{resource.title}</h3>
                    <span className="text-green-400 text-sm capitalize">{resource.type}</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{resource.description}</p>
                <button className="text-green-400 hover:text-green-300 font-medium flex items-center group-hover:gap-2 transition-all duration-300">
                  Access Resource
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};