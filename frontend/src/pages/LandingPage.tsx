import React, { useState, useEffect } from 'react';
import { ChevronDown, Heart, Shield, Users, Phone, Brain, Smile, Award, Menu, X, Calendar, MessageCircle, User, Star } from 'lucide-react';

// Simple motion components to replace framer-motion
const MotionDiv: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', style, ...props }) => (
  <div
    className={`${className} transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

const MotionSection: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, className = '', style, ...props }) => (
  <section className={`${className} animate-fade-in`} style={style} {...props}>
    {children}
  </section>
);

const motion = {
  div: MotionDiv,
  section: MotionSection,
};

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-600 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1)_0%,transparent_50%)]"></div>
    </div>
  );
};

// Smooth scroll handler
const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <span className="text-white text-xl font-bold">MentalVerse</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => scrollToSection('services')}
              type="button"
            >
              Services
            </button>
            {/* <button
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => scrollToSection('about')}
              type="button"
            >
              About
            </button> */}
            <button
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => scrollToSection('therapists')}
              type="button"
            >
              Therapists
            </button>
            <button
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => scrollToSection('resources')}
              type="button"
            >
              Resources
            </button>
            <button
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => scrollToSection('contact')}
              type="button"
            >
              Contact
            </button>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <button type='button' className="text-gray-300 hover:text-blue-400 transition-colors">
              Sign In
            </button>
            <button type='button' className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
              Get Started
            </button>
          </div>
          
          <button 
            type='button'
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div
            className="md:hidden mt-4 pb-4 bg-gray-800/95 backdrop-blur-lg rounded-lg shadow-lg transition-all duration-300 ease-in-out transform animate-slide-down"
            style={{
              opacity: isMenuOpen ? 1 : 0,
              transform: isMenuOpen ? 'translateY(0)' : 'translateY(-20px)'
            }}
          >
            <nav className="flex flex-col space-y-4 p-4">
              {[
                { label: 'Services', id: 'services' },
                // { label: 'About', id: 'about' },
                { label: 'Therapists', id: 'therapists' },
                { label: 'Resources', id: 'resources' },
                { label: 'Contact', id: 'contact' }
              ].map((item, idx) => (
                <button
                  key={item.id}
                  className={`text-gray-300 hover:text-blue-500 text-left transition-all duration-300 ease-in-out opacity-0 translate-x-[-16px] menu-item-animate`}
                  style={{
                    animation: isMenuOpen ? `menuItemFadeIn 0.3s forwards` : undefined,
                    animationDelay: `${idx * 80 + 100}ms`
                  }}
                  onClick={() => { scrollToSection(item.id); setIsMenuOpen(false); }}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes slide-down {
            0% { opacity: 0; transform: translateY(-20px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-slide-down {
            animation: slide-down 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes menuItemFadeIn {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .menu-item-animate {
            opacity: 0;
            transform: translateX(-16px);
          }
        `}
      </style>
    </header>
  );
};

// Hero Section Component
const Hero = () => {
  return (
    <section id="about" className="pb-10 relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="inline-block bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm mb-6">
              Your Mental Health Journey Starts Here
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Peace in
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Your Mind</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Connect with licensed therapists, access mental health resources, and take control of your wellbeing with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button type='button' className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Start Your Journey
              </button>
              <button type='button' className="border border-blue-500/50 text-blue-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600/20 transition-all transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10">
              <motion.div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 max-w-sm mx-auto shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="text-white" size={32} />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Mental Health Dashboard</h3>
                  <p className="text-gray-400 text-sm">Track your progress</p>
                </div>
                <div className="space-y-4">
                  <motion.div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200 font-medium">Mood Today</span>
                      <span className="text-blue-400 font-semibold">Great</span>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded ${i < 4 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div className="bg-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 font-medium">Next Session</span>
                      <Calendar className="text-green-400" size={20} />
                    </div>
                    <p className="text-green-400 font-semibold">Tomorrow at 3:00 PM</p>
                  </motion.div>
                  <motion.div className="bg-pink-600/20 backdrop-blur-sm border border-pink-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200 font-medium">Weekly Goal</span>
                      <span className="text-pink-400 font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Component
const Services = () => {
  const services = [
    { 
      title: 'Individual Therapy', 
      description: 'One-on-one sessions with licensed therapists tailored to your specific needs.',
      icon: User,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Group Therapy', 
      description: 'Connect with others facing similar challenges in a supportive environment.',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Crisis Support', 
      description: '24/7 crisis intervention and emergency mental health support.',
      icon: Phone,
      color: 'from-red-500 to-red-600'
    },
    { 
      title: 'Mindfulness & Meditation', 
      description: 'Guided meditation sessions and mindfulness practices for daily wellness.',
      icon: Brain,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'Couples Counseling', 
      description: 'Relationship therapy to strengthen bonds and improve communication.',
      icon: Heart,
      color: 'from-pink-500 to-pink-600'
    },
    { 
      title: 'Teen & Child Support', 
      description: 'Specialized mental health services for children and adolescents.',
      icon: Smile,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <motion.section id="services" className="py-16 bg-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-blue-400 mb-4">Our Services</p>
          <h2 className="text-4xl font-bold text-white">Comprehensive Mental Health Support</h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            We offer a wide range of mental health services designed to support you at every stage of your journey.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div key={index} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 group hover:scale-105">
              <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{service.title}</h3>
              <p className="text-gray-300">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Add Resources Section Anchor
const ResourcesAnchor = () => (
  <div id="resources" style={{ position: 'relative', top: '-80px' }}></div>
);

// Stats Component (used as Resources section anchor)
const Stats = () => {
  const stats = [
    { number: '10K+', label: 'Clients Helped', icon: Users },
    { number: '500+', label: 'Licensed Therapists', icon: User },
    { number: '24/7', label: 'Crisis Support', icon: Phone },
    { number: '95%', label: 'Satisfaction Rate', icon: Heart }
  ];

  return (
    <>
      <ResourcesAnchor />
      <section className="py-16 bg-white dark:bg-[#181c2a] relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-[#23263a] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-gray-700">
                    <stat.icon className="text-blue-600 dark:text-blue-400" size={32} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const Therapists = () => {
  const therapists = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Anxiety & Depression',
      experience: '12 years',
      rating: 4.9,
      image: 'SJ'
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Trauma & PTSD',
      experience: '8 years',
      rating: 4.8,
      image: 'MC'
    },
    {
      name: 'Dr. Emily Rodriguez',
      specialty: 'Couples Therapy',
      experience: '15 years',
      rating: 5.0,
      image: 'ER'
    },
    {
      name: 'Dr. David Kim',
      specialty: 'Child Psychology',
      experience: '10 years',
      rating: 4.9,
      image: 'DK'
    }
  ];

  return (
    <motion.section id="therapists" className="py-16 bg-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-blue-400 mb-4">Meet Our Team</p>
          <h2 className="text-4xl font-bold text-white">Licensed Mental Health Professionals</h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Our team consists of experienced, licensed therapists who are dedicated to helping you achieve mental wellness.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {therapists.map((therapist, index) => (
            <motion.div key={index} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">{therapist.image}</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{therapist.name}</h3>
              <p className="text-blue-400 font-medium mb-2">{therapist.specialty}</p>
              <p className="text-gray-400 text-sm mb-3">{therapist.experience} experience</p>
              <div className="flex items-center justify-center space-x-1">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="text-gray-300 font-medium">{therapist.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const CTASection = () => {
  return (
    <div id="contact">
      <section className="py-20 bg-white dark:bg-[#181c2a] border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Mental Health Journey?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Take the first step towards better mental health. Our licensed therapists are here to support you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type='button'
                className="px-8 py-3 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg"
              >
                Start Free Assessment
              </button>
              <button
                type='button'
                className="px-8 py-3 rounded-full font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Footer Component (Contact section)
const Footer = () => {
  return (
    <footer className="bg-gray-900 py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-white text-xl font-bold">MentalVerse</span>
            </div>
            <p className="text-gray-400 mb-6">
              Transforming mental health care through accessible, personalized, and effective therapy services.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <div className="space-y-2">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Individual Therapy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Group Therapy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Crisis Support</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Couples Counseling</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <div className="space-y-2">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Self-Assessment</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Wellness Library</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Crisis Resources</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors block">Community Forum</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              <p className="text-gray-400">Crisis Hotline: 988</p>
              <p className="text-gray-400">Support: (555) 123-4567</p>
              <p className="text-gray-400">Email: support@mentalverse.com</p>
              <p className="text-gray-400">Available 24/7</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">© 2024 MentalVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Hero />
      <Services />
      <Stats />
      <Therapists />
      <CTASection />
      <Footer />
    </div>
  );
};

export default App;