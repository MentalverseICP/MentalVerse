import { motion } from 'framer-motion';
import { Quote, ArrowRight } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah",
      content: "The progress tracker is fantastic. It's motivating to see how much I've improved over time. MentalVerse has a great mix of common and challenging words."
    },
    {
      name: "Darlene", 
      content: "The progress tracker is fantastic. It's motivating to see how much I've improved over time. MentalVerse has a great mix of common and challenging words."
    },
    {
      name: "Maria",
      content: "The progress tracker is fantastic. It's motivating to see how much I've improved over time. MentalVerse has a great mix of common and challenging words."
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Happy Clients</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Quote className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    "{testimonial.content}"
                  </p>
                  <p className="text-foreground font-medium">- {testimonial.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <span>View All Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};