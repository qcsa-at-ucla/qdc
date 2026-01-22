"use client";

import Image from "next/image";

const tools = [
  {
    name: "Qiskit Metal",
    id: "qiskit-metal",
    image: "/images/tools/qiskit_quantum_device.png",
    description:
      "Qiskit Metal is used for designing superconducting quantum hardware at the chip-layout level, making it suitable for creating transmon qubits, resonators, and coupling structures. It is typically used through Python scripting or its built-in GUI to place parameterized design elements, export layouts, and interface with EM solvers such as HFSS or Sonnet. At present, Qiskit Metal is most useful for conceptual device design, exploring geometry variations, generating fabrication-ready layouts, and preparing models for downstream electromagnetic simulation.",
    github: "https://github.com/Qiskit/qiskit-metal",
  },
  {
    name: "AWS Palace",
    id: "aws-palace",
    image: "/images/tools/Palace.png",
    description:
      "AWS Palace provides a cloud-based environment for large-scale simulation of quantum hardware, particularly when classical compute resources are insufficient. It is used by uploading device descriptions and running numerical simulations on distributed AWS infrastructure, allowing workflows that include parameter sweeps, EM simulations, and optimization. Right now, it is ideal for scalable simulation campaigns, collaborative design workflows, and integrating simulation pipelines into high-performance computing environments.",
    github: "https://github.com/awslabs/palace",
  },
  {
    name: "SQUAADS",
    id: "squaads",
    image: "/images/tools/SQuADDS.png",
    description:
      "SQUAADS is used for systematic design exploration and optimization of superconducting quantum devices, focusing on automation across large multidimensional parameter spaces. Users define device parameters, cost metrics, and constraints, after which SQUAADS executes sweeps, analyzes performance, and ranks candidate designs. Currently, it is best applied when investigating how fabrication tolerances, geometric choices, or circuit scaling impact device properties, making it valuable for rapid iteration and narrowing large design spaces.",
    github: "https://github.com/LFL-Lab/SQuADDS",
  },
  {
    name: "scqubits",
    id: "scqubits",
    image: "/images/tools/scQubits.png",
    description:
      "scqubits is used for detailed quantum-level modeling of superconducting qubits, including computing spectra, anharmonicities, dispersive shifts, and wavefunctions. It is used programmatically by specifying qubit type (e.g., transmon or fluxonium) and circuit parameters and calling built-in numerical solvers to analyze Hamiltonians. Today, scqubits is particularly effective for connecting physical layouts and circuit parameters to predicted quantum behavior, validating qubit operating frequencies, and characterizing device-level performance after electromagnetic modeling.",
    github: "https://github.com/scqubits/scqubits",
  },
  {
    name: "Qultra",
    id: "Qultra",
    image: "/images/partners/superqubit.png",
    description:
      "Qultra is a comprehensive resource for quantum device design and simulation, providing valuable insights and tools for the quantum computing community. This platform offers practical implementations, research contributions, and design methodologies that support the development of superconducting quantum circuits. It serves as a bridge between theoretical concepts and practical applications, helping researchers and engineers advance their quantum device designs through proven techniques and innovative approaches.",
    github: "https://superqubit.wordpress.com/2025/08/19/qultra-quantum-hybrid-lumped-andtransmission-lines-circuits-analyzer/",
  },
];

export default function DesignToolsPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <section className="py-8 md:py-16 text-black">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black text-center mb-6">
          Design & Simulation Tools
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto px-4">
          Explore the essential tools used in quantum device design and simulation
        </p>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 md:space-y-24">
            {tools.map((tool, index) => (
              <div
                key={tool.name}
                id={tool.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 md:gap-12 items-center scroll-mt-24`}
              >
                {/* Image */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-lg aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                    <Image
                      src={tool.image}
                      alt={tool.name}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    {tool.name}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                  <a
                    href={tool.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    {tool.github.includes('github.com') ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        View on GitHub
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Visit Website
                      </>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
