import { motion } from 'framer-motion';

export const HealthGuidanceSection: React.FC = () => {
  const articles = [
    {
      title: "How to Finally Stop Catastrophizing",
      image: "/src/app/Mentalverse images for lP/group-therapy-session.jpg"
    },
    {
      title: "So, Relationship OCD is a Thing",
      image: "/src/app/Mentalverse images for lP/colleagues.jpg"
    },
    {
      title: "Wait, Am I Autistic?",
      image: "/src/app/Mentalverse images for lP/people-sitting-chairs.jpg"
    }
  ];

  return (
    <section id="health-guidance" className="py-16 bg-transparent">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Health Guidance</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-card border border-border/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="relative">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-all duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-foreground font-semibold text-lg leading-tight">
                  {article.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

