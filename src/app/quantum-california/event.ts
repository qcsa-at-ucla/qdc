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

export interface AgendaDay {
  label: string; // "Day 1: Thursday, October 22"
  time: string; // "8:00 AM – 6:00 PM"
  items: string[];
}

export const QC_EVENT = {
  name: "Quantum California Convening",
  dates: "October 22–23, 2026",
  venue: "UCLA Covel Commons",
  // TBD — awaiting GO-Biz
  address: "",
  overview: [
    "Quantum California is a partnership between the California Governor's Office, Governor's Office of Business and Economic Development (GO-Biz), and the University of California Office of the President (UCOP). The initiative was launched in November 2025 to align academia, researchers, national labs, industry, investors and government partners around a shared ecosystem for quantum innovation and job creation.",
    "During this 2-day convening hosted at UCLA, partners will explore the industry opportunities that quantum technology presents and will discuss efforts that are underway to strengthen California's quantum ecosystem.",
    "Join us as we discuss the future of quantum technologies in California.",
  ].join("\n\n"),
  // Shown above the day-by-day breakdown — the detailed agenda isn't public yet
  agendaNote:
    "Attendees are welcome to join for a single day or both. A full agenda will be published soon and sent to registered attendees. Please check this webpage for updates.",
  agenda: [
    {
      label: "Day 1: Thursday, October 22",
      time: "8:00 AM – 6:00 PM",
      items: [
        "Morning: Registration, welcome and keynote remarks",
        "Afternoon: Panels / breakout sessions",
        "Evening: Reception",
      ],
    },
    {
      label: "Day 2: Friday, October 23",
      time: "8:00 AM – 2:00 PM",
      items: ["Morning: Programming", "Afternoon: Closing session"],
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
