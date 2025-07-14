import { Phone, MessageCircle, Activity,  } from 'lucide-react';
import { useState } from 'react';
import { FadeInSection, SlideInSection } from '@/components/landing/MotionComponent'


export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-16">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Contact</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Get In Touch</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Ready to start your mental health journey? Contact us today to learn more about our services.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto text-center md:text-left">
          <SlideInSection direction="left">
            <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8">
              <h3 className="text-white font-bold text-xl mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    title='Name'
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    title='email'
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    title='message'
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-gray-800/50 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </SlideInSection>
          
          <SlideInSection direction="right">
            <div className="space-y-8">
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">24/7 Crisis Support</h4>
                    <p className="text-gray-400">1-800-MENTAL-1</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Live Chat</h4>
                    <p className="text-gray-400">Available 24/7</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                    <Activity className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Emergency Services</h4>
                    <p className="text-gray-400">Immediate intervention available</p>
                  </div>
                </div>
              </div>
            </div>
          </SlideInSection>
        </div>
      </div>
    </section>
  );
};