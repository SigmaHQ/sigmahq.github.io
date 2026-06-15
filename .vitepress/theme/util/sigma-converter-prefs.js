/**
 * Shared, persisted preferences for every <SigmaConverter> instance on the site.
 *
 * Two things are remembered across page loads AND kept in sync between every
 * instance mounted on the same page:
 *   - `engaged`: whether the live editor is turned on (large one-time download).
 *   - `target`:  the selected SIEM / backend id.
 *
 * Persistence uses localStorage with a 7-day expiry. Cross-instance sync uses
 * a tiny reactive store (module-level refs) plus the `storage` event so other
 * browser tabs stay in sync too.
 */
import { ref, watch } from "vue";

const STORAGE_KEY = "sigma-converter-prefs";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const DEFAULTS = { engaged: false, target: "splunk" };

function readStored() {
  if (typeof localStorage === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULTS };
    // Honour expiry.
    if (typeof parsed.expires === "number" && Date.now() > parsed.expires) {
      localStorage.removeItem(STORAGE_KEY);
      return { ...DEFAULTS };
    }
    return {
      engaged: !!parsed.engaged,
      target:
        typeof parsed.target === "string" ? parsed.target : DEFAULTS.target,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

// Module-level singletons → shared by all component instances.
const initial = readStored();
const engaged = ref(initial.engaged);
const target = ref(initial.target);

let writing = false;

function persist() {
  if (typeof localStorage === "undefined") return;
  writing = true;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        engaged: engaged.value,
        target: target.value,
        expires: Date.now() + TTL_MS,
      }),
    );
  } catch {
    /* storage full / unavailable */
  } finally {
    writing = false;
  }
}

watch([engaged, target], persist);

// Keep other tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || writing) return;
    const next = readStored();
    engaged.value = next.engaged;
    target.value = next.target;
  });
}

export function useSigmaConverterPrefs() {
  return { engaged, target };
}
