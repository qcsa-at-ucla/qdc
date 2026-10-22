import Image from "next/image";
import Link from "next/link";
import { QC_EVENT, type AgendaSession, type AgendaSpeaker } from "./event";

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
  const { overview, venue, address, agenda, agendaNote, biographiesUrl, speakers, partners } = QC_EVENT;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white px-4 pt-16 pb-16">
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

      {/* Agenda */}
      <section id="agenda" className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#002F7B]">Agenda</h2>
          {(biographiesUrl || agendaNote) && (
            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              {biographiesUrl && (
                <>
                  <a
                    href={biographiesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#002F7B] underline"
                  >
                    Speaker biographies
                  </a>
                  .{" "}
                </>
              )}
              {agendaNote}
            </p>
          )}
          <nav aria-label="Agenda days" className="mt-6 flex flex-wrap gap-3">
            {agenda.map((day) => (
              <a
                key={day.id}
                href={`#${day.id}`}
                className="rounded-full border border-[#002F7B] px-5 py-2 text-sm font-semibold text-[#002F7B] transition hover:bg-[#002F7B] hover:text-white"
              >
                {day.label} · {day.date}
              </a>
            ))}
          </nav>
          {agenda.map((day) => (
            <div key={day.id} id={day.id} className="mt-14 scroll-mt-8">
              <h3 className="border-b-2 border-[#002F7B] pb-3 text-2xl font-bold text-gray-900">
                {day.label}: <span className="font-semibold text-gray-700">{day.date}</span>
              </h3>
              <ol>
                {day.sessions.map((session) => (
                  <AgendaSessionRow key={`${session.time}-${session.title}`} session={session} />
                ))}
              </ol>
            </div>
          ))}
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

function SpeakerList({ speakers }: { speakers: AgendaSpeaker[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {speakers.map((s) => (
        <li key={`${s.label ?? ""}${s.name}`} className="text-gray-700">
          {s.label && (
            <span className="text-sm font-semibold uppercase tracking-wide text-[#002F7B]">
              {s.label}:{" "}
            </span>
          )}
          <span className="font-semibold text-gray-900">{s.name}</span>
          {s.role && <span className="text-gray-600">, {s.role}</span>}
        </li>
      ))}
    </ul>
  );
}

function AgendaSessionRow({ session }: { session: AgendaSession }) {
  const { time, title, description, speakers, tracks } = session;
  // Registration, breaks, lunch and the reception carry no detail — keep them quiet
  const isBreak = !description && !speakers?.length && !tracks?.length;

  return (
    <li className="flex flex-col gap-1 border-b border-gray-200 py-6 sm:flex-row sm:gap-8">
      <p className="shrink-0 text-sm font-bold uppercase tracking-wide text-[#002F7B] sm:w-24 sm:pt-1">
        {time}
      </p>
      <div className="min-w-0 flex-1">
        <h4 className={isBreak ? "text-lg font-semibold text-gray-500" : "text-xl font-bold text-gray-900"}>
          {title}
        </h4>
        {description && <p className="mt-2 leading-relaxed text-gray-700">{description}</p>}
        {speakers && speakers.length > 0 && <SpeakerList speakers={speakers} />}
        {tracks && tracks.length > 0 && (
          <div className="mt-6 space-y-4">
            {tracks.map((track) => (
              <div key={track.code} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h5 className="text-lg font-bold text-gray-900">
                  <span className="mr-2 inline-block rounded-md bg-[#002F7B] px-2 py-0.5 text-sm text-white">
                    {track.code}
                  </span>
                  {track.title}
                </h5>
                {track.room && (
                  <p className="mt-1 text-sm font-semibold text-[#002F7B]">Room: {track.room}</p>
                )}
                <p className="mt-2 leading-relaxed text-gray-700">{track.description}</p>
                <SpeakerList speakers={track.speakers} />
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
