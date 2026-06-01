"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFViewer() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lesson as string;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonMeta, setLessonMeta] = useState({ specialty: "", branch: "" });
  const [completed, setCompleted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPdf = useCallback(async () => {
    try {
      const res = await fetch(`/api/lessons/presign?id=${lessonId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل تحميل الدرس");
      }
      const data = await res.json();
      setPdfUrl(data.url);
      setLessonTitle(data.title);
      setLessonMeta({ specialty: data.specialty || "", branch: data.branch || "" });
      setCompleted(data.completed || false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchPdf();
  }, [fetchPdf]);

  const saveProgress = useCallback(
    async (page: number, done?: boolean) => {
      try {
        await fetch("/api/lessons/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            lastPage: page,
            completedAt: done ? new Date().toISOString() : null,
          }),
        });
      } catch {
        /* silent */
      }
    },
    [lessonId]
  );

  function onPageChange(newPage: number) {
    setPageNumber(newPage);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const isLast = newPage === numPages;
      if (isLast) setCompleted(true);
      saveProgress(newPage, isLast);
    }, 2000);
  }

  function onDocumentLoadSuccess({ numPages: pages }: { numPages: number }) {
    setNumPages(pages);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPageChange(Math.max(1, pageNumber - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onPageChange(Math.min(numPages, pageNumber + 1));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNumber, numPages]);

  useEffect(() => {
    function handleFSChange() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-6 h-10 w-10 rounded-full border-2 border-[#d4a843] border-t-transparent animate-spin" />
            <p className="text-sm text-[#94a3b8] tracking-wider">CHARGEMENT DU DOCUMENT</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]">
        <div className="flex h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#334155]/40 bg-[#1e293b]/80 p-8 text-center shadow-xl backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-900/20 ring-1 ring-red-900/30">
              <svg className="h-6 w-6 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-[#ef4444]">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#334155] px-4 py-2 text-sm text-[#f1f5f9] transition-colors hover:bg-[#334155]/80"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = numPages > 0 ? (pageNumber / numPages) * 100 : 0;

  return (
    <div ref={containerRef} className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]">
      <style>{`
        @keyframes pdfFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mx-auto max-w-6xl px-4 py-4" dir="rtl">
        {/* Academic Toolbar */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          {/* Top bar */}
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] transition-all hover:bg-[#334155]/50 hover:text-[#d4a843]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#d4a843]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#d4a843] tracking-widest">
                    {lessonMeta.branch}
                  </span>
                  {completed && (
                    <span className="rounded bg-green-900/20 px-1.5 py-0.5 text-[9px] font-bold text-[#22c55e] tracking-widest">
                      VALIDÉ
                    </span>
                  )}
                </div>
                <h1 className="mt-0.5 text-sm font-bold text-[#f1f5f9]">{lessonTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9]"
                title={fullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {fullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  )}
                </svg>
              </button>

              {/* Fit to width */}
              <button
                onClick={() => setScale(0.85)}
                className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9]"
                title="Ajuster à la largeur"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12l2-2m-2 2l2 2m14-2l-2-2m2 2l-2 2" />
                </svg>
              </button>

              {/* Fit to page */}
              <button
                onClick={() => setScale(1)}
                className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9]"
                title="Ajuster à la page"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
                </svg>
              </button>

              {/* Zoom */}
              <div className="flex items-center gap-0.5 rounded-xl border border-[#334155]/40 bg-[#0f172a]/60 p-0.5">
                <button
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9]"
                >−</button>
                <span className="w-9 text-center text-[10px] font-medium text-[#64748b]">{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => setScale((s) => Math.min(2, s + 0.1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9]"
                >+</button>
              </div>

              {/* Page nav */}
              {numPages > 0 && (
                <div className="flex items-center gap-0.5 rounded-xl border border-[#334155]/40 bg-[#0f172a]/60 p-0.5">
                  <button
                    onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className="flex h-7 items-center rounded-lg px-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9] disabled:opacity-30"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="min-w-[70px] text-center text-[10px] font-medium text-[#94a3b8]">
                    {pageNumber} / {numPages}
                  </span>
                  <button
                    onClick={() => onPageChange(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    className="flex h-7 items-center rounded-lg px-1.5 text-xs text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-[#f1f5f9] disabled:opacity-30"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile title */}
          <div className="border-t border-[#334155]/40 px-4 py-2 sm:hidden">
            <h1 className="text-sm font-bold text-[#f1f5f9]">{lessonTitle}</h1>
          </div>

          {/* Accent line */}
          <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
        </div>

        {/* Progress bar */}
        {numPages > 0 && (
          <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-[#1e293b]">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#d4a843] to-[#2563eb] transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* PDF Document */}
        <div className="flex justify-center rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-3 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setError("فشل تحميل ملف PDF")}
            loading={
              <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-[#2563eb] border-t-transparent animate-spin" />
                  <p className="text-xs text-[#64748b] tracking-wider">CHARGEMENT</p>
                </div>
              </div>
            }
          >
            <div key={pageNumber} style={{ animation: "pdfFadeIn 0.25s ease-out" }}>
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          </Document>
        </div>

        {/* Thumbnail strip */}
        {numPages > 0 && (
          <div className="mt-4 overflow-x-auto" dir="ltr">
            <div className="flex gap-1.5 pb-1">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                    page === pageNumber
                      ? "bg-[#d4a843] text-[#0f172a] shadow-sm shadow-[#d4a843]/30"
                      : "bg-[#1e293b]/60 text-[#64748b] hover:bg-[#334155] hover:text-[#f1f5f9]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • DOCUMENT OFFICIEL
        </div>
      </div>
    </div>
  );
}
