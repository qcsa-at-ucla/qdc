export interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio: string;
}

export interface Partner {
  name: string;
  logo: string; // path under /public, e.g. "/images/quantum-california/gobiz.png"
  href: string;
}

export const QC_EVENT = {
  name: "Quantum California",
  dates: "October 22–23, 2026",
  // TBD — awaiting GO-Biz
  time: "",
  venue: "",
  address: "",
  overview: "",
  contactEmail: "innovate@gobiz.ca.gov",
  logo: "/images/quantum-california/quantum-california-logo.png",
  // Official UCLA wordmark (UCLA Blue #2774AE), used as the co-host lockup in the hero
  uclaLogo: "/images/quantum-california/ucla-logo.png",
  // Empty arrays render nothing at all — see page.tsx
  speakers: [] as Speaker[],
  partners: [] as Partner[],
};
