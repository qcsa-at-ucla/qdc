'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QDW2026Nav from '@/components/QDW2026Nav';

type SessionType = 'lecture' | 'workshop' | 'break' | 'social' | 'meal' | 'panel' | 'talk' | 'project' | 'poster';

interface Session {
  title: string;
  type: SessionType;
  speaker?: string;
  company?: string;
  talkTitle?: string;
  abstract?: string;
}

interface TimeSlot {
  time: string;
  days: (Session | null)[];
}

const sessionStyles: Record<SessionType, string> = {
  lecture:  'bg-purple-900/40 border-purple-500/50 text-purple-100',
  workshop: 'bg-green-900/40 border-green-500/50 text-green-100',
  break:    'bg-gray-800/60 border-gray-600/40 text-gray-400',
  meal:     'bg-gray-800/60 border-gray-600/40 text-gray-400',
  social:   'bg-amber-900/40 border-amber-500/50 text-amber-100',
  panel:    'bg-indigo-900/40 border-indigo-500/50 text-indigo-100',
  talk:     'bg-cyan-900/40 border-cyan-500/50 text-cyan-100',
  project:  'bg-emerald-900/40 border-emerald-500/50 text-emerald-100',
  poster:   'bg-pink-900/40 border-pink-500/50 text-pink-100',
};

const sessionDotStyles: Record<SessionType, string> = {
  lecture:  'bg-purple-400',
  workshop: 'bg-green-400',
  break:    'bg-gray-500',
  meal:     'bg-gray-500',
  social:   'bg-amber-400',
  panel:    'bg-indigo-400',
  talk:     'bg-cyan-400',
  project:  'bg-emerald-400',
  poster:   'bg-pink-400',
};

const trainingSchedule: TimeSlot[] = [
  {
    time: '8:00 – 9:00 AM',
    days: [
      { title: 'Breakfast', type: 'meal', speaker: 'Intro-background (8:45)', company: 'Eli Levenson-Falk' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
    ],
  },
  {
    time: '9:00 – 9:45 AM',
    days: [
      { title: 'Intro to cQED', type: 'lecture', speaker: 'Zlatko Minev' },
      { title: 'Noise', type: 'lecture', speaker: 'Kyle Serniak' },
      { title: 'Circuit Analysis', type: 'lecture', speaker: 'Kevin O\'Brien' },
      { title: 'Intro to Design Project', type: 'lecture', speaker: 'Murat Can Sarihan' },
    ],
  },
  {
    time: '9:45 – 10:30 AM',
    days: [
      { title: 'Intro to Circuits', type: 'lecture', speaker: 'Aziza Almanakly' },
      { title: 'Circuit Simulation', type: 'lecture', speaker: 'Jens Koch' },
      { title: 'Circuit Analysis', type: 'lecture', speaker: 'David & Lukas Pahl' },
      { title: 'Design Project', type: 'project' },
    ],
  },
  {
    time: '10:30 – 11:15 AM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '11:15 AM – 12:00 PM',
    days: [
      { title: 'Intro to Circuits Part 2', type: 'lecture', speaker: 'Nik Zhelev' },
      { title: 'Workshop – Circuit Analysis & Simulation', type: 'workshop' },
      { title: 'EM Quantum Analysis Techniques', type: 'lecture', speaker: 'Alp Sipahigil' },
      { title: 'Design Project', type: 'project' },
    ],
  },
  {
    time: '12:00 – 1:30 PM',
    days: [
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
    ],
  },
  {
    time: '1:30 – 2:15 PM',
    days: [
      { title: 'Intro to Gates', type: 'lecture', speaker: 'Eli Levenson-Falk' },
      { title: 'EM Simulations – Classical', type: 'lecture', speaker: 'Sara Sussman' },
      { title: 'Workshop – EM & Circuit Analysis', type: 'workshop', speaker: 'TBD' },
      { title: 'Designing for Foundries', type: 'talk', speaker: 'Mollie Schwartz' },
    ],
  },
  {
    time: '2:15 – 3:00 PM',
    days: [
      { title: 'Intro to Readout', type: 'lecture', speaker: 'Daniel Sank' },
      { title: 'Workshop – EM Simulations', type: 'workshop', speaker: 'Firas Abouzahr' },
      { title: 'Materials', type: 'lecture', speaker: 'Loren Alegria' },
      { title: 'Design Project', type: 'project' },
    ],
  },
  {
    time: '3:00 – 3:30 PM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '3:30 – 4:15 PM',
    days: [
      { title: 'Intro to Layout', type: 'lecture', speaker: 'Murat Can Sarihan' },
      { title: 'Couplers & 2Q Gates', type: 'lecture', speaker: 'Michael Hatridge' },
      { title: 'Error Correction Basics', type: 'talk', speaker: 'Andreas Walraff' },
      { title: 'Nanoacademic', type: 'talk', speaker: 'JJ Simulation', company: '' },
    ],
  },
  {
    time: '4:15 – 5:00 PM',
    days: [
      { title: 'Workshop – Design & Layout', type: 'workshop' },
      { title: 'Workshop – Full Device Simulation', type: 'workshop', company: 'Synopsys / Qolab', speaker: 'Dane Thompson' },
      { title: 'Large Scale Quantum', type: 'talk', speaker: 'Reza Molavi' },
      { title: 'Panel Discussion', type: 'panel', speaker: 'Zlatko Minev (Moderator: begin at 4:30 PM)' },
    ],
  },
  {
    time: '5:00 – 6:00 PM',
    days: [
      { title: 'Poster Session', type: 'poster' },
      { title: 'Quantum Beers', type: 'social' },
      { title: 'Career Session', type: 'social' },
      { title: 'Panel & Reception', type: 'panel' },
    ],
  },
  {
    time: '',
    days: [
      null,
      null,
      null,
      { title: 'Reception', type: 'social' },
    ],
  },
];

const advancedSchedule: TimeSlot[] = [
  {
    time: '8:00 – 9:00 AM',
    days: [
      { title: 'Breakfast', type: 'meal', speaker: 'Intro-background (8:45)', company: 'Eli Levenson-Falk' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
      { title: 'Breakfast', type: 'meal' },
    ],
  },
  {
    time: '9:00 – 9:45 AM',
    days: [
      { title: 'Ani Nersisyan', type: 'lecture', company: 'Google', talkTitle: 'Designing the Next Generation Google Willow Processor', abstract: `This talk details the design and development lifecycle of Google's Willow processor, our latest 105-qubit superconducting architecture designed to advance our quantum error correction roadmap. We will explore the end-to-end engineering process, highlighting the design methodology that leverages programmatic layout and agentic workflows to manage the processor's complexity. Finally, we detail our rigorous post-processing and verification strategies—including automated LVS and DRC workflows—illustrating how this highly scalable pipeline is foundational to achieving the high-performance error correction essential for future quantum milestones.` },
      { title: 'Michael Hatridge', type: 'lecture', company: 'Univ. of Pittsburgh', talkTitle: 'Applications and limits of parametric driving in superconducting circuits', abstract: `Parametric driving has long been used in very low quality factor, weakly nonlinear superconducting circuits to create nearly quantum-limited 'parametric' amplifiers, which are in wide use for the readout of superconducting qubits. However, the off-resonant terms we can activate with parametric driving are ubiquitous in Josephson-junction based circuits, and are increasingly used for a variety of gates and other controls in superconducting quantum information processors. In this talk, I'll focus on an important outstanding issue, which is our ability to explain and predict how hard we can parametrically drive our circuits before they break. I'll show recent results on matching theory and experiment on transmon qubits as parametric couplers, and discuss the prospects for extending this work to more complicated couplers and gates.` },
      { title: 'Andreas Walraff', type: 'lecture', company: 'ETH Zurich', talkTitle: 'Microwave Crosstalk in Planar Superconducting Quantum Devices', abstract: `Microwave crosstalk poses a major challenge to scaling superconducting quantum devices as it introduces excess control errors. Although its magnitude and impact have been explored in various experimental settings, quantitative physical models capable of explaining measured crosstalk for a given device geometry remain scarce. Here, we address this gap by investigating microwave crosstalk in planar superconducting devices with crossovers. We identify two structures that can lead to strong crosstalk: a drive line routed in close proximity to another qubit, and a drive line crossing a qubit-qubit coupler using an air bridge. We design and characterize devices involving these structures and develop physical models that quantitatively explain the experimentally observed crosstalk. Based on these models, we discuss the design considerations for reducing microwave crosstalk. Our results provide practical guidance for low-crosstalk device layouts and establish a basis for the systematic investigation of weaker crosstalk mechanisms.` },
      { title: 'Yvonne Gao', type: 'lecture', company: 'NUS', talkTitle: 'Robust flux-integration in bosonic cQED devices', abstract: `In this talk, I will present a series of studies from my group on developing robust hardware architectures that incorporate broadband flux tunability into high-Q bosonic cQED systems. I will highlight the evolution of these devices and their design considerations, as well as their corresponding performance. Finally, I will discuss how we use these devices to demonstrate control advantages and explore the physics of light-matter interactions.` },
    ],
  },
  {
    time: '9:45 – 10:30 AM',
    days: [
      { title: 'Shuhei Tamate', type: 'lecture', company: 'RIKEN', talkTitle: 'Building a scalable superconducting quantum computer with tileable qubit architecture', abstract: `Scaling a superconducting qubit device requires a systematic design of circuit parameters. In this talk, we will introduce the tileable qubit architecture that enables us to design a qubit chip as a periodic circuit in combination with our vertical wiring package. We will explain methods for designing a tileable qubit chip and discuss how to design a large-scale qubit chip by combining unit-cell electromagnetic simulation and circuit analysis.` },
      { title: 'Jeff Grover', type: 'lecture', company: 'MIT', talkTitle: 'Designing qubits into the 3rd dimension', abstract: `Planar arrays of superconducting qubits can carry you quite far, but at a certain scale complications invariably arise: signal-routing constraints, high crosstalk, local connectivity, yield limitations, etc. One way to circumvent these is to break out of the plane and utilize all 3 dimensions, revealing a richer design space. In this talk, we will discuss 3D-integration (3DI) techniques—such as flip-chip bump bonding and through-silicon vias (TSVs)—and design considerations when moving to 3D. We will also present new capabilities enabled by 3DI, like high-rate qLDPC codes.` },
      { title: 'Aziza Almanakly', type: 'lecture', company: 'NYU', talkTitle: 'Designing Giant Artificial Atoms', abstract: `Giant atoms are large in physical size compared to the interacting wavelength of light, resulting in quantum interference effects between different coupling points. We can realize a giant atom by coupling a superconducting artificial atom multiple times to the same waveguide. Multiple giant atoms along a waveguide exhibit interactions that depend on the physical distances between the coupling points and the qubit frequencies. Here, we exploit these interactions to implement driven-dissipative remote entanglement generation using frequency-tunable individual and correlated dissipation.` },
      { title: 'Alice & Bob', type: 'talk', company: 'Alice & Bob', speaker: 'Wes Roberts', talkTitle: 'Cat quits: design of noise-biased systems for FTQC', abstract: `The cat qubit is a superconducting quantum computing modality based on a noise-biased bosonic code. The noise bias allows one to suppress one type of error - bit flips, say - at the hardware level, leaving the remaining type of error for active error correction. This has the effect of reducing the overhead of quantum error correction, and thus has promising implications for the scalability of cat qubit-based fault-tolerant quantum computing platforms. This talk will explore the design of a dynamically stabilized cat qubit at the level of the superconducting circuit. We will focus particularly on the coupling of the memory mode to a lossy, driven buffer, and how the details of this interaction give rise to a qubit that is stabilized against one kind of error, at the cost of a relatively small increase in the other kind. While the talk will focus on the case of cat qubits, it will introduce general tools for considering the dynamics of quantum systems to engineer stability at the hardware level.` },
    ],
  },
  {
    time: '10:30 – 11:15 AM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '11:15 AM – 12:00 PM',
    days: [
      { title: 'Ebrahim Forati', type: 'lecture', company: 'Google', talkTitle: 'Electromagnetic modeling techniques for large scale', abstract: `The engineering of next-generation superconducting quantum processors necessitates a rigorous reliance on precise numerical electromagnetic modeling. This presentation will first explore the evolving landscape of numerical methodologies, addressing the specific computational challenges inherent in large-scale processor design. The latter portion of the talk will focus on high-fidelity techniques for extracting critical circuit and Hamiltonian parameters, illustrated through practical implementation examples.` },
      { title: 'Kyle Serniak', type: 'lecture', company: 'MIT Lincoln Lab', talkTitle: 'Beyond transmons: some design considerations for fluxonium qubits', abstract: `Transmon qubits are the backbone of many state-of-the-art superconducting quantum processors for a reason - they perform well and are relatively simple circuits to simulate, fabricate, and operate. However, advantages may be found by integrating slightly more complex qubit circuits in which quantum information is encoded in degrees of freedom less sensitive to environmental perturbations. The fluxonium qubit represents one step in this direction. This talk will highlight some additional considerations required to design and understand noise in fluxonium-based architectures that stem from the breakdown of common assumptions.` },
      { title: 'Yao Lu', type: 'lecture', company: 'Fermilab', talkTitle: 'Systematic Construction of Time-Dependent Hamiltonians for Microwave-Driven Josephson Circuits', abstract: `Microwave drives are essential for controlling superconducting Josephson circuits, but in realistic devices the connection between a physical drive port and the Hamiltonian parameter it modulates is often nontrivial. Packages, filters, flux lines, multi-junction loops, and distributed modes can all reshape how charge and flux drives enter the quantum model. In this talk, I will describe numerical methods for constructing time-dependent Hamiltonians directly from circuit layouts and classical microwave response. I will introduce three complementary approaches: an irrotational-gauge method for flux-driven multi-junction circuits, a displaced-frame method for parametric processes, and a field-overlap method for distributed multimode layouts. I will also show how the same response functions can map voltage noise from lossy drive ports into Hamiltonian perturbations, enabling estimates of many important decoherence rates such as the driven Purcell decay and measurement-induced dephasing. Finally, I will discuss how these tools can guide practical device design, including ongoing SQMS work on flux-driven tunable couplers for high-fidelity bosonic operations.` },
      { title: 'Holly Stemp', type: 'lecture', company: 'MIT', talkTitle: 'An Introduction to Hybrid Qubit Architectures: Coupling Superconducting and Semiconductor Spin Qubits', abstract: `Gate-defined quantum dots represent a promising candidate for a scalable qubit platform. A key advantage of quantum dots is their small physical footprint, which could enable the integration of many millions of qubits on a single chip. However, this high qubit density creates challenges in routing the on-chip classical control signals needed to scale these systems to a size capable of solving problems of real-world relevance. One promising solution is to develop long-range coupling mechanisms that utilize superconducting circuits to mediate long-range interactions between distant quantum dot spin qubits. In this talk, I will explore the motivation for combining superconducting and spin qubit technologies, highlighting the potential advantages of a hybrid qubit infrastructure and the role superconducting circuits can play in mediating long-range spin interactions. I will provide an overview of the underlying coupling mechanisms, discuss the practical engineering considerations involved in building hybrid devices, and examine how established techniques from the superconducting qubit community can be adapted to semiconductor systems. I will also discuss experimental challenges and opportunities in realizing hybrid architectures, including approaches to integrating superconducting and quantum dot devices through advanced packaging and 3D integration techniques.` },
    ],
  },
  {
    time: '12:00 – 1:30 PM',
    days: [
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
      { title: 'Lunch', type: 'meal' },
    ],
  },
  {
    time: '1:30 – 2:15 PM',
    days: [
      { title: 'Greg Peairs', type: 'talk', company: 'AWS', talkTitle: 'Schematic-Driven Design of a Quantum Processor with DeviceLayout.jl', abstract: `DeviceLayout.jl is a package developed at the Amazon Center for Quantum Computing (CQC) for computer-aided design of quantum integrated circuits. At the CQC, we use DeviceLayout.jl to design superconducting quantum devices on our path to building a fault-tolerant quantum computer—devices we've used for experiments like Demonstrating a Long-Coherence Dual-Rail Erasure Qubit Using Tunable Transmons and Hardware-efficient error correction using concatenated bosonic qubits. We developed it to allow designers to produce and iterate on device layouts quickly and easily, with an emphasis on scalability in support of both larger quantum processors and a larger, collaborative team. As examples, we'll highlight how we can use a schematic-driven workflow for layout of a 17-qubit processor in a modular, reproducible project; we'll then show how it works together with Palace, an open-source tool for electromagnetic finite-element analysis also developed at the CQC. Finally, we'll highlight how user can leverage the Julia package manager to maintain a library of versioned process technologies and components for portable, reproducible layout scripts. We have released DeviceLayout.jl on GitHub as an open-source project, where it joins Palace as part of an open-source toolchain for electronic design automation for quantum integrated circuits and other electromagnetic devices.` },
      { title: 'Kevin O\'Brien', type: 'lecture', company: 'MIT', talkTitle: 'Full System Microwave Modeling of Quantum Computers', abstract: `Superconducting quantum computers are extraordinarily complex microwave systems. Significant modeling and design effort is devoted to both quantum processors and parametric amplifier, yet the rest of the system is modelled with either (1) simple quantum models which neglect real-world effects like reflections and other parametric processes or (2) classical microwave engineering tools which may not include relevant quantum effects. In this talk, we merge the toolbox of gaussian bosonic quantum systems such as symplectic transformations, completely positive trace preserving maps, and dilation of noisy quantum systems with loss or gain, with the scattering parameter, X-parameter, and noise covariance matrix analysis techniques of microwave engineering. This enables full system modeling of the microwave environment of quantum computers based on data from scattering parameter and noise measurements, datasheets, and models. We provide open-source software and worked examples to implement the analysis techniques described above.` },
      { title: 'Taylor Patti', type: 'talk', company: 'NVIDIA', talkTitle: 'GPU Simulation and AI for the Design of Quantum Devices and Protocols', abstract: `Designing quantum devices, and figuring out how to best operate them, can be an unintuitive and time-consuming process. GPU simulations and AI assisted design can combat these challenges, greatly accelerating the parameter-to-output timeline and proposing data-driven device and control parameters. In this talk, we introduce these concepts and overview various such implementations.` },
      { title: 'Mark Gyure', type: 'lecture', company: 'UCLA', speaker: 'Mark Gyure / Chris Anderson', talkTitle: 'Device simulation of semiconductor spin qubits and applications to coupled semiconductor-superconductor systems', abstract: `Gate-defined quantum dots in silicon and germanium have shown great potential as an alternative solid state-based platform for scalable quantum computing systems. The potential of combining semiconductor qubits with superconducting elements, whether passive elements such as resonators, or superconducting qubits, has been explored recently in a few different contexts and is an area with plenty of room for further exploration, particularly as semiconductor qubits continue to mature rapidly. The aim of this talk is to educate the audience on the state of the art in simulation of spin qubits and give some examples of how these simulations can be used to aid in the design coupled super-semi hybrid systems.` },
    ],
  },
  {
    time: '2:15 – 3:00 PM',
    days: [
      { title: 'Hugh Carson', type: 'talk', company: 'AWS', talkTitle: 'Palace: Parallel Large-scale Computational Electromagnetics', abstract: `The Palace solver is a 3D finite element electromagnetics solver built within the Amazon Center for Quantum Computing (CQC) to facilitate the design of superconducting quantum devices, and making use of the MFEM and libCEED projects for efficient large-scale solving. In this talk we will discuss Palace, some features within the solver of particular relevance for quantum device designers, and some recent developments within the library to improve the overall capability and performance.` },
      { title: 'Wei Dai', type: 'lecture', company: 'Quantum Machines', talkTitle: 'Co-design of QPU and I/O lines with controller', abstract: `As superconducting quantum processing units (QPUs) scale, systematic optimization across the superconducting circuit device, the input/output (I/O) signal chain, and the controller becomes essential. Design choices on the QPU chip — both architectural decisions and quantitative port-coupling strengths — ultimately set the requirements for room-temperature controllers. Trade-offs grow sharper at scale, where the fridge cooling-power budget tightens. Conversely, certain controller features can relax constraints on the QPU design or motivate design choices that exploit them. In this talk I will walk through co-design considerations. I will review transmon sensitivity to the different noise channels, backed by experimental results from noise-injection studies. I then discuss the implications for informed design choices and I/O line configurations that make the most of available controller specifications. I close with how QPU-design-aware modeling can assist calibration and operation of the controller.` },
      { title: 'Nicola Pancotti', type: 'talk', company: 'NVIDIA', talkTitle: 'Digital Twins for Quantum Computing', abstract: `Designing a quantum processor today means stitching together many tools and simulators by hand, and most intermediate results don't make it into the next iteration. This talk presents a digital-twin framework that helps automate the chain end-to-end. The framework has three parts. (1) Accelerated solvers at each stage of the simulation chain, plus AI surrogates trained on the accumulated runs to short-circuit the expensive inner loops. (2) Explicit, machine-readable contracts between hierarchical layers — physics, quantum error correction, applications — so noise models, codes, and resource estimates can flow between them automatically. (3) Curated data pipelines that keep every artifact addressable, every dataset versioned, and every decision replayable, so calibration and experiment keep refining the twin over the lifetime of a chip. The framework is designed to build on the tools the community has already developed, not to replace them.` },
      { title: 'Nanoacademic', type: 'talk', company: 'Hybrid Simulation', speaker: 'Fadime Bekmambetova', talkTitle: 'Technology Computer-Aided Design modeling of circuit QED with semiconductor quantum dots', abstract: `Hybrid quantum systems that couple semiconductor spin qubits to superconducting circuits are promising for the future of quantum technology, as they combine a compact qubit footprint and long coherence times with long-range connectivity. To support the rigorous multi-physics simulation of these complex architectures, we will conduct a live demonstration in which we will use QTCAD® to model the coupling between a multi-gate FinFET quantum dot and a microwave resonator. Using interactive Jupyter notebooks, we will walk through the 3D geometry construction of the semiconductor device and the subsequent calculation of its electrostatic potentials and quantum mechanical eigenstates by using QTCAD®'s Poisson and Schrödinger solvers. Furthermore, the demonstration will showcase resonator design by utilizing the Quantum Metal framework for layout generation alongside QTCAD®'s Maxwell solver for eigenmode extraction. By bridging the gap between semiconductor physics and circuit QED, this session will equip attendees with the practical tools necessary to design and optimize next-generation hybrid hardware.` },
    ],
  },
  {
    time: '3:00 – 3:30 PM',
    days: [
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
      { title: 'Coffee Break', type: 'break' },
    ],
  },
  {
    time: '3:30 – 4:15 PM',
    days: [
      { title: 'Prasad Sarangapani', type: 'talk', company: 'Rigetti', talkTitle: 'Loss Characterization and Calibration in Multi-Die Superconducting Qubit Architectures', abstract: `Superconducting qubit architectures based on flip-chip and multi-die designs introduce multiple Purcell loss channels, including charge lines, flux lines, readout ports, and tunable coupler ports. In addition, qubits on individual dies experience distinct intra- and inter-die loss environments, complicating systematic characterization. We present the Resonant-Continuum Mode Coupling (RCMC) framework, which enables channel-wise loss decomposition with efficient parametric representation for general bath circuits, accommodating both lumped and distributed elements. While RCMC broadly captures both intentional and unintentional loss, we focus here on the calibration and optimization of intentional loss channels — qubit coupling to charge and flux (XYZ) drive lines and resonator decay rates to feedlines. We demonstrate direct and quantitative bridge between experimental observables and simulated loss rates, providing a general calibration methodology for intentional loss channels across varying designs and multi-die layouts.` },
      { title: 'Joseph Glick', type: 'talk', company: 'QBlox', talkTitle: 'Signal to Syndrome: The Hardware Reality of Real-Time Decoding', abstract: `Quantum error correction (QEC) is fundamentally a challenge of hardware latency and massive data throughput. As physical qubit counts scale, the sheer volume of continuous syndrome data creates a severe I/O and processing bottleneck. For device designers, the time budget to measure an ancilla qubit, digitize the signal, decode the logical error, and fire a corrective microwave or flux pulse is unforgiving—often strictly bounded under a single microsecond. If the control and decoding architectures cannot keep pace, errors accumulate faster than they can be suppressed, nullifying the fault-tolerance threshold. This talk details the recent integration of Qblox's scalable quantum control electronics with Riverlane's hardware-accelerated Deltaflow QEC decoders, and examines how this fast-feedback architecture can inform next-generation quantum device design. We will unpack the physical implementation of the Quantum Error Correction interface (QECi)—the ultra-low-latency data link connecting Qblox's deterministic SYNQ and LINK network (capable of distributing measurement outcomes across modules in ~400 ns) directly into Riverlane's FPGA-based Local Clustering Decoder (LCD). Crucially, we will explore how offloading decoding to a specialized real-time hardware layer fundamentally alters the constraints placed on the QPU itself.` },
      { title: 'Sadman Ahmed Shanto', type: 'lecture', company: 'USC', talkTitle: 'Generalizable Machine Learning Models for Superconducting Quantum Device Design', abstract: `Designing superconducting quantum devices is a complex workflow with numerous costly iterative loops. Achieving target performance metrics often depends on repeated electromagnetic (EM) simulations during layout optimization which form a severe bottleneck in the design process. This talk explores how machine learning (ML) can reduce the cost of these iterations and accelerate the design cycle. We discuss methods to alleviate the EM-simulation bottleneck, including simulation surrogates and interpretable symbolic regression. Further, we also address the field's fundamental challenge of data scarcity through layout embeddings that enable more generalizable and useful ML models.` },
      { title: 'Quantum Design', type: 'talk', speaker: 'Alex LeBon', talkTitle: 'What the Fridge: a primer on Dilution Refrigeration, Experimental Workflow, & Large Capital Equipment', abstract: `Once Superconducting Qubit packages are designed, they must be integrated into a suitable cryogenic environment. Today's dilution refrigerators do more than just get cold, they interact with every aspect of running a successful laboratory. From procurement, to fabrication, to investigation, this talk will run through some principles and best practices that will help you get the most out of your chips, your fridge, and—most importantly—your budget.` },
    ],
  },
  {
    time: '4:15 – 5:00 PM',
    days: [
      { title: 'Silvia Zorzetti', type: 'lecture', company: 'Fermilab', talkTitle: 'Coherent Quantum Transduction with SRF Cavities', abstract: `A key frontier in Quantum Information Science is establishing low-noise fiber-optic links between superconducting radio-frequency (SRF) quantum devices. High-efficiency microwave-optical transduction is therefore an enabling capability for distributed quantum computing and sensor networks. This presentation reviews quantum transduction based on coupling SRF cavities to electro-optic resonators for efficient microwave-to-optical photon conversion. Using full-wave and quantum dynamical simulations, we evaluate a hybrid architecture in which a transmon-based microwave cavity interacts with the low-frequency microwave mode of an electro-optic crystal. Our results show that this architecture can coherently mediate quantum information transfer from superconducting quantum devices over photonic quantum networks.` },
      { title: 'Helge Gehring, Simon Bilodeaus, Bianca Hanley (Lecture)', type: 'lecture', company: 'Google & QDC', speaker: 'Helge Gehring, Simon Bilodeau, Bianca Hanly', talkTitle: 'Advanced open-source layout and design', abstract: `As superconducting quantum processors increase in complexity, practices sufficient for taping out small-scale designs become bottlenecks. At the same time, the field is still evolving fast enough to eschew the standardization seen in the CMOS industry. Consequently, the flexibility of open-source tooling is attractive. In this short tripartite presentation, we will dive deeper into the open-source engines KLayout and OpenCascade/GMSH. We will first review the quirks of the GDSII format, which is ubiquitous for communicating device layouts to foundries, and present tooling built around the KLayout programmatic API that enables large-scale design. Since device layouts require physical-level modeling, we will then cover OpenCascade/GMSH, and present tooling to efficiently render and mesh 2.5D polygon-based geometries. Finally, we will review the KLayout verification engine, showing how to use it to implement and run Design vs Layout (DRC) and Layout-vs-Schematic (LvS) verification.` },
      { title: 'Edward Kluender', type: 'talk', company: 'Zurich Instruments', talkTitle: 'Designing control systems from the qubit up: co-design requirements for scaling superconducting QPUs', abstract: `Scaling superconducting QPUs beyond hundreds of qubits places demands on the control stack that generic, universal instrumentation was never designed to meet. Device designers face a fundamental tension: the control system must be flexible enough to characterize and calibrate individual qubits and couplers yet tightly integrated enough to operate at the scale and speed required for quantum error correction. Resolving this tension requires co-designing control hardware and software alongside the QPU as a core part of the device development process. Thoughtful co-design unlocks solutions to challenges that cannot be addressed effectively any other way. Examples include customized automated calibration workflows that reduce device bring-up from days to minutes; analog signal performance carefully matched to the coherence and fidelity requirements of the physical qubits; and deterministic timing across thousands of control channels coupled with real-time feedback capabilities essential for logical qubit operation. In this talk, we show through a series of co-design collaborations spanning academia and industry how this approach delivers results in practice: automated calibration, high-throughput device bring-up, custom two-qubit gate calibration, and end-to-end quantum error correction workflows.` },
      { title: 'Panel Discussion', type: 'panel', speaker: 'Zlatko Minev (Moderator, begin 4:30)' },
    ],
  },
  {
    time: '5:00 – 6:00 PM',
    days: [
      { title: 'Poster Session', type: 'poster' },
      { title: 'Quantum Beers', type: 'social' },
      { title: 'Career Session', type: 'social' },
      { title: 'Panel & Reception', type: 'panel' },
    ],
  },
  {
    time: '',
    days: [
      null,
      null,
      { title: 'QDC', type: 'social' },
      { title: 'Reception', type: 'social' },
    ],
  },
];

const days = ['Day 1\nJune 15', 'Day 2\nJune 16', 'Day 3\nJune 17', 'Day 4\nJune 18'];

const legend: { type: SessionType; label: string }[] = [
  { type: 'lecture',  label: 'Lecture' },
  { type: 'workshop', label: 'Workshop' },
  { type: 'talk',     label: 'Industry Talk' },
  { type: 'panel',    label: 'Panel / Event' },
  { type: 'project',  label: 'Design Project' },
  { type: 'poster',   label: 'Poster Session' },
  { type: 'social',   label: 'Social / Networking' },
  { type: 'break',    label: 'Break / Meal' },
];

function SessionCell({ session, onSelect }: { session: Session | null; onSelect?: (s: Session) => void }) {
  if (!session) return <div className="h-full min-h-[60px]" />;

  const styles = sessionStyles[session.type];
  const dot = sessionDotStyles[session.type];
  const hasAbstract = Boolean(session.abstract);

  const inner = (
    <>
      <div className="flex items-start gap-1.5">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-xs sm:text-sm font-semibold leading-snug whitespace-pre-line">{session.title}</span>
        {hasAbstract && (
          <svg className="ml-auto mt-0.5 w-3.5 h-3.5 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      {session.speaker && (
        <p className="text-[10px] sm:text-xs opacity-70 pl-3">{session.speaker}</p>
      )}
      {session.company && (
        <p className="text-[10px] sm:text-xs opacity-60 pl-3 italic">{session.company}</p>
      )}
    </>
  );

  if (!hasAbstract) {
    return (
      <div className={`rounded-xl border px-3 py-2 h-full min-h-[64px] flex flex-col justify-center gap-0.5 ${styles}`}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(session)}
      title={session.talkTitle}
      className={`group relative text-left w-full rounded-xl border px-3 py-2 h-full min-h-[64px] flex flex-col justify-center gap-0.5 cursor-pointer transition-all duration-200 hover:brightness-125 hover:ring-2 hover:ring-white/30 ${styles}`}
    >
      {inner}
      {/* Hover tooltip: talk title preview */}
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-40 hidden group-hover:block w-56 rounded-lg bg-[#0f0f1a] border border-white/15 px-3 py-2 text-[11px] font-medium text-white shadow-xl whitespace-normal leading-snug">
        {session.talkTitle}
        <span className="block mt-1 text-[10px] font-normal text-purple-300">Click to read the abstract →</span>
      </span>
    </button>
  );
}

export default function SchedulePage() {
  const [track, setTrack] = useState<'training' | 'advanced'>('training');
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const schedule = track === 'training' ? trainingSchedule : advancedSchedule;

  async function generatePDF() {
    if (!scheduleRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const el = scheduleRef.current;
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#05050f',
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const trackLabel = track === 'training' ? 'Training Track' : 'Advanced Track';

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();

      // Background
      pdf.setFillColor(5, 5, 15);
      pdf.rect(0, 0, pW, pH, 'F');

      // Top accent bar
      const [r, g, b] = track === 'training' ? [34, 197, 94] : [168, 85, 247];
      pdf.setFillColor(r, g, b);
      pdf.rect(0, 0, pW, 1.5, 'F');

      // Header area
      const headerH = 28;
      pdf.setFillColor(12, 12, 28);
      pdf.rect(0, 0, pW, headerH, 'F');

      // Left: event info
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('QDW 2026 Schedule', 14, 11);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(160, 160, 180);
      pdf.text('June 15–18  ·  Cohen Room & Mong Auditorium  ·  UCLA', 14, 17);

      // Right: track badge
      const badgeW = 44;
      const badgeX = pW - badgeW - 12;
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(badgeX, 6, badgeW, 10, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(trackLabel.toUpperCase(), badgeX + badgeW / 2, 12.5, { align: 'center' });

      // Divider line under header
      pdf.setDrawColor(50, 50, 80);
      pdf.setLineWidth(0.3);
      pdf.line(0, headerH, pW, headerH);

      // Legend metadata is used to reserve vertical space before drawing content.
      const legendTypes: { type: SessionType; label: string; hex: [number, number, number] }[] = [
        { type: 'lecture',  label: 'Lecture',           hex: [192, 132, 252] },
        { type: 'workshop', label: 'Workshop',          hex: [74, 222, 128] },
        { type: 'talk',     label: 'Industry Talk',     hex: [34, 211, 238] },
        { type: 'panel',    label: 'Panel / Event',     hex: [129, 140, 248] },
        { type: 'project',  label: 'Design Project',    hex: [52, 211, 153] },
        { type: 'poster',   label: 'Poster Session',    hex: [244, 114, 182] },
        { type: 'social',   label: 'Social / Network',  hex: [251, 191, 36] },
        { type: 'break',    label: 'Break / Meal',      hex: [107, 114, 128] },
      ];

      const legendMarginX = 14;
      const legendItemGap = 6;
      const legendTextOffset = 4;
      const legendFontSize = 6.5;
      const legendLineHeight = 4.3;
      const footerHeight = 12;
      const contentBottomGap = 3;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(legendFontSize);

      const legendItemWidths = legendTypes.map(({ label }) => legendTextOffset + pdf.getTextWidth(label));
      const legendUsableWidth = pW - legendMarginX * 2;

      let legendLineCount = 1;
      let legendCursor = 0;
      legendItemWidths.forEach((itemWidth) => {
        if (legendCursor === 0) {
          legendCursor = itemWidth;
          return;
        }

        if (legendCursor + legendItemGap + itemWidth > legendUsableWidth) {
          legendLineCount += 1;
          legendCursor = itemWidth;
          return;
        }

        legendCursor += legendItemGap + itemWidth;
      });

      const legendHeight = legendLineCount * legendLineHeight + 1;

      // Schedule image
      const contentY = headerH + 3;
      const reservedBottom = legendHeight + footerHeight + contentBottomGap;
      const availH = pH - contentY - reservedBottom;
      const imgAspect = canvas.width / canvas.height;
      const availW = pW - 24;

      let drawW = availW;
      let drawH = drawW / imgAspect;
      if (drawH > availH) {
        drawH = availH;
        drawW = drawH * imgAspect;
      }
      const drawX = (pW - drawW) / 2;

      pdf.addImage(imgData, 'PNG', drawX, contentY, drawW, drawH, undefined, 'FAST');

      // Legend row(s) above footer
      const footerTopY = pH - footerHeight;
      const legendTopY = footerTopY - legendHeight;

      let lx = legendMarginX;
      let ly = legendTopY + 2.8;
      legendTypes.forEach(({ label, hex }, idx) => {
        const itemWidth = legendItemWidths[idx];

        if (lx !== legendMarginX) {
          if (lx + legendItemGap + itemWidth > pW - legendMarginX) {
            lx = legendMarginX;
            ly += legendLineHeight;
          } else {
            lx += legendItemGap;
          }
        }

        pdf.setFillColor(...hex);
        pdf.circle(lx + 1.2, ly - 0.8, 1.2, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(legendFontSize);
        pdf.setTextColor(160, 160, 180);
        pdf.text(label, lx + legendTextOffset, ly);
        lx += itemWidth;
      });

      // Footer
      const footerY = footerTopY + 4;
      pdf.setFillColor(12, 12, 28);
      pdf.rect(0, footerTopY, pW, footerHeight, 'F');
      pdf.setDrawColor(50, 50, 80);
      pdf.line(0, footerTopY, pW, footerTopY);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 130);
      pdf.text('Schedule subject to change · All times Pacific Time (PT) · quantum.ucla@gmail.com', 14, footerY);

      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      pdf.setTextColor(80, 80, 100);
      pdf.text(`Generated ${dateStr}`, pW - 12, footerY, { align: 'right' });

      pdf.save(`QDW2026_Schedule_${track === 'training' ? 'Training' : 'Advanced'}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <main className="min-h-screen bg-[#05050f]">
        <QDW2026Nav />

        {/* Hero */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-transparent to-indigo-950/30 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-3">
                Quantum Device Workshop
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ textShadow: '0 0 40px rgba(147,51,234,0.3)' }}
              >
                QDW 2026 Schedule
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                June 15–18 &nbsp;·&nbsp; Cohen Room & Mong Auditorium &nbsp;·&nbsp; UCLA
              </p>
            </motion.div>

            {/* Track Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col items-center gap-4 mb-10"
            >
              <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1 gap-1">
                <button
                  onClick={() => setTrack('training')}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    track === 'training'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-900/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Training Track
                </button>
                <button
                  onClick={() => setTrack('advanced')}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    track === 'advanced'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Advanced Track
                </button>
              </div>

              {/* PDF Download Button */}
              <button
                onClick={generatePDF}
                disabled={exporting}
                className={`group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden border ${
                  track === 'training'
                    ? 'border-green-500/40 text-green-300 hover:text-white hover:border-green-400 hover:shadow-lg hover:shadow-green-900/40'
                    : 'border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-900/40'
                } disabled:opacity-50 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10`}
              >
                <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  track === 'training'
                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20'
                    : 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20'
                }`} />
                {exporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span className="relative z-10">Generating PDF…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                    </svg>
                    <span className="relative z-10">Download PDF Schedule</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {legend.map(({ type, label }) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sessionDotStyles[type]}`} />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Schedule Grid */}
            <motion.div
              key={track}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="overflow-x-auto rounded-2xl border border-white/10"
            >
              <div ref={scheduleRef} className="min-w-[700px]">
                {/* Header Row */}
                <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr] bg-white/5 border-b border-white/10">
                  <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </div>
                  {days.map((day, i) => (
                    <div key={i} className="px-3 py-3 text-center">
                      <p className={`text-xs font-bold uppercase tracking-wider whitespace-pre-line ${
                        track === 'training' ? 'text-green-400' : 'text-purple-400'
                      }`}>
                        {day}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {schedule.map((slot, rowIdx) => {
                  const isBreakRow = slot.days.every(d => d?.type === 'break' || d?.type === 'meal' || d === null);
                  return (
                    <motion.div
                      key={rowIdx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: rowIdx * 0.03 }}
                      className={`grid grid-cols-[140px_1fr_1fr_1fr_1fr] border-b border-white/5 ${
                        isBreakRow ? 'bg-white/[0.02]' : 'bg-transparent hover:bg-white/[0.03] transition-colors'
                      }`}
                    >
                      <div className="px-4 py-3 flex items-center">
                        <span className={`text-[11px] font-medium leading-snug ${
                          slot.time ? 'text-gray-400' : 'text-transparent'
                        }`}>
                          {slot.time || '—'}
                        </span>
                      </div>
                      {slot.days.map((session, colIdx) => (
                        <div key={colIdx} className="px-2 py-2">
                          <SessionCell session={session} onSelect={setSelected} />
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center text-gray-600 text-xs mt-6"
            >
              {track === 'advanced'
                ? 'Tip: hover or tap an Advanced Track talk to see its title and abstract. '
                : ''}
              Schedule subject to change. All times Pacific Time (PT). Both tracks share the same venue.
            </motion.p>
          </div>
        </section>

        {/* Abstract Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.22 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 sticky top-0" />
                <div className="p-6 sm:p-8">
                  <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">
                    Advanced Track Talk
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {selected.talkTitle}
                  </h2>
                  <p className="text-gray-300 text-sm mt-2">
                    <span className="font-semibold text-white">{selected.speaker || selected.title}</span>
                    {selected.company && <span className="text-gray-500"> &middot; {selected.company}</span>}
                  </p>
                  <div className="mt-4 h-px bg-white/10" />
                  <p className="mt-4 text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {selected.abstract}
                  </p>
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-6 w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white font-semibold rounded-full py-2.5 text-sm transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Section */}
        {/* <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-yellow-500/20 bg-yellow-900/10 p-6"
          >
            <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              Notes
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <span className="font-semibold text-white">Firas Abouzahr</span>{' '}
                <span className="text-gray-400">(Northwestern University)</span> — leads the Workshop – EM Simulations on Day 2 following Sara Sussman&apos;s lecture.
              </li>
            </ul>
          </motion.div>
        </section> */}

        {/* Footer */}
        <footer className="border-t border-white/10 py-10 px-4 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Quantum Computing Science Association — QDW 2026
          </p>
        </footer>
      </main>
    </>
  );
}
