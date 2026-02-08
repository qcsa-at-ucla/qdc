import Header from "@/components/Header";
import AboutUs from "@/components/about_us";
import ResearchPartners from "@/components/research_partners";
import Opportunity from "@/components/Opportunity";
import MeetingCalendar from "@/components/MeetingCalendar";
import QuantumNews from "@/components/quantum_news";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutUs />
      <QuantumNews />
      <MeetingCalendar />
      <ResearchPartners />
      {/* <Opportunity /> */}
    </main>
  );
}
