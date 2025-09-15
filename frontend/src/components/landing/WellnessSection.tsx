import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";

export const WellnessSection: React.FC = () => {
  const features = [
    "Understand individual needs",
    "Multiple languages",
    "Anonymous access",
  ];

  return (
    <section className="py-8 md:py-16 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-12 items-stretch min-h-[400px] lg:min-h-[500px]">
          {/* Left Side - Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-stretch min-h-[300px] md:min-h-[500px] rounded-2xl overflow-hidden"
          >
            <div className="space-y-4 md:space-y-6 w-full h-full flex flex-col justify-center bg-secondary/30 dark:bg-secondary/20 backdrop-blur-sm border border-border/10 rounded-2xl p-4 md:p-8">
              {/* Main Image */}
              <div className="relative flex-1">
                <img
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Professional mental health counseling session"
                  className="w-full h-full object-cover rounded-2xl shadow-xl"
                />

                {/* Overlay Button */}
                <motion.button className="absolute inset-0 bg-black/40 hover:bg-black/40 transition-all duration-300 rounded-2xl flex items-center justify-center group">
                  <div className="bg-[#18E614] rounded-full p-3 md:p-4 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-4 h-4 md:w-6 md:h-6 text-white ml-1" />
                  </div>
                  <span className="absolute bottom-4 left-4 text-white font-semibold text-sm md:text-base">
                    View Patient Stories
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-stretch min-h-[300px] md:min-h-[500px]"
          >
            <div className="bg-secondary/30 dark:bg-secondary/20 backdrop-blur-sm border border-border/10 rounded-2xl p-4 md:p-8 w-full flex flex-col justify-center space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
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
                    <div className="w-6 h-6 bg-[#18E614] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Small Images Grid */}
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Mental wellness and mindfulness practice"
                  className="w-full h-24 md:h-32 object-cover rounded-xl shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Mindfulness and stress relief"
                  className="w-full h-24 md:h-32 object-cover rounded-xl shadow-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
