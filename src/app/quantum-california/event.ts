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

export interface AgendaSpeaker {
  name: string;
  role?: string; // omitted for "Speaker TBA"
  label?: "Moderator" | "Introduction";
}

export interface AgendaTrack {
  code: string; // "1A"
  title: string;
  description: string;
  speakers: AgendaSpeaker[];
}

export interface AgendaSession {
  time: string; // "9:15 AM"
  title: string;
  description?: string;
  speakers?: AgendaSpeaker[];
  tracks?: AgendaTrack[]; // concurrent breakout sessions
}

export interface AgendaDay {
  id: string; // anchor for the day jump links
  label: string; // "Day 1"
  date: string; // "Thursday, October 22"
  sessions: AgendaSession[];
}

const GOBIZ =
  "Governor's Office of Business and Economic Development (GO-Biz)";
const CQSE_UCLA = "Center for Quantum Science and Engineering, UCLA";

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
  agendaNote:
    "Speakers and times are subject to change. Additional speakers will be announced as they are confirmed.",
  agenda: [
    {
      id: "day-1",
      label: "Day 1",
      date: "Thursday, October 22",
      sessions: [
        { time: "8:00 AM", title: "Registration & Networking" },
        {
          time: "9:00 AM",
          title: "Welcome Remarks",
          description:
            "Speakers set the stage for the day ahead, share insights on California's leadership in the quantum sector following the launch of Quantum California the prior year, and discuss how this convening sets up participants for ongoing engagement and collaboration.",
          speakers: [
            { name: "Barak Bussel", role: `Managing Partner, 7i Capital; Chair, ${CQSE_UCLA}` },
            { name: "Julio Frenk", role: "Chancellor, UCLA" },
            { name: "Dee Dee Myers", role: `Senior Advisor to the Governor and Director, ${GOBIZ}` },
          ],
        },
        {
          time: "9:15 AM",
          title: "Keynote: The Momentum Behind Quantum California",
          description:
            "How the future of quantum is happening in California, and how the Golden State's research and academic institutions position it to lead for years to come.",
          speakers: [
            {
              name: "Assemblymember Buffy Wicks",
              role: "Chair, Assembly Appropriations Committee, California State Assembly",
            },
            {
              name: "Assemblymember Jesse Gabriel",
              role: "Chair, Assembly Budget Committee, California State Assembly",
            },
          ],
        },
        {
          time: "9:35 AM",
          title: "UCLA's Quantum Ecosystem and the UCLA Research Park",
          description:
            "A brief history of UCLA's work in quantum, the transformational UCLA Research Park now under construction with $200M in state funding, and state investment through California Jobs First.",
          speakers: [{ name: "Eric Hudson", role: `Director, ${CQSE_UCLA}` }],
        },
        {
          time: "10:00 AM",
          title: "Fireside Chat with IBM and HRL: A New Chapter in California",
          description:
            "Following IBM's acquisition of HRL Laboratories, leaders from both organizations discuss why the deal came together, how HRL's silicon qubit work fits IBM's roadmap, and what the combination means for California's quantum ecosystem and the road to fault-tolerant machines.",
          speakers: [
            {
              name: "Thaddeus Ladd",
              role: "Chief Scientist, Qubit Systems Laboratory, HRL Laboratories (an IBM company)",
            },
            {
              name: "Matthew Borselli",
              role: "Vice President, Qubit Systems Laboratory, HRL Laboratories (an IBM company)",
            },
            {
              label: "Moderator",
              name: "Jamie Garcia",
              role: "Director, Strategic Growth & Quantum Partnerships; Senior Research Executive, IBM Research",
            },
          ],
        },
        { time: "10:25 AM", title: "Networking Break" },
        {
          time: "10:45 AM",
          title: "Fireside Chat with Oratomic: From Breakthrough to Buildout",
          description:
            "Oratomic's founders discuss the result that put a 10,000-qubit neutral-atom architecture on the map, the $300M raise that followed, and what it takes to turn a breakthrough paper into a company building machines in California, from talent and facilities to the partners and customers it needs next.",
          speakers: [
            { label: "Moderator", name: "Ray Jayawardhana", role: "President, Caltech" },
            { name: "Dolev Bluvstein", role: "CEO, Oratomic; Visiting Associate Professor, Caltech" },
          ],
        },
        {
          time: "11:20 AM",
          title: "CIQC Renewed: Realizing the Quantum Ecosystem and Building Future Quantum Talent",
          description:
            "Academic and research partners behind the recently renewed $37.5M NSF Quantum Leap Challenge Institute discuss how federal investment in California's quantum research apparatus continues to strengthen industry architectures, advance R&D, and cultivate future generations of workforce talent.",
          speakers: [
            { label: "Introduction", name: "Miguel García-Garibay", role: "Dean of Physical Sciences, UCLA" },
            { name: "Eric Hudson", role: `Director, ${CQSE_UCLA}` },
            { name: "Ania Bleszynski Jayich", role: "Professor of Physics, UC Santa Barbara" },
            {
              name: "John Preskill",
              role: "Richard P. Feynman Professor of Theoretical Physics; Director, Institute for Quantum Information and Matter; Caltech",
            },
            { name: "Justin Perron", role: "Professor, Department of Physics, CSU San Marcos" },
            {
              label: "Moderator",
              name: "Shimon Kolkowitz",
              role: "Herst Chair Associate Professor, UC Berkeley; Director, NSF Challenge Institute for Quantum Computation (CIQC)",
            },
          ],
        },
        { time: "12:10 PM", title: "Lunch" },
        {
          time: "1:10 PM",
          title: "Accelerating California's Quantum Workforce",
          description:
            "The California Workforce Development Board shares how the State is aligning its workforce and education systems with the needs of the quantum industry, and how employers, colleges, and training partners can plug in.",
          speakers: [
            { name: "Kaina Pereira", role: "Executive Director, California Workforce Development Board" },
          ],
        },
        {
          time: "1:20 PM",
          title: "Google Quantum AI",
          description:
            "Google Quantum AI shares the latest from its Santa Barbara lab, from the Willow processor and the Quantum Echoes verifiable-advantage result to the path toward a useful quantum computer.",
          speakers: [
            { name: "Sergio Boixo", role: "Director, Quantum Computing, Google Quantum AI Lab" },
          ],
        },
        {
          time: "1:45 PM",
          title: "Panel: Quantum California, State Strategy and Investment in Motion",
          description:
            "Members of the Governor's Cabinet and legislative leaders share the State's investments, what they have learned, and what is on the horizon, including how programs such as Jobs First work in tandem with industry to encourage commercialization, workforce development, and the integration of quantum technology.",
          speakers: [
            {
              label: "Introduction",
              name: "Ah-Hyung “Alissa” Park",
              role: "Dean, UCLA Samueli School of Engineering",
            },
            { name: "Tim Grayson", role: "California State Senator" },
            { name: "Dee Dee Myers", role: `Senior Advisor to the Governor and Director, ${GOBIZ}` },
            {
              name: "Nick Maduros",
              role: "Secretary, California Government Operations Agency (GovOps)",
            },
            {
              label: "Moderator",
              name: "Nani Coloretti",
              role: "Cabinet Secretary, Office of Governor Gavin Newsom",
            },
          ],
        },
        {
          time: "2:45 PM",
          title: "Breakout Sessions I",
          description: "Attendees choose one of three concurrent sessions.",
          tracks: [
            {
              code: "1A",
              title: "Investment and Acceleration",
              description:
                "How venture and institutional capital are accelerating the growth of California's quantum companies.",
              speakers: [
                { name: "Alan Ho", role: "Co-Founder and CEO, Qolab" },
                { name: "Carmen Palacios-Berraquero", role: "Founder and CEO, Nu Quantum" },
                { name: "Tim Day", role: "Chairman and CEO, Monarch Quantum" },
                { name: "Dolev Bluvstein", role: "Co-Founder and CEO, Oratomic" },
                {
                  label: "Moderator",
                  name: "Barak Bussel",
                  role: `Managing Partner, 7i Capital; Chair, ${CQSE_UCLA}`,
                },
              ],
            },
            {
              code: "1B",
              title: "Testbeds and Proving Grounds",
              description:
                "The latest on how California's national laboratory, university, and space-focused testbeds are expanding access to the facilities where quantum technology is developed and proven.",
              speakers: [
                {
                  name: "Chris Spitzer",
                  role: "Quantum Research Program Manager, Lawrence Berkeley National Laboratory",
                },
                {
                  name: "Gunther Haller",
                  role: "Chief Technologist, Technology Innovation Directorate, SLAC National Accelerator Laboratory",
                },
                {
                  name: "Jason Hyon",
                  role: "Director, Quantum Space Innovation Center (QSIC), NASA Jet Propulsion Laboratory",
                },
                {
                  name: "Ramesh Rao",
                  role: "Director, Qualcomm Institute (Calit2); Distinguished Professor of Electrical and Computer Engineering, UC San Diego",
                },
                {
                  label: "Moderator",
                  name: "Claire Cramer",
                  role: "Executive Director, Berkeley Quantum and the Challenge Institute of Quantum Computation (CIQC), UC Berkeley",
                },
              ],
            },
            {
              code: "1C",
              title: "Local to Global Quantum Ecosystems, Crafting Regional Strategies and Partnerships",
              description:
                "How international and regional partnerships and investments are turning California's regions into industry clusters for manufacturing, supply chain, testing, and more.",
              speakers: [
                { name: "Tanya Bennett", role: "Australian Consul-General, Los Angeles" },
                { name: "Josh Boswell", role: "Vice President of Strategy + Policy, REACH Central Coast" },
                {
                  name: "Jermaine Hampton",
                  role: "Vice President, Workforce Development and Special Projects, Los Angeles County Economic Development Corporation (LAEDC)",
                },
                { name: "Speaker TBA" },
                { label: "Moderator", name: "David Steuerman", role: `Executive Director, ${CQSE_UCLA}` },
              ],
            },
          ],
        },
        { time: "3:30 PM", title: "Networking Break" },
        {
          time: "3:40 PM",
          title: "Breakout Sessions II",
          description: "Attendees choose one of three concurrent sessions.",
          tracks: [
            {
              code: "2A",
              title: "Quantum Industry, Applications and Algorithms",
              description:
                "Where quantum applications are headed and which use cases are closest to delivering commercial value.",
              speakers: [
                { name: "Russell Stutz", role: "Senior Director, Product Technologies, Quantinuum" },
                { name: "Martin Roetteler", role: "Vice President, Quantum Applications R&D, IonQ" },
                { name: "Khadijeh Sona Najafi", role: "Quantum Solution Manager, IQM Quantum Computers" },
                {
                  label: "Moderator",
                  name: "Kristi Beck",
                  role: "Director, Livermore Center for Quantum Science, Lawrence Livermore National Laboratory",
                },
              ],
            },
            {
              code: "2B",
              title: "Manufacturing and Production",
              description:
                "What it takes to move quantum hardware from lab-built prototypes to commercial-scale manufacturing, and how to clear the bottlenecks in enabling technologies.",
              speakers: [
                {
                  name: "Lawrence Lee",
                  role: "Senior Director, Commercialization Group, and Program Director, NIST Quantum Manufacturing Engineering Center, SRI International",
                },
                { name: "Robert Larisch", role: "Senior Vice President, Global Supply Chain, PsiQuantum" },
                {
                  name: "Robert Visser",
                  role: "Vice President, Engineering Technology, Office of the CTO, Applied Materials",
                },
                { name: "Speaker TBA" },
                {
                  label: "Moderator",
                  name: "Chee Wei Wong",
                  role: "Tannas Professor of Engineering, Electrical and Computer Engineering, UCLA",
                },
              ],
            },
            {
              code: "2C",
              title: "Connecting the Workforce and Talent Pipeline",
              description:
                "How California's education and workforce systems are preparing the talent pipeline for careers in quantum.",
              speakers: [
                {
                  name: "Brian Monacelli",
                  role: "Professor and Director of Laser Technology, Pasadena City College",
                },
                { name: "Ania Bleszynski Jayich", role: "Professor of Physics, UC Santa Barbara" },
                {
                  name: "Javier Sanchez-Yamagishi",
                  role: "Associate Professor of Physics and Astronomy and Assistant Director, Eddleman Quantum Institute, UC Irvine",
                },
                {
                  label: "Moderator",
                  name: "Richard Ross",
                  role: "Program Director, Master of Quantum Science and Technology (MQST), UCLA",
                },
              ],
            },
          ],
        },
        {
          time: "4:30 PM",
          title: "Panel: Quantum Advantage Through Shared Opportunity",
          description:
            "International partnerships shaping California's quantum future, with a focus on the growing collaboration between California and the United Kingdom.",
          speakers: [
            { name: "Paul Rennie", role: "British Consul General, Los Angeles" },
            { label: "Moderator", name: "TBA" },
          ],
        },
        {
          time: "5:05 PM",
          title: "Closing Remarks & Preview of Day 2",
          description: "Wrapping up the day and looking ahead to Day 2.",
        },
        { time: "5:10 PM", title: "Reception" },
      ],
    },
    {
      id: "day-2",
      label: "Day 2",
      date: "Friday, October 23",
      sessions: [
        { time: "8:00 AM", title: "Breakfast & Networking" },
        {
          time: "9:00 AM",
          title: "Welcoming Remarks",
          description:
            "Speakers set the stage for the day ahead and share how California's research institutions and public partners are carrying Quantum California forward.",
          speakers: [
            { name: "Shouleh Nikzad", role: "Chief Technologist, NASA Jet Propulsion Laboratory" },
            {
              name: "Lark Park",
              role: "Executive Director, California Education Learning Lab; Regent, University of California",
            },
          ],
        },
        {
          time: "9:25 AM",
          title: "Expanding in the Golden State",
          description:
            "Leaders of quantum companies that have chosen to locate and expand in California and the Los Angeles area discuss what drew them to the state, from proximity to research institutions, talent, and testbeds to capital, and what will keep them growing.",
          speakers: [
            {
              label: "Introduction",
              name: "Kelly LoBianco",
              role: "Director, Los Angeles County Department of Economic Opportunity",
            },
            { name: "Alex Shih", role: "Vice President of Product, Q-CTRL" },
            { name: "James Guilmart", role: "Lead Product Manager, Q-CTRL" },
            { name: "Reza Nejabati", role: "Head of Quantum Research and Quantum Labs, Cisco" },
            { name: "Stefanie Tardo", role: "Chief Operating Officer, Diraq" },
            { name: "Keith Wright", role: "Head of US Business Development, Quantum Machines" },
          ],
        },
        {
          time: "10:30 AM",
          title: "Building the California Ecosystem",
          description:
            "Research and education institutions across the state, from Pasadena to Riverside to San Diego, discuss how a connected regional ecosystem strengthens California as a whole.",
          speakers: [
            {
              name: "Rosa Di Felice",
              role: "Professor of Physics and Astronomy and Quantitative and Computational Biology, USC",
            },
            {
              name: "Hirosi Ooguri",
              role: "Division Chair and Kent and Joyce Kresa Leadership Chair, Division of Physics, Mathematics and Astronomy, Caltech",
            },
            {
              name: "Michael Sailor",
              role: "Distinguished Professor of Chemistry and Biochemistry and Director, NSF Materials Research Science and Engineering Center, UC San Diego",
            },
            {
              name: "Nathaniel Gabor",
              role: "Professor of Physics and Astronomy and Director, Center for Quantum Vibronics in Energy and Time, UC Riverside",
            },
          ],
        },
        { time: "11:25 AM", title: "Networking & Coffee" },
        {
          time: "11:45 AM",
          title: "Panel: Opportunities in Aerospace, Maritime, and Defense",
          description:
            "How quantum materials, sensing, timing, and communications technologies are opening new opportunities in aerospace, defense, and maritime applications, and how California's defense economy strengths position the state to lead.",
          speakers: [
            { name: "Karl Jacob", role: "Commercial Strategy Office, DARPA" },
            {
              name: "Andrew Mollner",
              role: "Principal Director, Electronics and Photonics Laboratory, The Aerospace Corporation",
            },
          ],
        },
        {
          time: "12:40 PM",
          title: "Lunch & Presentation: Quantum California, Strategy and What's Next",
          description:
            "Lunch is served while GO-Biz presents the next phase of Quantum California: the priorities ahead, upcoming investments, and how participants can stay engaged in the year to come.",
          speakers: [
            {
              name: "Trelynd Bradley",
              role: `Deputy Director, Innovation and Emerging Technologies, ${GOBIZ}`,
            },
          ],
        },
        {
          time: "1:30 PM",
          title: "Closing Remarks",
          description:
            "Closing reflections on the two days and the commitments carried forward, from GO-Biz and UCLA.",
        },
        {
          time: "1:35 PM",
          title: "Site Tours & Visits (Optional)",
          description:
            "Optional guided tours of UCLA quantum research labs, including trapped-ion quantum computing, quantum optics, and superconducting qubit facilities.",
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
