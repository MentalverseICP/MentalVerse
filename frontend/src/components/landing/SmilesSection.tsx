import { motion } from "framer-motion";
import { ArrowUpRight, Lock, Accessibility, Heart } from "lucide-react";
import { scrollToSection } from "./MotionComponent";

export const SmilesSection: React.FC = () => {
  return (
    <section className="py-20 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative min-h-[600px] flex items-center"
          >
            <div className="relative w-full h-full">
              <img
                src="/src/app/Mentalverse images for lP/woman-holding-kid.jpg"
                alt="Happy woman and child"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />

              {/* Overlay Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border/10 rounded-xl p-4 max-w-xs"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-[#18E614]" />
                  <span className="text-sm font-medium text-foreground">
                    Join our active healthy community
                  </span>
                </div>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-[#18E614] rounded-full flex items-center justify-center"
                    >
                      <span className="text-[#18E614]-foreground text-xs font-bold">
                        {i + 1}
                      </span>
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
            className="min-h-[600px] flex items-center"
          >
            <div className="bg-secondary/30 dark:bg-secondary/20 backdrop-blur-sm border border-border/5 rounded-2xl p-8 w-full h-full flex flex-col justify-center space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Where Smiles Blossom Into Stories
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  MentalVerse isn't just a space to track your moods and
                  progress, it's a place where your well-being takes center
                  stage. Here you can express yourself freely, track your
                  journey, and witness those smiles blossom into stories that
                  empower and inspire you.
                </p>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('services')}
                className="bg-[#18E614] hover:bg-[#18E614]/90 text-white px-8 py-3 rounded-xl flex items-center justify-center space-x-2"
              >
                <span>Learn More</span>
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card/60 backdrop-blur-sm border border-border/10 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-[#18E614]/20 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#18E614]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Confidentiality
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your privacy is our priority. All conversations and data are
                    encrypted and protected with the highest security standards.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card/60 backdrop-blur-sm border border-border/10 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-[#18E614]/20 rounded-lg flex items-center justify-center">
                      <Accessibility className="w-5 h-5 text-[#18E614]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Accessibility
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Available in multiple languages with features designed for
                    users of all abilities and backgrounds.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
