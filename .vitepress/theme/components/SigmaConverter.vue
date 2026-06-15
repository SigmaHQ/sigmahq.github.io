<template>
  <div class="sigma-converter not-prose my-8">
    <!-- ===================================================================
         STATIC STATE
         The default slot holds the Shiki-rendered code blocks authored in
         markdown. They stay 100% static (no JS, no download) until the user
         explicitly engages the interactive editor.
         =================================================================== -->
    <div v-show="!engaged" ref="staticRef" class="sigma-converter-static">
      <slot />

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <div class="group relative inline-flex">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="phase === 'loading'"
            @click="engage"
          >
            <BoltIcon class="h-4 w-4" />
            {{ phase === "loading" ? "Loading engine…" : "Engage live editor" }}
          </button>

          <!-- Tooltip warning about the large one-time download -->
          <span
            role="tooltip"
            class="pointer-events-none absolute -top-2 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700"
          >
            Heads up: this downloads the pySigma engine (Pyodide / WebAssembly),
            a large <strong>~10&nbsp;MB+</strong> one-time download. It runs
            entirely in your browser and is only fetched when you click.
            <span
              class="absolute top-full left-1/2 -ml-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900 dark:bg-slate-700"
            ></span>
          </span>
        </div>
      </div>
    </div>

    <!-- ===================================================================
         INTERACTIVE STATE
         A "joined" code-block: editable Sigma rule on top, converted query
         directly below — mimicking the existing top/bottom code-block style.
         =================================================================== -->
    <div v-if="engaged" class="my-4">
      <!-- Toolbar -->
      <div
        class="relative z-[5] flex flex-wrap items-center justify-end gap-2 rounded-lg border border-[var(--vp-c-border)]/60 bg-[color-mix(in_srgb,var(--vp-code-block-bg)_92%,#fff)] px-3 py-2 dark:bg-[var(--vp-code-block-bg)] mb-2"
      >
        <div class="flex items-center gap-2 text-xs" :class="statusColor">
          <!-- Only surface status text when it matters (loading / error). -->
          <span v-if="showStatusText" class="font-medium">{{
            statusText
          }}</span>
          <span
              class="inline-block h-2 w-2 shrink-0 rounded-full"
              :class="{
              'animate-pulse bg-amber-500': phase === 'loading',
              'bg-emerald-500': phase === 'ready',
              'animate-pulse bg-sky-500': phase === 'converting',
              'bg-rose-500': phase === 'error',
            }"
          ></span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Custom SIEM dropdown -->
          <div ref="dropdownRef" class="relative">
            <button
              type="button"
              class="flex h-8 min-w-[170px] items-center gap-2 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] px-2.5 text-[13px] font-medium text-[var(--vp-c-text-1)] transition-colors hover:border-[var(--vp-c-brand-1)]"
              :aria-expanded="menuOpen"
              aria-haspopup="listbox"
              @click="menuOpen = !menuOpen"
            >
              <span
                v-if="selectedMeta?.svg"
                class="sigma-icon inline-flex shrink-0 items-center justify-center text-[var(--vp-c-text-2)]"
                :style="
                  selectedMeta.color ? { color: selectedMeta.color } : undefined
                "
                v-html="selectedMeta.svg"
              ></span>
              <span
                class="flex-auto overflow-hidden text-left text-ellipsis whitespace-nowrap"
                >{{ selectedTitle }}</span
              >
              <ChevronUpDownIcon
                class="h-4 w-4 shrink-0 text-[var(--vp-c-text-3)]"
              />
            </button>

            <Transition name="sigma-select-fade">
              <ul
                v-if="menuOpen"
                class="sigma-menu absolute top-[calc(100%+6px)] right-0 z-20 m-0 max-h-80 min-w-[220px] list-none overflow-y-auto rounded-[10px] border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] shadow-[var(--vp-shadow-3)]"
                role="listbox"
              >
                <li
                  v-for="t in targets"
                  :key="t.id"
                  role="option"
                  :aria-selected="t.id === target"
                  class="sigma-option flex cursor-pointer list-none items-center gap-2 rounded-md px-[0.55rem] py-1.5 text-[13px] text-[var(--vp-c-text-1)] transition-colors hover:bg-[var(--vp-c-bg-soft)]"
                  :class="{ 'bg-[var(--vp-c-brand-soft)]': t.id === target }"
                  @click="selectTarget(t.id)"
                >
                  <span
                    v-if="metaFor(t.id)?.svg"
                    class="sigma-icon inline-flex shrink-0 items-center justify-center text-[var(--vp-c-text-2)]"
                    :style="
                      metaFor(t.id)?.color
                        ? { color: metaFor(t.id).color }
                        : undefined
                    "
                    v-html="metaFor(t.id).svg"
                  ></span>
                  <span v-else class="h-4 w-4 shrink-0"></span>
                  <span class="flex-auto">{{ t.title }}</span>
                  <CheckIcon
                    v-if="t.id === target"
                    class="h-4 w-4 shrink-0 text-[var(--vp-c-brand-1)]"
                  />
                </li>
              </ul>
            </Transition>
          </div>

          <!-- Turn the live editor back off (persisted globally) -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--vp-c-text-2)] transition-colors hover:border-[var(--vp-c-brand-1)] hover:text-[var(--vp-c-text-1)]"
            title="Turn off the live editor (reverts to static examples everywhere)"
            @click="disengage"
          >
            <XMarkIcon class="h-3.5 w-3.5" />
            <span>Turn off</span>
          </button>
        </div>
      </div>

      <!-- Input (top half of the joined block) -->
      <div
        class="sigma-block sigma-block--input group/input relative bg-[var(--vp-code-block-bg)] rounded-t-lg"
      >
        <div class="sigma-lang">sigma rule (yaml)</div>
        <div ref="inputRef"></div>
      </div>

      <!-- Output (bottom half of the joined block) -->
      <div
        class="sigma-block sigma-block--output group/output relative rounded-b-lg bg-[color-mix(in_srgb,var(--vp-code-block-bg)_96%,#000)] dark:bg-[var(--vp-c-bg-soft)]"
      >
        <div class="sigma-lang transition-opacity group-hover/output:opacity-0">
          {{ outputLangLabel }}
        </div>
        <button
          v-if="output && !error"
          type="button"
          class="sigma-copy copy opacity-0 group-hover/output:opacity-100 focus:opacity-100"
          :class="{ copied }"
          title="Copy query"
          @click="copyOutput"
        ></button>
        <pre
          v-if="error"
          class="sigma-pre m-0 overflow-x-auto px-6 py-5 break-words whitespace-pre-wrap text-[#e45649] dark:text-[#fb7185]"
          >{{ error }}</pre
        >
        <div v-else-if="output" ref="outputRef" class="sigma-output-code"></div>
        <pre
          v-else
          class="sigma-pre m-0 overflow-x-auto px-6 py-5 break-words whitespace-pre-wrap text-[var(--vp-c-text-3)]"
          >{{
            phase === "converting"
              ? "Converting…"
              : "Edit the rule above to generate the query."
          }}</pre
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  watch,
  nextTick,
} from "vue";
import { useData } from "vitepress";
import {
  BoltIcon,
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
import { useSigmaConverterPrefs } from "../util/sigma-converter-prefs.js";
import { siemMeta } from "../util/siem-icons.js";

const { isDark } = useData();

// Shared, persisted prefs (engaged + target) across every instance + tabs.
const { engaged: prefEngaged, target } = useSigmaConverterPrefs();

const SAMPLE_RULE = `title: Whoami Execution
status: test
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\\\whoami.exe'
  condition: selection
level: high`;

const phase = ref("static"); // static | loading | ready | converting | error
const engaged = ref(false); // local mount state (mirrors prefs once initialised)
const rule = ref(SAMPLE_RULE);
const output = ref("");
const error = ref("");
const copied = ref(false);
const targets = ref([]);
const loadDetail = ref("");
const menuOpen = ref(false);

const staticRef = ref(null);
const inputRef = ref(null);
const outputRef = ref(null);
const dropdownRef = ref(null);

// Non-reactive holders for the engine + editor instances.
const converter = shallowRef(null);
const worker = shallowRef(null);
const editor = shallowRef(null);
let prismApi = null; // { createEditor, renderCodeBlock, applyTheme }

const statusText = computed(() => {
  switch (phase.value) {
    case "loading":
      return loadDetail.value || "Loading pySigma engine (Pyodide)…";
    case "converting":
      return "Converting…";
    case "error":
      return "Something went wrong — see the output below.";
    case "ready":
    default:
      return "Engine ready — runs entirely in your browser.";
  }
});

const statusColor = computed(() => ({
  "text-amber-600 dark:text-amber-400": phase.value === "loading",
  "text-emerald-600 dark:text-emerald-400": phase.value === "ready",
  "text-sky-600 dark:text-sky-400": phase.value === "converting",
  "text-rose-600 dark:text-rose-400": phase.value === "error",
}));

// Only show the textual status while loading or on error; otherwise the
// coloured dot alone communicates state.
const showStatusText = computed(
  () => phase.value === "loading" || phase.value === "error",
);

const selectedTitle = computed(() => {
  const t = targets.value.find((x) => x.id === target.value);
  return t ? t.title : target.value;
});
const selectedMeta = computed(() => siemMeta(target.value));
const metaFor = (id) => siemMeta(id);

const outputLangLabel = computed(() => {
  const t = targets.value.find((x) => x.id === target.value);
  return t ? `${t.title} query` : "query";
});

/**
 * Read the seed Sigma rule from the static Shiki code block in the slot, so
 * the live editor starts from exactly what the reader was just looking at.
 */
function seedFromSlot() {
  const el = staticRef.value;
  if (!el) return;
  const codeEl =
    el.querySelector('div[class*="language-yaml"] code') ||
    el.querySelector('div[class*="language-"] code') ||
    el.querySelector("pre code");
  if (codeEl) {
    const text = codeEl.textContent?.replace(/\n$/, "");
    if (text && text.trim()) rule.value = text;
  }
}

async function engage() {
  if (engaged.value || phase.value === "loading") return;
  seedFromSlot();
  phase.value = "loading";
  error.value = "";
  prefEngaged.value = true; // remember globally

  try {
    const [pkg, prism] = await Promise.all([
      import("@northsh/pysigma-node"),
      setupPrism(),
    ]);

    prismApi = prism;
    targets.value = [...pkg.DEFAULT_TARGETS];

    engaged.value = true;
    await nextTick();
    mountInputEditor();

    worker.value = new Worker(
      new URL("@northsh/pysigma-node/worker", import.meta.url),
      { type: "module" },
    );
    converter.value = new pkg.SigmaConverter({ worker: worker.value });
    converter.value.addStatusListener((s) => {
      if (s.error) {
        error.value = String(s.error);
        phase.value = "error";
      } else if (s.pyodideReady && phase.value === "loading") {
        loadDetail.value = "Installing pySigma backend…";
      }
    });

    loadDetail.value = "Downloading Pyodide runtime (~10 MB)…";
    await converter.value.installBackend(target.value);
    phase.value = "ready";
    convert();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    phase.value = "error";
    engaged.value = true;
  }
}

/** Turn the live editor off — globally + persisted. */
function disengage() {
  prefEngaged.value = false;
  menuOpen.value = false;
  editor.value?.remove?.();
  editor.value = null;
  converter.value?.dispose?.();
  converter.value = null;
  worker.value?.terminate?.();
  worker.value = null;
  output.value = "";
  error.value = "";
  phase.value = "static";
  engaged.value = false;
}

/**
 * Dynamically import prism-code-editor (+ themes/grammars) and return a small
 * helper API. Matches detection.studio: GitHub Dark/Light themes, `yaml` for
 * the Sigma rule and `splunk-spl` for the converted query.
 */
async function setupPrism() {
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
  const applyTheme = () => {
    themeEl.textContent = isDark.value ? darkCss.default : lightCss.default;
  };
  applyTheme();

  return { createEditor, renderCodeBlock, applyTheme };
}

function mountInputEditor() {
  if (!inputRef.value || !prismApi) return;
  editor.value = prismApi.createEditor(inputRef.value, {
    value: rule.value,
    language: "yaml",
    tabSize: 2,
    insertSpaces: true,
    lineNumbers: false,
    wordWrap: true,
  });
  editor.value.on("update", (value) => {
    rule.value = value;
    if (converter.value && rule.value.trim()) convert();
  });
}

let convertSeq = 0;

async function convert() {
  if (!converter.value || !rule.value.trim()) return;
  const seq = ++convertSeq;
  phase.value = "converting";
  copied.value = false;

  try {
    const result = await converter.value.convert(rule.value, target.value);
    if (seq !== convertSeq) return;
    if (result.error) {
      error.value = result.error;
      phase.value = "error";
    } else {
      error.value = "";
      output.value = result.query;
      phase.value = "ready";
      await nextTick();
      renderOutput();
    }
  } catch (e) {
    if (seq !== convertSeq) return;
    error.value = e instanceof Error ? e.message : String(e);
    phase.value = "error";
  }
}

/** Read-only syntax highlighting for the converted query. */
function renderOutput() {
  if (!outputRef.value || !prismApi?.renderCodeBlock || !output.value) return;
  try {
    outputRef.value.innerHTML = prismApi.renderCodeBlock({
      language: "splunk-spl",
      value: output.value,
      wordWrap: true,
    });
  } catch {
    outputRef.value.textContent = output.value;
  }
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    /* clipboard unavailable */
  }
}

function selectTarget(id) {
  target.value = id;
  menuOpen.value = false;
}

function onDocClick(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    menuOpen.value = false;
  }
}

// Re-convert + install backend when the target changes (also fired when another
// instance / tab changes the shared pref).
watch(target, async (next, prev) => {
  if (!converter.value || next === prev) return;
  try {
    await converter.value.installBackend(next);
  } catch {
    /* installBackend may be a no-op for some targets */
  }
  convert();
});

// React to the shared "engaged" pref: auto-engage if another instance turned it
// on, and tear down if another instance turned it off.
watch(prefEngaged, (on) => {
  if (on && !engaged.value && phase.value !== "loading") engage();
  else if (!on && engaged.value) disengage();
});

// Swap prism theme on dark/light toggle.
watch(isDark, () => prismApi?.applyTheme?.());

onMounted(() => {
  document.addEventListener("click", onDocClick);
  // Honour the persisted "engaged" preference on load.
  if (prefEngaged.value) engage();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  editor.value?.remove?.();
  converter.value?.dispose?.();
  worker.value?.terminate?.();
});
</script>

<style scoped>
/* ---------------------------------------------------------------------------
   Only the rules below remain in plain CSS because they target DOM that
   Tailwind utilities cannot reach: third-party prism-code-editor internals
   (via :deep), v-html-injected brand SVGs, pseudo-elements (::before / ::marker
   for the copy "Copied" pill and list markers) and Vue <Transition> classes.
   Everything else now lives as Tailwind utilities in the template.
   ------------------------------------------------------------------------- */

/* Brand SVGs injected via v-html — size + inherit the inline tint colour. */
.sigma-icon,
.sigma-icon :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* VitePress' prose (.vp-doc) styles target plain <ul>/<li>, adding a "•"
   ::before, a ::marker and a left indent (margin-inline-start) that Tailwind
   utilities lose to on specificity. Neutralise all of them so the options align
   flush to the menu's padding edge (no phantom bullet gap). */
.sigma-menu {
  margin: 0;
  padding: 0.3rem;
}
.sigma-option {
  margin: 0;
}
.sigma-option::marker {
  content: "";
}
.sigma-option::before {
  content: none !important;
}

/* SIEM dropdown open/close transition (<Transition name="sigma-select-fade">). */
.sigma-select-fade-enter-active,
.sigma-select-fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.sigma-select-fade-enter-from,
.sigma-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Absolute "lang" label shared by input + output blocks. */
.sigma-lang {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: var(--vp-c-text-3);
  pointer-events: none;
  user-select: none;
}

/* VitePress-identical copy button: 40x40 hover icon button that swaps to a
   check + "Copied" pill once copied. The pseudo-element + CSS-var background
   icons can't be expressed as utilities. */
.sigma-copy {
  direction: ltr;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background-color: var(--vp-code-copy-code-bg);
  cursor: pointer;
  background-image: var(--vp-icon-copy);
  background-position: 50%;
  background-size: 20px;
  background-repeat: no-repeat;
  transition:
    border-color 0.25s,
    background-color 0.25s,
    opacity 0.25s;
}
.sigma-copy:hover,
.sigma-copy.copied {
  border-color: var(--vp-code-copy-code-hover-border-color);
  background-color: var(--vp-code-copy-code-hover-bg);
}
.sigma-copy.copied {
  border-radius: 0 4px 4px 0;
  background-color: var(--vp-code-copy-code-hover-bg);
  background-image: var(--vp-icon-copied);
}
.sigma-copy.copied::before {
  position: relative;
  top: -1px;
  transform: translateX(calc(-100% - 1px));
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--vp-code-copy-code-hover-border-color);
  border-right: 0;
  border-radius: 4px 0 0 4px;
  padding: 0 10px;
  width: fit-content;
  height: 40px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-code-copy-code-active-text);
  background-color: var(--vp-code-copy-code-hover-bg);
  white-space: nowrap;
  content: var(--vp-code-copy-copied-text-content);
}

/* The plain-text <pre> (error / placeholder) shares the code-block metrics. */
.sigma-pre {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.7;
}

/* Match VitePress code blocks exactly: 14px / 1.7 line-height, mono font,
   24px horizontal padding (via prism's --padding-inline so the highlight layer
   AND the textarea stay aligned), transparent bg over the block. These reach
   into prism-code-editor's generated DOM, so they must stay as :deep() CSS.
   renderCodeBlock's code-block.css applies `font-size: .875em` to the root, so
   we also pin 14px on the rendered lines themselves. */
.sigma-block--input :deep(.prism-code-editor),
.sigma-output-code :deep(.prism-code-editor) {
  --pce-bg: transparent;
  --padding-inline: 24px;
  background: transparent;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.7;
}
.sigma-block--input :deep(.prism-code-editor .pce-wrapper),
.sigma-output-code :deep(.prism-code-editor .pce-wrapper),
.sigma-output-code :deep(.prism-code-editor .pce-line) {
  font-size: 14px;
  line-height: 1.7;
}
.sigma-block--input :deep(.prism-code-editor .pce-wrapper),
.sigma-output-code :deep(.prism-code-editor .pce-wrapper) {
  margin: 20px 0;
  padding: 0 0;
}
</style>
