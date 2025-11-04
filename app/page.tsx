import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background with actual image - blurred */}
      <div className="absolute inset-0">
        <Image 
          src="/sheet.jpg" 
          alt="Background" 
          fill
          className="object-cover blur-sm"
          priority
          quality={100}
        />
      </div>

      {/* Main Content */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text */}
          <div>
            <p className="text-4xl md:text-5xl font-bold text-white leading-tight font-sans">
              Provide opportunity and projects to students and individuals aiming to get exposed to the field
            </p>
          </div>

          {/* Right: Tiles with hover effects - brighter and thinner */}
          <div className="flex flex-col gap-6">
            {[
              "Research Exchanges at Labs",
              "Mentorship Programs",
              "Workshops"
            ].map((title, index) => (
              <div
                key={index}
                className="group relative bg-white/15 backdrop-blur-sm rounded-xl px-8 py-4 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-gray-700/40"
              >
                <p className="text-white text-xl font-medium text-center transition-colors duration-300 ease-in-out group-hover:text-gray-400 font-sans">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
