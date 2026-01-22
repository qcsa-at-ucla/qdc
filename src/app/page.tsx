import Header from "@/components/Header";
import AboutUs from "@/components/about_us";
import ResearchPartners from "@/components/research_partners";
import Opportunity from "@/components/Opportunity";
import MeetingCalendar from "@/components/MeetingCalendar";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutUs />
      {/* 
        TODO: Add your Google Calendar embed URL below
        To get the URL:
        1. Go to Google Calendar → Settings → Your Calendar → Integrate calendar
        2. Copy the "Embed code" src URL
        Example: calendarUrl="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&ctz=America/Los_Angeles"
      */}
      <MeetingCalendar />
      <ResearchPartners />
      {/* <Opportunity /> */}
    </main>
  );
}
