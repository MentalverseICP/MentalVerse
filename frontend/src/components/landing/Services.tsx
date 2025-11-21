import { motion } from "framer-motion";
import { Brain, Heart, Users, ArrowRight } from "lucide-react";
import { scrollToSection } from "./MotionComponent";


export const Services: React.FC = () => {
  const services = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Juniper",
      description:
        "Holistic mental healthcare service for autistic and autism affected children.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Kin",
      description:
        "Better mental health and wellness treatment plan for non-fertile women.",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Compound",
      description:
        "All-in-one wellness solution for you and your family at a time.",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="services" className="py-24 bg-transparent relative">
      {/* Gradient background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#18E614]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Unlock Your Inner Health with Our Services
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Discover our specialized wellness programs designed to support your unique mental health journey
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group h-full"
            >
              <div className="p-8 rounded-2xl bg-card border border-border/40 space-y-4 h-full flex flex-col transition-all duration-300 hover:border-[#18E614]/70 hover:shadow-lg hover:shadow-[#18E614]/5">
                {/* Icon Container */}
                <motion.div 
                  className={`rounded-xl p-4 w-fit bg-gradient-to-br ${service.color} shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="text-white">{service.icon}</div>
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-foreground">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {service.description}
                </p>

                {/* Button */}
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('home')}
                  className="px-6 py-3 rounded-lg flex items-center space-x-2 border border-border/40 text-foreground hover:text-[#18E614] hover:border-[#18E614]/50 hover:bg-[#18E614]/5 transition-all duration-300 w-fit font-semibold mt-auto"
                >
                  <span>Get Started</span>
                  <motion.div animate={{ x: 2 }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
