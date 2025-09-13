import { motion } from 'framer-motion';
import { Check, Play } from 'lucide-react';

export const WellnessSection: React.FC = () => {
  const features = [
    "Understand individual needs",
    "Multiple languages",
    "Anonymous access"
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Images */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Elderly people walking on beach" 
                className="w-full h-64 object-cover rounded-2xl shadow-xl"
              />
              
              {/* Overlay Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-all duration-300 rounded-2xl flex items-center justify-center group"
              >
                <div className="bg-primary rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 text-primary-foreground ml-1" />
                </div>
                <span className="absolute bottom-4 left-4 text-white font-semibold">View Patient Stories</span>
              </motion.button>
            </div>

            {/* Small Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Man and child with phone" 
                className="w-full h-32 object-cover rounded-xl shadow-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Woman working on laptop" 
                className="w-full h-32 object-cover rounded-xl shadow-lg"
              />
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              We're Making Your Mental Wellness Easy to Achieve
            </h2>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

