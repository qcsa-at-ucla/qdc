import Header from "@/components/Header";
import AboutUs from "@/components/about_us";
import ResearchPartners from "@/components/research_partners";
import Opportunity from "@/components/Opportunity";
import Join from "@/components/Join";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutUs />
      <ResearchPartners />
      {/* <Opportunity /> */}
      <Join/>
    </main>
  );
}
