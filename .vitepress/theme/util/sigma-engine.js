/**
 * Shared pySigma engine for every <SigmaConverter> on the page.
 *
 * The Pyodide / WebAssembly runtime is a large (~10 MB+) one-time download and
 * spinning up one Web Worker + engine per converter would re-download and
 * re-install it for each instance. A page like `modifiers.md` can host dozens of
 * converters, so instead we lazily create a SINGLE worker-backed engine and
 * share it across all instances.
 *
 * Responsibilities kept here (shared, expensive, global):
 *   - the Web Worker + `SigmaConverter` engine instance
 *   - loading status (so every converter reflects the same loading/ready phase)
 *   - which backends have been installed (installed once, reused everywhere)
 *   - the prism-code-editor module + theme handling (also loaded once)
 *
 * Per-instance concerns (editors, files, output) stay in the component.
 */
import { ref, shallowRef } from "vue";

// ---- shared reactive state -------------------------------------------------

/** 'idle' | 'loading' | 'ready' | 'error' — the engine's global lifecycle. */
export const enginePhase = ref("idle");
/** Human-readable detail shown while loading. */
export const engineDetail = ref("");
/** Last fatal engine error, if any. */
export const engineError = ref("");
/** Installed target ids (shared — install a backend once, reuse everywhere). */
export const installedTargets = ref([]);
/** Available conversion targets (DEFAULT_TARGETS), populated on first load. */
export const engineTargets = shallowRef([]);

// ---- non-reactive singletons ----------------------------------------------

let worker = null;
let converter = null;
let bootPromise = null; // de-dupes concurrent engine boots
let prismApi = null; // { createEditor, renderCodeBlock, applyTheme }
let prismPromise = null;

// installBackend calls are serialised + de-duped per target.
const backendPromises = new Map();

/** True once the shared engine is initialised and idle. */
export function isEngineReady() {
  return enginePhase.value === "ready";
}

/**
 * Boot the shared engine (idempotent). Concurrent callers share one boot.
 * Returns the prism helper API once both the engine and editor are ready.
 */
export function bootEngine() {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    enginePhase.value = "loading";
    engineError.value = "";
    engineDetail.value = "Downloading Pyodide runtime (~10 MB)…";

    const [pkg, prism] = await Promise.all([
      import("@northsh/pysigma-node"),
      setupPrism(),
    ]);

    prismApi = prism;
    engineTargets.value = [...pkg.DEFAULT_TARGETS];

    worker = new Worker(
      new URL("@northsh/pysigma-node/worker", import.meta.url),
      {
        type: "module",
      },
    );
    converter = new pkg.SigmaConverter({ worker });
    converter.addStatusListener((s) => {
      if (s.error) {
        engineError.value = String(s.error);
        enginePhase.value = "error";
      } else if (s.pyodideReady && enginePhase.value === "loading") {
        engineDetail.value = "Installing pySigma backend…";
      }
    });

    return prismApi;
  })().catch((e) => {
    engineError.value = e instanceof Error ? e.message : String(e);
    enginePhase.value = "error";
    bootPromise = null; // allow a retry after a failed boot
    throw e;
  });
  return bootPromise;
}

/** Install a backend once; subsequent calls for the same target are no-ops. */
export async function installBackend(target) {
  if (!converter) await bootEngine();
  if (installedTargets.value.includes(target)) return;
  if (backendPromises.has(target)) return backendPromises.get(target);

  const p = (async () => {
    try {
      await converter.installBackend(target);
      if (!installedTargets.value.includes(target)) {
        installedTargets.value = [...installedTargets.value, target];
      }
      if (enginePhase.value === "loading") enginePhase.value = "ready";
    } catch (e) {
      // installBackend may be a no-op for some targets; surface only hard fails.
      if (enginePhase.value === "loading") enginePhase.value = "ready";
      throw e;
    } finally {
      backendPromises.delete(target);
    }
  })();
  backendPromises.set(target, p);
  return p;
}

/** Convert a rule with the shared engine. */
export async function convert(
  rule,
  target,
  pipelines,
  pipelineYmls,
  filterYml,
) {
  if (!converter) await bootEngine();
  return converter.convert(
    rule,
    target,
    pipelines ?? [],
    pipelineYmls ?? [],
    filterYml ?? "",
  );
}

/** Access the prism helper API (must be booted first). */
export function getPrism() {
  return prismApi;
}

/**
 * Token-colour overrides that realign prism-code-editor's GitHub themes with
 * the palette VitePress' static code blocks use.
 *
 * VitePress renders code with Shiki's *legacy* `github-light` / `github-dark`
 * themes (e.g. YAML keys are green `#22863A` / `#85E89D`, strings are
 * `#032F62` / `#9ECBFF`). prism-code-editor ships the *newer* Primer-based
 * GitHub themes instead (keys orange `#ffa657`, etc.), so the live editor's
 * YAML looked different from the surrounding static examples. These rules remap
 * the relevant prism token classes back onto the exact Shiki colours so the
 * editable rule + converted query match the static blocks token-for-token.
 */
const TOKEN_OVERRIDE_DARK = `
.prism-code-editor [class*=language-],
.prism-code-editor .token.punctuation,
.prism-code-editor .token.attr-equals,
.prism-code-editor .token.code.keyword{color:#e1e4e8}
.prism-code-editor .token.atrule,
.prism-code-editor .token.tag,
.prism-code-editor .token.selector,
.prism-code-editor .token.inserted,
.prism-code-editor .token.doctype-tag,
.prism-code-editor .token.builtin,
.prism-code-editor .token.class-name,
.prism-code-editor .token.maybe-class-name,
.prism-code-editor .token.attr-name{color:#85e89d}
.prism-code-editor .token.string,
.prism-code-editor .token.attr-value,
.prism-code-editor .token.char,
.prism-code-editor .token.regex,
.prism-code-editor .token.string-property,
.prism-code-editor .language-regex{color:#9ecbff}
.prism-code-editor .token.number,
.prism-code-editor .token.boolean,
.prism-code-editor .token.constant,
.prism-code-editor .token.color,
.prism-code-editor .token.property,
.prism-code-editor .token.property-access,
.prism-code-editor .token.keyword-null,
.prism-code-editor .token.parameter,
.prism-code-editor .token.variable{color:#79b8ff}
.prism-code-editor .token.keyword,
.prism-code-editor .token.operator,
.prism-code-editor .token.deleted,
.prism-code-editor .token.entity{color:#f97583}
.prism-code-editor .token.function{color:#b392f0}
.prism-code-editor .token.comment,
.prism-code-editor .token.prolog,
.prism-code-editor .token.cdata{color:#6a737d}
`;
const TOKEN_OVERRIDE_LIGHT = `
.prism-code-editor [class*=language-],
.prism-code-editor .token.punctuation,
.prism-code-editor .token.attr-equals,
.prism-code-editor .token.code.keyword{color:#24292e}
.prism-code-editor .token.atrule,
.prism-code-editor .token.tag,
.prism-code-editor .token.selector,
.prism-code-editor .token.inserted,
.prism-code-editor .token.doctype-tag,
.prism-code-editor .token.builtin,
.prism-code-editor .token.class-name,
.prism-code-editor .token.maybe-class-name,
.prism-code-editor .token.attr-name{color:#22863a}
.prism-code-editor .token.string,
.prism-code-editor .token.attr-value,
.prism-code-editor .token.char,
.prism-code-editor .token.regex,
.prism-code-editor .token.string-property,
.prism-code-editor .language-regex{color:#032f62}
.prism-code-editor .token.number,
.prism-code-editor .token.boolean,
.prism-code-editor .token.constant,
.prism-code-editor .token.color,
.prism-code-editor .token.property,
.prism-code-editor .token.property-access,
.prism-code-editor .token.keyword-null,
.prism-code-editor .token.parameter,
.prism-code-editor .token.variable{color:#005cc5}
.prism-code-editor .token.keyword,
.prism-code-editor .token.operator,
.prism-code-editor .token.deleted,
.prism-code-editor .token.entity{color:#d73a49}
.prism-code-editor .token.function{color:#6f42c1}
.prism-code-editor .token.comment,
.prism-code-editor .token.prolog,
.prism-code-editor .token.cdata{color:#6a737d}
`;

/**
 * Dynamically import prism-code-editor (+ themes/grammars) once. Matches
 * detection.studio: GitHub Dark/Light themes, `yaml` for the Sigma rule and
 * `splunk-spl` for the converted query.
 */
function setupPrism() {
  if (prismPromise) return prismPromise;
  prismPromise = (async () => {
    const [{ createEditor }, { renderCodeBlock }, , , , , darkCss, lightCss] =
      await Promise.all([
        import("prism-code-editor"),
        import("prism-code-editor/ssr"),
        import("prism-code-editor/prism/languages/yaml"),
        import("prism-code-editor/prism/languages/splunk-spl"),
        import("prism-code-editor/layout.css"),
        import("prism-code-editor/code-block.css"),
        import("prism-code-editor/themes/github-dark.css?inline"),
        import("prism-code-editor/themes/github-light.css?inline"),
      ]);

    let themeEl = document.getElementById("sigma-prism-theme");
    if (!themeEl) {
      themeEl = document.createElement("style");
      themeEl.id = "sigma-prism-theme";
      document.head.appendChild(themeEl);
    }
    const applyTheme = (dark) => {
      themeEl.textContent =
        (dark ? darkCss.default : lightCss.default) +
        (dark ? TOKEN_OVERRIDE_DARK : TOKEN_OVERRIDE_LIGHT);
    };

    return { createEditor, renderCodeBlock, applyTheme };
  })();
  return prismPromise;
}

/**
 * Tear the shared engine down (used when the live editor is turned off
 * globally). Resets all shared state so a later engage re-boots cleanly.
 */
export function disposeEngine() {
  converter?.dispose?.();
  worker?.terminate?.();
  converter = null;
  worker = null;
  bootPromise = null;
  backendPromises.clear();
  installedTargets.value = [];
  enginePhase.value = "idle";
  engineDetail.value = "";
  engineError.value = "";
}
