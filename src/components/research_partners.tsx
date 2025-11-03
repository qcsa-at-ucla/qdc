import Image from 'next/image';

export default function ResearchPartners() {
  const partners = [
    {
      name: 'University of Oregon',
      logo: '/images/partners/oregon.png',
      width: 280,
      height: 100,
    },
    {
      name: 'USC',
      logo: '/images/partners/usc.png',
      width: 200,
      height: 100,
    },
    {
      name: 'Northwestern University',
      logo: '/images/partners/northwestern.png',
      width: 280,
      height: 100,
    },
    {
      name: 'Google AI Quantum',
      logo: '/images/partners/google-quantum.png',
      width: 280,
      height: 100,
    },
    {
      name: 'Niels Bohr Institute',
      logo: '/images/partners/niels-bohr.png',
      width: 280,
      height: 100,
    },
    {
      name: 'UCLA',
      logo: '/images/partners/ucla.png',
      width: 200,
      height: 100,
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center mb-12 md:mb-20">
          Research Partners
        </h2>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-full h-24 md:h-28 lg:h-32 px-4"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
