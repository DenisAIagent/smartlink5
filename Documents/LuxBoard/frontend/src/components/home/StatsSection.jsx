const StatsSection = () => {
  const stats = [
    {
      number: "500+",
      label: "Prestataires Premium",
      description: "Un réseau exclusif de partenaires de luxe"
    },
    {
      number: "98%",
      label: "Satisfaction Client",
      description: "Taux de satisfaction de nos utilisateurs"
    },
    {
      number: "24/7",
      label: "Support Dédié",
      description: "Une équipe à votre écoute en permanence"
    },
    {
      number: "10k+",
      label: "Demandes Traitées",
      description: "Expérience éprouvée dans le service premium"
    }
  ];

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-2">
                {stat.number}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {stat.label}
              </h3>
              <p className="text-gray-400">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection; 