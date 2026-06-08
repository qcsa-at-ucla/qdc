import Link from 'next/link';

export interface PosterEntry {
  id: string;
  name: string;
  designation: string;
  location: string;
  registrationType: string;
  projectTitle: string;
  projectDescription: string;
  hasPoster?: boolean;
  approvedAt: string | null;
  createdAt: string;
}

interface QDWPosterGalleryProps {
  posters: PosterEntry[];
  emptyMessage?: string;
  showViewLinks?: boolean;
  className?: string;
}

const DEFAULT_PREVIEW_BLOCKLIST = ['abhishek rakshit', 'richard ho', 'varun ramaprasad'];

function formatRegistrationType(type: string): string {
  if (type === 'student_in_person') return 'Student (In Person)';
  if (type === 'student_online') return 'Student (Online)';
  return 'Student';
}

export default function QDWPosterGallery({
  posters,
  emptyMessage = 'No posters found for this search.',
  showViewLinks = true,
  className = '',
}: QDWPosterGalleryProps) {
  return (
    <div className={className}>
      {posters.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
          <p className="text-white/70">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posters.map((entry) => {
            const lowerName = entry.name.toLowerCase();
            const previewBlocked = DEFAULT_PREVIEW_BLOCKLIST.includes(lowerName);

            return (
              <article
                key={entry.id}
                className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                    {formatRegistrationType(entry.registrationType)}
                  </span>
                  {entry.approvedAt && (
                    <span className="text-xs text-white/50">
                      Approved {new Date(entry.approvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-xl font-bold text-white leading-tight">{entry.projectTitle}</h2>

                <p className="mt-3 text-sm text-white/75 line-clamp-5 min-h-[7.5rem]">
                  {entry.projectDescription || 'No description provided.'}
                </p>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{entry.name}</p>
                    {entry.designation && <p className="text-xs text-white/70">{entry.designation}</p>}
                    {entry.location && <p className="text-xs text-white/60">{entry.location}</p>}
                  </div>
                  <div className="w-32 h-20 shrink-0 rounded-lg border border-white/15 bg-black/40 overflow-hidden">
                    {entry.hasPoster && !previewBlocked && (
                      <iframe
                        title={`${entry.projectTitle} poster preview`}
                        src={`/api/qdw/view-poster?id=${encodeURIComponent(entry.id)}#page=1&view=FitH`}
                        className="w-full h-full pointer-events-none"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>

                {showViewLinks && !previewBlocked && (
                  <div className="mt-5 flex items-center justify-between">
                    <Link
                      href={`/api/qdw/view-poster?id=${encodeURIComponent(entry.id)}&t=${Date.now()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-purple-500 hover:bg-purple-600 transition-colors px-4 py-2 text-sm font-semibold text-white"
                    >
                      View Poster PDF
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}