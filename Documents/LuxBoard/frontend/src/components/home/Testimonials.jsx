import { StarIcon } from '@heroicons/react/24/solid';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "LuxBoard a transformé notre approche de la conciergerie. Une plateforme intuitive et efficace.",
      author: "Sophie Martin",
      role: "Directrice de Conciergerie, Hôtel de Crillon",
      rating: 5
    },
    {
      quote: "Un outil indispensable pour gérer nos demandes VIP. Le support est exceptionnel.",
      author: "Thomas Dubois",
      role: "Concierge en Chef, Four Seasons",
      rating: 5
    },
    {
      quote: "La qualité du réseau de prestataires est remarquable. Un vrai gain de temps.",
      author: "Marie Laurent",
      role: "Manager, Luxury Concierge Services",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4">
            Ce Qu'en Disent Nos Clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les retours d'expérience de nos utilisateurs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-[#F8F9FA] p-8 rounded-lg relative"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-[#D4AF37]" />
                ))}
              </div>
              
              <blockquote className="text-lg text-gray-700 mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              <div>
                <p className="font-bold text-black">
                  {testimonial.author}
                </p>
                <p className="text-sm text-gray-600">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 