import { motion } from "framer-motion";
import { Quote, ArrowRight, Star, ChevronLeft } from "lucide-react";

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah",
      content:
        "The progress tracker is fantastic. It's motivating to see how much I've improved over time. MentalVerse has a great mix of common and challenging words.",
    },
    {
      name: "Darlene",
      content:
        "The progress tracker is fantastic. It's motivating to see how much I've improved over time. MentalVerse has a great mix of common and challenging words.",
    },
    {
      name: "Maria",
      content:
        "The progress tracker is fantastic. It's motivating to see how much I've improved over time. MentalVerse has a great mix of common and challenging words.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-16 mx-10 bg-secondary/30 dark:bg-secondary/20 backdrop-blur-sm rounded-2xl"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Happy Clients
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-card border border-border/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#18E614]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Quote className="w-4 h-4 text-[#18E614]" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    "{testimonial.content}"
                  </p>
                  <p className="text-foreground font-medium">
                    - {testimonial.name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <div
            className={`p-3 rounded-full ${
              true
                ? "bg-[#18E614] text-white"
                : "bg-muted text-muted-foreground hover:bg-[#18E614]"
            }`}
          >
            <Star className="w-5 h-5" />
          </div>
          <motion.button className="bg-[#18E614] text-white p-3 rounded-full hover:bg-[#18E614] transition-all duration-300">
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};
