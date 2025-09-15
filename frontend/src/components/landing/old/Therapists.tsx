import { FadeInSection } from '@/components/landing/MotionComponent'
import { CheckCircle, Star } from 'lucide-react';


export const Therapists: React.FC = () => {
  const therapists = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Anxiety & Depression',
      experience: '12 years',
      rating: 4.9,
      image: 'SJ',
      verified: true
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Trauma & PTSD',
      experience: '8 years',
      rating: 4.8,
      image: 'MC',
      verified: true
    },
   {
      name: 'Dr. Emily Rodriguez',
      specialty: 'Family & Couples Therapy',
      experience: '15 years',
      rating: 4.9,
      image: 'ER',
      verified: true
    },
    {
      name: 'Dr. James Wilson',
      specialty: 'Child & Adolescent Psychology',
      experience: '10 years',
      rating: 4.7,
      image: 'JW',
      verified: true
    },
    {
      name: 'Dr. Lisa Park',
      specialty: 'Mindfulness & Meditation',
      experience: '6 years',
      rating: 4.8,
      image: 'LP',
      verified: true
    },
    {
      name: 'Dr. Robert Taylor',
      specialty: 'Addiction & Recovery',
      experience: '20 years',
      rating: 4.9,
      image: 'RT',
      verified: true
    }
  ];

  return (
    <section id="therapists" className="py-20 relative">
      <div className="container mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-16">
          <p className="text-green-400 mb-4 text-sm uppercase tracking-wide">Our Team</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Licensed Mental Health Professionals</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Connect with experienced, verified therapists who specialize in various areas of mental health care.
          </p>
        </FadeInSection>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {therapists.map((therapist, index) => (
            <FadeInSection key={therapist.name} delay={index * 100}>
              <div className="bg-black/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:shadow-2xl transition-all duration-500 group hover:scale-105 h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {therapist.image}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{therapist.name}</h3>
                  <p className="text-green-400 mb-3">{therapist.specialty}</p>
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(therapist.rating) ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
                      ))}
                      <span className="text-gray-300 ml-2">{therapist.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-4">{therapist.experience} experience</p>
                  {therapist.verified && (
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
                      <span className="text-green-400 text-sm">Verified Professional</span>
                    </div>
                  )}
                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                    Book Session
                  </button>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};
