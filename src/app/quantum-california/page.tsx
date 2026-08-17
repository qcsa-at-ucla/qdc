import Image from "next/image";
import Link from "next/link";
import { QC_EVENT } from "./event";

export const metadata = {
  title: "Quantum California",
  description:
    "Quantum California — a statewide convening on quantum technology, October 22–23, 2026.",
};

export default function QuantumCaliforniaPage() {
  const { overview, time, venue, address, speakers, partners } = QC_EVENT;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src={QC_EVENT.logo}
            alt="Quantum California"
            width={444}
            height={313}
            priority
            className="mx-auto w-auto h-auto max-w-[320px] sm:max-w-[420px]"
          />
          <p className="mt-8 text-xl sm:text-2xl font-semibold text-[#002F7B]">
            {QC_EVENT.dates}
          </p>
          {venue && <p className="mt-2 text-lg text-gray-600">{venue}</p>}
          <Link
            href="/quantum-california/register"
            className="mt-10 inline-block rounded-full bg-[#002F7B] px-10 py-4 text-lg font-bold text-white transition hover:bg-[#001F55]"
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* Overview */}
      {overview && (
        <section className="px-4 py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#002F7B]">About the convening</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-gray-700">
              {overview}
            </p>
          </div>
        </section>
      )}

      {/* Details */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#002F7B]">Event details</h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dates</dt>
              <dd className="mt-1 text-lg text-gray-900">{QC_EVENT.dates}</dd>
            </div>
            {time && (
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">Time</dt>
                <dd className="mt-1 text-lg text-gray-900">{time}</dd>
              </div>
            )}
            {venue && (
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">Venue</dt>
                <dd className="mt-1 text-lg text-gray-900">{venue}</dd>
              </div>
            )}
            {address && (
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-gray-500">Address</dt>
                <dd className="mt-1 whitespace-pre-line text-lg text-gray-900">{address}</dd>
              </div>
            )}
          </dl>
          <p className="mt-8 text-gray-600">
            Questions?{" "}
            <a
              href={`mailto:${QC_EVENT.contactEmail}`}
              className="font-semibold text-[#002F7B] underline"
            >
              {QC_EVENT.contactEmail}
            </a>
          </p>
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

      {/* Partners — renders only when populated */}
      {partners.length > 0 && (
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#002F7B]">In partnership with</h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-12">
              {partners.map((p) => (
                <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer">
                  <Image src={p.logo} alt={p.name} width={160} height={80} className="h-16 w-auto object-contain" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

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
    </main>
  );
}
