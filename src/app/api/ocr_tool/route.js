"use server";

import fs from "fs";
import path from "path";
import sharp from "sharp";
import Tesseract from "tesseract.js";

// pdf.js (Node) + worker so fake-worker resolves
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.js";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { createCanvas } from "canvas";
import { createRequire } from "module";
const requireCjs = createRequire(import.meta.url);

class NodeCanvasFactory {
  create(w, h) {
    const canvas = createCanvas(w, h);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }
  reset(cc, w, h) { cc.canvas.width = w; cc.canvas.height = h; }
  destroy(cc) { cc.canvas.width = 0; cc.canvas.height = 0; }
}

// Robust resolver with env override → require.resolve → fallbacks
function resolveAsset(envKey, spec) {
  const env = process.env[envKey];
  if (env && fs.existsSync(env)) return env;
  try {
    const r = requireCjs.resolve(spec);
    if (fs.existsSync(r)) return r;
  } catch {}
  const guess = path.join(process.cwd(), "node_modules", spec.replace(/\//g, path.sep));
  if (fs.existsSync(guess)) return guess;
  const guess2 = path.join(process.cwd(), "..", "node_modules", spec.replace(/\//g, path.sep));
  if (fs.existsSync(guess2)) return guess2;
  throw new Error(`Cannot resolve ${envKey}. Set ${envKey} to an absolute path for ${spec}`);
}

export async function ocrPdfAction(_prev, formData) {
  try {
    const file = formData.get("file");
    if (!file) return { error: 'No file provided (field "file").' };
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) return { error: "Please upload a PDF file." };

    // pdf.js wants Uint8Array (not Buffer)
    const uint8 = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data: uint8, disableWorker: true }).promise;

    // IMPORTANT: use the **Node** worker script, not the browser one
    // Works well with Next server bundling:
    //   - Node worker entry:
    //       tesseract.js/src/worker-script/node/index.js
    //   - Core WASM shim:
    //       tesseract.js-core/tesseract-core.wasm.js
    const workerPathNode = resolveAsset(
      "TESSERACT_WORKER_PATH",
      "tesseract.js/src/worker-script/node/index.js"
    );
    const corePath = resolveAsset(
      "TESSERACT_CORE_PATH",
      "tesseract.js-core/tesseract-core.wasm.js"
    );

    const canvasFactory = new NodeCanvasFactory();
    const dpiScale = 2.0;

    let combined = "";

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: dpiScale });

      const { canvas, context } = canvasFactory.create(
        Math.floor(viewport.width),
        Math.floor(viewport.height)
      );

      await page.render({ canvasContext: context, viewport, canvasFactory }).promise;

      const pngBuf = canvas.toBuffer("image/png");

      const preBuf = await sharp(pngBuf)
        .grayscale()
        .normalize()
        .sharpen(1.2, 1, 0.8)
        .threshold(180)
        .png()
        .toBuffer();

      const baseParams = {
        workerPath: workerPathNode,   // <-- Node worker
        corePath,
        workerBlobURL: false,         // <-- required in Node/SSR
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: "1",
      };

      let { data } = await Tesseract.recognize(preBuf, "eng", baseParams);
      let pageText = (data?.text || "").trim();

      if (!pageText || pageText.length < 3) {
        const alt = { ...baseParams, tessedit_pageseg_mode: 7 };
        ({ data } = await Tesseract.recognize(preBuf, "eng", alt));
        pageText = (data?.text || "").trim();
      }

      combined += `\n\n----- Page ${p} -----\n${pageText}`;

      canvasFactory.destroy({ canvas, context });
    }

    return { text: combined.trim() || "No text found." };
  } catch (e) {
    console.error("Server OCR error:", e);
    return { error: e?.message || "Server error" };
  }
}
