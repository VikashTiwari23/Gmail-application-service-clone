import { useEffect, useState } from "react";
import { get } from "./api";

interface DraftMail {
  id?: string | number;
  to?: string;
  subject?: string;
  content?: string;
}

const getPlainText = (html?: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, script, title").forEach((el) => el.remove());
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

const formatRecipient = (to?: string) => {
  if (!to) return "(No Recipient)";
  const match = to.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : to;
};

const Draft = () => {
  const [loading, setLoading] = useState(true);
  const [mails, setMails] = useState<DraftMail[]>([]);
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState<DraftMail | null>(null);

  useEffect(() => {
    get("/api/email/draft")
      .then(setMails)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen w-full px-6 py-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
          <h1 className="text-yellow-400 font-bold text-3xl tracking-wide uppercase">
            Drafts
          </h1>
          {!loading && !error && (
            <span className="text-sm text-zinc-400">
              {mails.length} drafts
            </span>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-zinc-900 rounded-lg animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Error Banner */}
        {!loading && error && (
          <div className="bg-red-950/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && mails.length === 0 && (
          <p className="text-zinc-500 text-center py-12">No drafts saved.</p>
        )}

        {/* Draft Rows */}
        {!loading && !error && mails.length > 0 && (
          <div className="flex flex-col divide-y divide-zinc-800 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {mails.map((draft, index) => (
              <div
                key={draft.id ?? index}
                onClick={() => setSelectedMail(draft)}
                className="grid grid-cols-[200px_240px_1fr_auto] items-center gap-4 px-4 py-3.5 hover:bg-zinc-800/80 cursor-pointer transition-colors"
              >
                <div className="min-w-0 truncate font-semibold text-zinc-100 text-sm">
                  {formatRecipient(draft.to)}
                </div>
                <div className="min-w-0 truncate font-medium text-yellow-400/90 text-sm">
                  {draft.subject || "(No Subject)"}
                </div>
                <div className="min-w-0 truncate text-zinc-400 text-sm">
                  {getPlainText(draft.content) || "No additional text"}
                </div>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                  Draft
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Draft Reader Modal */}
      {selectedMail && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMail(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-zinc-800 flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-semibold text-yellow-400 break-words">
                    {selectedMail.subject || "(No Subject)"}
                  </h2>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                    Draft
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-1 break-all">
                  To: {selectedMail.to || "(No Recipient)"}
                </p>
              </div>
              <button
                onClick={() => setSelectedMail(null)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm shrink-0 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto text-zinc-200 whitespace-pre-wrap text-sm leading-relaxed">
              {getPlainText(selectedMail.content) || "No additional text"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Draft;