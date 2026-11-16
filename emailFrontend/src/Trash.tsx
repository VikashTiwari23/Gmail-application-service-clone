import { useEffect, useState } from "react";
import { get } from "./api";

interface Mail {
  from: string;
  subject: string;
  content: string;
}

const getPlainText = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, script, title").forEach((el) => el.remove());
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

const formatSender = (from: string) => {
  if (!from) return "Unknown";
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from;
};

const Trash = () => {
  const [loading, setLoading] = useState(true);
  const [mails, setMails] = useState<Mail[]>([]);
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);

  useEffect(() => {
    get("/api/email/trash")
      .then(setMails)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen w-full px-6 py-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
          <h1 className="text-yellow-400 font-bold text-3xl tracking-wide uppercase">
            Trash
          </h1>
          {!loading && !error && (
            <span className="text-sm text-zinc-400">
              {mails.length} messages
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
          <p className="text-zinc-500 text-center py-12">Trash is empty.</p>
        )}

        {/* Email Rows */}
        {!loading && !error && mails.length > 0 && (
          <div className="flex flex-col divide-y divide-zinc-800 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {mails.map((message, index) => (
              <div
                key={index}
                onClick={() => setSelectedMail(message)}
                className="grid grid-cols-[180px_240px_1fr] items-center gap-4 px-4 py-3.5 hover:bg-zinc-800/80 cursor-pointer transition-colors"
              >
                <div className="min-w-0 truncate font-semibold text-zinc-100 text-sm">
                  {formatSender(message.from)}
                </div>
                <div className="min-w-0 truncate font-medium text-yellow-400/90 text-sm">
                  {message.subject || "(No Subject)"}
                </div>
                <div className="min-w-0 truncate text-zinc-400 text-sm">
                  {getPlainText(message.content)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Email Reader Modal */}
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
                <h2 className="text-xl font-semibold text-yellow-400 break-words">
                  {selectedMail.subject || "(No Subject)"}
                </h2>
                <p className="text-sm text-zinc-400 mt-1 break-all">
                  From: {selectedMail.from}
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
              {getPlainText(selectedMail.content)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;