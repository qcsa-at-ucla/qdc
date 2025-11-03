import Header from "@/components/Header";
import AboutUs from "@/components/about_us";
import ResearchPartners from "@/components/research_partners";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutUs />
      <ResearchPartners />
    </main>
  );
}
