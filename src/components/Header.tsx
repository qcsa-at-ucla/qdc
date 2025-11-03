import Image from 'next/image';

export default function Header() {
  return (
    <header className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/first_header_background.png"
          alt="Quantum background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Logo in top left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20">
        <Image
          src="/images/qdcLogo.png"
          alt="QDC Logo"
          width={120}
          height={120}
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-28 lg:h-28"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-20 max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white text-center mb-6 sm:mb-8 break-words sm:whitespace-nowrap px-2">
          Quantum Device Consortium
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white text-center max-w-4xl mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
          The Quantum Device Community aims to be an open association for pioneers of the quantum device design and simulation community.
        </p>

        {/* Join Us Button with gradient */}
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg sm:text-xl md:text-2xl px-10 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 rounded-full transition-all duration-300 ease-in-out hover:scale-105 shadow-2xl">
          Join Us
        </button>
      </div>
    </header>
  );
}
