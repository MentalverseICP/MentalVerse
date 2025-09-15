import { motion } from "framer-motion";
import { Brain, Heart, Users } from "lucide-react";
import { scrollToSection } from "./MotionComponent";


export const Services: React.FC = () => {
  const services = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Juniper",
      description:
        "Holistic mental healthcare service for autistic and autism affected children.",
      color: "from-primary to-primary/80",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Kin",
      description:
        "Better mental health and wellness treatment plan for non-fertile women.",
      color: "from-primary to-primary/80",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Compound",
      description:
        "All-in-one wellness solution for you and your family at a time.",
      color: "from-primary to-primary/80",
    },
  ];

  return (
    <section id="services" className="py-20 bg-transparent">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Unlock Your Inner Health with Our Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div
                className={`p-6 rounded-2xl bg-card border border-border/30  space-y-3`}
              >
                <div className={`rounded-full p-3 w-fit bg-[#18E614]`}>
                  <div className="text-white">{service.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('home')}
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 border border-border/30 ${
                    true ? " text-[#18E614]" : " text-white"
                  }`}
                >
                  <span>Get Started</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
