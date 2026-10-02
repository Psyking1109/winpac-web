export const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, " ");
export const tokens = s => norm(s).split(/\s+/).filter(Boolean);
export function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const tel = n => "tel:" + String(n || "").replace(/[^\d+]/g, "");
export const mailto = (email, subject, body) => `mailto:${email || ""}?subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`;

// Shrink a photo in the browser before upload, so pages stay fast.
// Logos keep transparency and have surrounding white space trimmed.
export function resizeImage(file, { max = 1200, logo = false } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      let cv = document.createElement("canvas");
      cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
      const ctx = cv.getContext("2d");
      if (!logo) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); }
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      if (logo) {
        try {
          const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
          for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
            const o = (y * cv.width + x) * 4;
            if (d[o + 3] > 16 && (d[o] < 242 || d[o + 1] < 242 || d[o + 2] < 242)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          }
          if (x1 > x0 && y1 > y0) { const p = 4, w = x1 - x0 + 1 + p * 2, h = y1 - y0 + 1 + p * 2, c2 = document.createElement("canvas"); c2.width = w; c2.height = h; c2.getContext("2d").drawImage(cv, x0 - p, y0 - p, w, h, 0, 0, w, h); cv = c2; }
        } catch (e) { /* keep untrimmed */ }
      }
      cv.toBlob(b => b ? resolve(b) : reject(new Error("Could not read that image")), logo ? "image/png" : "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file couldn't be read as an image. Try a JPG or PNG.")); };
    img.src = url;
  });
}

// "+94 11 2438429 / +94 11 2438283" -> ["+94 11 2438429", "+94 11 2438283"]
export const phoneList = s => String(s || "").split(/[\/,;|]+|\s{2,}/).map(x => x.trim()).filter(x => /\d{6,}/.test(x.replace(/\D/g, "")));
