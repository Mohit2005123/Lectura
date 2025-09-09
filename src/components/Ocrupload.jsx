"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { ocrPdfAction } from "@/app/api/ocr_tool/route"; // adjust import to where you put the action

export default function OCRPage() {
  const [state, formAction, pending] = useActionState(ocrPdfAction, {});
  const [progress, setProgress] = useState(0);

  return (
    <div className="mx-auto my-8 max-w-3xl rounded-2xl border-4 border-white bg-gradient-to-r from-purple-600 to-blue-500 p-6 shadow-2xl">
      <h2 className="mb-4 text-2xl font-bold text-white">Server OCR (PDF → Canvas → Text)</h2>

      <form action={formAction} className="space-y-4">
        <label className="block text-white/90">
          Upload a PDF
          <input
            name="file"
            type="file"
            accept="application/pdf"
            className="mt-2 w-full rounded-lg border-0 bg-white px-3 py-2 text-black shadow"
            onChange={(e) => {
              // optional: fake a progress bar (server actions don’t expose upload progress)
              if (e.target.files?.[0]) setProgress(0);
            }}
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className={`rounded bg-white px-4 py-2 font-semibold text-purple-700 shadow ${pending ? "opacity-60" : ""}`}
        >
          {pending ? "Processing…" : "Extract text"}
        </button>
      </form>

      {pending && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-white/90">
            <span>Processing…</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-2 w-1/2 animate-pulse rounded-full bg-white" />
          </div>
        </div>
      )}

      {state.error && (
        <p className="mt-4 rounded-lg bg-black/30 p-3 text-amber-200">{state.error}</p>
      )}

      {state.text && (
        <pre className="mt-4 max-h-[520px] min-h-[240px] w-full overflow-auto rounded-lg bg-black p-4 font-mono text-green-300">
{state.text}
        </pre>
      )}
    </div>
  );
}
