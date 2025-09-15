import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

export const AppointmentSection: React.FC = () => {
  return (
    <section id="appointment" className="py-16 bg-transparent">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-[#18E614] rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Book An Appointment Today
            </h2>
          </div>

          <p className="text-muted-foreground text-lg mb-8">
            Book an appointment with our handpicked mental health and wellness
            experts wherever or whenever you want!
          </p>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#18E614] text-white py-3 rounded-xl font-semibold hover:bg-[#18E614]/90 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
