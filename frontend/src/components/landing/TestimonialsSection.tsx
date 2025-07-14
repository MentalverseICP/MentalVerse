import { Star } from "lucide-react";
import { FadeInSection } from '@/components/landing/MotionComponent'


export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Software Engineer',
      content: 'MentalVerse has revolutionized how I approach mental health. The blockchain security gives me peace of mind knowing my data is truly private.',
      rating: 5,
      avatar: 'SM'
    },
    {
      name: 'James L.',
      role: 'Student',
      content: 'The 24/7 crisis support saved my life. Having access to professional help instantly through the platform made all the difference.',
      rating: 5,
      avatar: 'JL'
    },
    {
      name: 'Maria R.',
      role: 'Teacher',
      content: 'The group therapy sessions are incredibly well-organized. I love how I can connect with others while maintaining complete privacy.',
      rating: 5,
      avatar: 'MR'
    },
    {
      name: 'David K.',
      role: 'Entrepreneur',
      content: 'The AI-powered insights have helped me understand my mental health patterns better than ever before. Truly innovative.',
      rating: 5,
      avatar: 'DK'
    }
  ];

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-16">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What Our Clients Say</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Real stories from people who have transformed their mental health journey with MentalVerse.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
          {testimonials.map((testimonial, index) => (
            <FadeInSection key={testimonial.name} delay={index * 200}>
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group hover:scale-105 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};