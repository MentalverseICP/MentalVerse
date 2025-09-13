import { motion } from 'framer-motion';
import { ArrowRight, Lock, Accessibility, Heart } from 'lucide-react';
import { scrollToSection } from './MotionComponent';

export const SmilesSection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Happy woman and child" 
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Overlay Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 max-w-xs"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Join our active healthy community</span>
                </div>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Where Smiles Blossom Into Stories
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                MentalVerse isn't just a space to track your moods and progress, it's a place where your well-being takes center stage. Here you can express yourself freely, track your journey, and witness those smiles blossom into stories that empower and inspire you.
              </p>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('services')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Confidentiality</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your privacy is our priority. All conversations and data are encrypted and protected with the highest security standards.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Accessibility className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Available in multiple languages with features designed for users of all abilities and backgrounds.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

