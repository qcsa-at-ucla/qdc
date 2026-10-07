export interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio: string;
}

export interface Partner {
  name: string;
  logo: string; // path under /public, e.g. "/images/quantum-california/gobiz-logo.png"
  href: string;
  width: number; // intrinsic pixel size, so next/image reserves the right box
  height: number;
  // Optical sizing. These marks have very different aspect ratios — the stacked
  // GO-Biz lockup needs more height than a wide wordmark to read at the same weight.
  className: string;
}

export interface AgendaItem {
  title: string; // rendered bold
  description?: string;
}

export interface AgendaSection {
  title: string;
  items: AgendaItem[];
}

export interface AgendaDay {
  label: string; // "Day 1: Thursday, October 22"
  time: string; // "8:00 AM – 6:00 PM"
  sections: AgendaSection[];
}

export const QC_EVENT = {
  name: "Quantum California Convening",
  dates: "October 22–23, 2026",
  venue: "UCLA Covel Commons",
  // TBD — awaiting GO-Biz
  address: "",
  overview: [
    "Quantum California is a partnership between the California Governor's Office, Governor's Office of Business and Economic Development (GO-Biz), and the University of California Office of the President (UCOP). The initiative was launched in November 2025 to align academia, researchers, national labs, industry, investors and government partners around a shared ecosystem for quantum innovation and job creation.",
    "During this two-day convening hosted at UCLA, partners will explore the industry opportunities that quantum technology presents and will discuss efforts that are underway to strengthen California's quantum ecosystem.",
    "Join us as we discuss the future of quantum technologies in California.",
  ].join("\n\n"),
  agendaNote: "",
  agenda: [
    {
      label: "Day 1: Thursday, October 22, 2026",
      time: "Times to be announced",
      sections: [
        {
          title: "Morning",
          items: [
            { title: "Registration & Networking" },
            { title: "Welcome Remarks" },
            { title: "UCLA’s Quantum Ecosystem", description: "A history of UCLA’s work in quantum, the transformational UCLA Research Park now under construction with $200M in state funding, and investment through California Jobs First." },
            { title: "State of the Quantum Industry", description: "A market overview of where quantum investment, revenue, and hiring are headed nationally and globally, and how California compares." },
            { title: "Fireside Chat with a Quantum Company", description: "Industry leaders discuss major recent developments and what it means for the future of California’s quantum ecosystem." },
            { title: "Fireside Chat with a Quantum Startup", description: "Founders of an emerging quantum computing company share their journey and future growth in California." },
            { title: "CIQC Panel: Realizing the Quantum Ecosystem & Building Future Talent", description: "Academic and research leaders discuss how federal investment in quantum research strengthens industry, advances R&D, and builds tomorrow’s quantum workforce." },
          ],
        },
        {
          title: "Lunch",
          items: [
            { title: "Panel: State Strategy & Investment in Motion", description: "State leaders share how California is investing in and supporting the growth of the quantum industry." },
          ],
        },
        {
          title: "Afternoon",
          items: [
            { title: "Breakout Sessions I (Attendees choose one of three concurrent sessions)" },
            { title: "1A: Investment and Acceleration", description: "How capital is accelerating growth of California’s quantum companies." },
            { title: "1B: Testbeds and Proving Grounds", description: "A conversation focused on quantum testing infrastructure." },
            { title: "1C Local to Global Quantum Ecosystems – Crafting Regional Strategies and Partnerships", description: "How international and regional partnerships and investments are turning California’s regions into industry clusters for manufacturing, supply chain, testing, and more." },
            { title: "Breakout Sessions II (Attendees choose one of three concurrent sessions)" },
            { title: "2A: Quantum Industry - Applications and Algorithms", description: "Future of applications and commercial use cases." },
            { title: "2B: Manufacturing and Production", description: "Scaling from prototypes to commercial production." },
            { title: "2C: Connecting the Workforce and Talent Pipeline", description: "California’s talent pipeline for quantum careers." },
            { title: "Panel: Quantum Advantage Through Shared Opportunity", description: "International partnerships shaping California’s quantum future." },
          ],
        },
        { title: "Reception", items: [] },
      ],
    },
    {
      label: "Day 2: Friday, October 23, 2026",
      time: "Times to be announced",
      sections: [
        {
          title: "Morning",
          items: [
            { title: "Breakfast & Networking" },
            { title: "Welcoming Remarks" },
            { title: "Expanding in the Golden State", description: "Leaders of quantum companies discuss what drew them to California and how the state’s unique advantages continue to accelerate their growth." },
            { title: "Building the California Ecosystem", description: "Research and education institutions discuss how a connected regional ecosystem strengthens California as a whole." },
            { title: "Panel: Opportunities in Aerospace, Maritime & Defense", description: "A look at how quantum technologies are opening new opportunities across aerospace, defense, and maritime applications." },
          ],
        },
        {
          title: "Lunch",
          items: [
            { title: "Lunch & Presentation: What’s Next for Quantum California", description: "GO-Biz shares the next phase of the state’s quantum strategy and opportunities for engagement going forward." },
          ],
        },
        {
          title: "Afternoon",
          items: [
            { title: "Closing Remarks" },
            { title: "Optional Site Tours & Visits", description: "Guided tours of UCLA’s quantum research facilities." },
          ],
        },
      ],
    },
  ] as AgendaDay[],
  contactEmail: "innovate@gobiz.ca.gov",
  logo: "/images/quantum-california/quantum-california-logo.png",
  logoSize: { width: 1094, height: 792 },
  // Wide white-on-navy lockup — used for link previews (OpenGraph/Twitter), not on the page itself
  banner: "/images/quantum-california/quantum-california-banner.png",
  bannerSize: { width: 1880, height: 940 },
  // Empty arrays render nothing at all — see page.tsx
  speakers: [] as Speaker[],
  // Per the layout doc's footer: GO-Biz, UCOP, UCLA.
  partners: [
    {
      name: "California Governor's Office of Business and Economic Development",
      logo: "/images/quantum-california/gobiz-logo.png",
      href: "https://business.ca.gov",
      width: 1094,
      height: 793,
      className: "h-40",
    },
    {
      name: "University of California Office of the President",
      logo: "/images/quantum-california/ucop-logo.png",
      href: "https://www.ucop.edu",
      width: 1444,
      height: 714,
      className: "h-24",
    },
    {
      name: "UCLA",
      logo: "/images/quantum-california/ucla-logo.png",
      href: "https://www.ucla.edu",
      width: 1052,
      height: 344,
      className: "h-20",
    },
  ] as Partner[],
};
