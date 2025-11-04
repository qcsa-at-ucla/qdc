'use client';

import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

export default function AboutUs() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* What We Do Section */}
        <div className="mb-20 md:mb-32">
          <AnimatedSection direction="fade" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center mb-8 md:mb-12">
              What We Do
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <p className="text-base sm:text-lg md:text-xl text-black text-center max-w-5xl mx-auto leading-relaxed px-4">
              At QDC, we maintain and extend open-source tools for quantum device design and simulation. Our work includes contributions to widely used platforms 
              such as Qiskit Metal, AWS Palace, and other software essential for quantum research and engineering. By improving these tools, we enable researchers and 
              developers worldwide to design, simulate, and optimize superconducting quantum devices more efficiently.
            </p>
          </AnimatedSection>
        </div>

        {/* About Us Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Image */}
          <AnimatedSection direction="left" delay={0.1} className="flex justify-center lg:justify-start order-1 lg:order-1">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="bg-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl">
                <Image
                  src="/images/quantum_device_chip.png"
                  alt="Quantum Device Chip"
                  width={500}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Text Content */}
          <AnimatedSection direction="right" delay={0.2} className="order-2 lg:order-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6 md:mb-8">
              About Us
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-black leading-relaxed">
              We are a collaborative group of research scientists dedicated to advancing quantum device 
              science with a focus on superconducting systems. Supported by the Quantum Computing 
              Student Association (QCSA) at UCLA and USC, our work brings together researchers and 
              mentors from both academia and industry, including collaborators from Google Quantum 
              AI (Zlatko Minev and Murat Can Sarihan), USC (Eli Levenson-Falk and Shanto), Chapman 
              University (Abhishek), Northwestern University (Jens Koch), the University of Oregon (Nik 
              Zhelev), and the Niels Bohr Institute, among others. United by a shared commitment to 
              innovation and discovery, we strive to deepen the understanding of quantum phenomena 
              and advance the future of superconducting quantum technologies.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
