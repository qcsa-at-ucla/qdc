import Image from "next/image";
import Link from "next/link";
import { QC_EVENT } from "./event";

const description =
  "Quantum California Convening — October 22–23, 2026 at UCLA Covel Commons. A statewide convening on quantum innovation and job creation.";

export const metadata = {
  title: "Quantum California",
  description,
  openGraph: {
    title: QC_EVENT.name,
    description,
    images: [
      {
        url: QC_EVENT.banner,
        width: QC_EVENT.bannerSize.width,
        height: QC_EVENT.bannerSize.height,
        alt: QC_EVENT.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: QC_EVENT.name,
    description,
    images: [QC_EVENT.banner],
  },
};

export default function QuantumCaliforniaPage() {
  const { overview, venue, address, agenda, agendaNote, speakers, partners } = QC_EVENT;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src={QC_EVENT.logo}
            alt="Quantum California"
            width={QC_EVENT.logoSize.width}
            height={QC_EVENT.logoSize.height}
            priority
            className="mx-auto w-auto h-auto max-w-[260px] sm:max-w-[360px]"
          />
          <h1 className="mt-10 text-3xl sm:text-4xl font-bold text-[#002F7B]">
            {QC_EVENT.name}
          </h1>
          {/* Dates and venue read as one line on desktop, two on mobile */}
          <p className="mt-3 text-lg sm:text-xl text-gray-700">
            <span className="font-semibold">{QC_EVENT.dates}</span>
            {venue && (
              <>
                <span className="hidden sm:inline text-gray-400"> | </span>
                <span className="block sm:inline">{venue}</span>
              </>
            )}
          </p>
          <Link
            href="/quantum-california/register"
            className="mt-10 inline-block rounded-full bg-[#002F7B] px-10 py-4 text-lg font-bold text-white transition hover:bg-[#001F55]"
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* Event Overview */}
      {overview && (
        <section className="px-4 py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#002F7B]">Event Overview</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-gray-700">
              {overview}
            </p>
          </div>
        </section>
      )}

      {/* Agenda At-a-Glance */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#002F7B]">Agenda At-a-Glance</h2>
          {agendaNote && <p className="mt-6 text-lg leading-relaxed text-gray-700">{agendaNote}</p>}
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {agenda.map((day) => (
              <div key={day.label} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-xl font-bold text-gray-900">{day.label}</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {day.time}
                </p>
                <ul className="mt-4 space-y-2 text-gray-700">
                  {day.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#002F7B]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {address && (
            <p className="mt-10 whitespace-pre-line text-gray-600">
              <span className="font-semibold text-gray-900">{venue}</span>
              {"\n"}
              {address}
            </p>
          )}
        </div>
      </section>

      {/* Speakers — renders only when populated */}
      {speakers.length > 0 && (
        <section className="px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#002F7B]">Speakers</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {speakers.map((s) => (
                <div key={s.name} className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500">
                    {s.title}
                    {s.organization ? ` · ${s.organization}` : ""}
                  </p>
                  <p className="mt-3 text-gray-700">{s.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions? */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#002F7B]">Questions?</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Contact{" "}
            <a
              href={`mailto:${QC_EVENT.contactEmail}`}
              className="font-semibold text-[#002F7B] underline"
            >
              {QC_EVENT.contactEmail}
            </a>{" "}
            with any questions about the convening, registration, or Quantum CA.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#002F7B] px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">Join us in October</h2>
        <Link
          href="/quantum-california/register"
          className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-[#002F7B] transition hover:bg-gray-100"
        >
          RSVP
        </Link>
      </section>

      {/* Partners — renders only when populated */}
      {partners.length > 0 && (
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#002F7B]">In partnership with</h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
              {partners.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:opacity-70"
                >
                  <Image
                    src={p.logo}
                    alt={p.name}
                    width={p.width}
                    height={p.height}
                    className={`${p.className} w-auto object-contain`}
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
