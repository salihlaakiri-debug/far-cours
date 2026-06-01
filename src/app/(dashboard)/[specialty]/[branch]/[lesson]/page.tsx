"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <p className="text-gray-500">جاري تحميل المشاهد...</p>
    </div>
  ),
});

export default function LessonPageWrapper() {
  return <PDFViewer />;
}
