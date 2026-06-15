<template>
  <div class="sigma-converter not-prose my-8">
    <!-- ===================================================================
         STATIC STATE
         The default slot holds the Shiki-rendered code blocks authored in
         markdown. They stay 100% static (no JS, no download) until the user
         explicitly engages the interactive editor.
         =================================================================== -->
    <div v-show="!engaged" ref="staticRef" class="sigma-converter-static">
      <!-- The bolt "Live Edit" trigger is injected at runtime into each static
           code block, right beside VitePress' copy button (see decorateStatic).
           This keeps the bolt + copy button in the same DOM section so the bolt
           positions relative to the copy button and works for both plain blocks
           and ::: code-group tabs (which have no top-right copy button). -->
      <slot />
    </div>

    <!-- ===================================================================
         INTERACTIVE STATE
         A "joined" code-block: editable Sigma rule on top, converted query
         directly below — mimicking the existing top/bottom code-block style.
         =================================================================== -->
    <div v-if="engaged" class="sigma-live my-4">
      <!-- Toolbar -->
      <div
        class="sigma-toolbar relative z-[5] mb-2 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-[var(--vp-c-border)]/30 bg-[color-mix(in_srgb,var(--vp-code-block-bg)_92%,#fff)] px-3 py-2 dark:bg-[var(--vp-code-block-bg)]"
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

      <!-- Input (top half of the joined block).
           When more than one file is present (rule + pipeline[s]) we render a
           VitePress-style code-group tab bar; with a lone rule it stays a plain
           single editor (no tab chrome). -->
      <div
        class="sigma-block sigma-block--input group/input relative rounded-t-lg bg-[var(--vp-code-block-bg)]"
      >
        <!-- Tab bar (only when 2+ files) -->
        <div
          v-if="files.length > 1"
          class="sigma-tabs flex overflow-x-auto bg-[var(--vp-code-tab-bg)] px-3 shadow-[inset_0_-1px_var(--vp-code-tab-divider)]"
          role="tablist"
        >
          <button
            v-for="(f, i) in files"
            :key="f.id"
            type="button"
            role="tab"
            :aria-selected="i === activeFile"
            class="sigma-tab relative inline-flex shrink-0 items-center gap-1.5 px-3 text-[14px] font-medium whitespace-nowrap transition-colors"
            :class="
              i === activeFile
                ? 'text-[var(--vp-code-tab-active-text-color)]'
                : 'text-[var(--vp-code-tab-text-color)] hover:text-[var(--vp-code-tab-hover-text-color)]'
            "
            @click="activeFile = i"
          >
            {{ f.title }}
          </button>
        </div>

        <!-- One editor per file; only the active one is shown. The lang label
             is hidden when tabs are present (the tab already names the file). -->
        <div class="relative">
          <div v-if="files.length <= 1" class="sigma-lang">
            sigma rule (yaml)
          </div>
          <div
            v-for="(f, i) in files"
            :key="f.id"
            v-show="i === activeFile"
            :ref="(el) => setEditorHost(i, el)"
          ></div>
        </div>
      </div>

      <!-- Output (bottom half of the joined block) -->
      <div
        class="sigma-block sigma-block--output group/output relative rounded-b-lg border-t-2 border-black/5 bg-[var(--vp-c-gray-1)]/20 dark:border-none dark:bg-[var(--vp-c-gray-soft)]/40"
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
  watch,
  nextTick,
} from "vue";
import { useData } from "vitepress";
import {
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
import { useSigmaConverterPrefs } from "../util/sigma-converter-prefs.js";
import { siemMeta } from "../util/siem-icons.js";
import { titleCase } from "../util/string.js";
import {
  enginePhase,
  engineDetail,
  engineError,
  engineTargets,
  bootEngine,
  installBackend as installSharedBackend,
  convert as sharedConvert,
  getPrism,
  disposeEngine,
} from "../util/sigma-engine.js";

const props = defineProps({
  /**
   * Optional allow-list of SIEM/backend ids this example may convert to (e.g.
   * `["loki"]` for a Loki-only pipeline demo, or `["esql"]` for an ES|QL one).
   * When set, the dropdown is restricted to these targets (in the given order)
   * and the selection is kept LOCAL to this instance so it doesn't override the
   * global target chosen on unrestricted converters. When a single id is given
   * the dropdown is effectively pinned to that backend.
   * Omit the prop to allow every supported backend (shared global selection).
   */
  siems: {
    type: Array,
    default: null,
  },
});

const { isDark } = useData();

// Shared, persisted prefs (engaged + target) across every instance + tabs.
const { engaged: prefEngaged, target: globalTarget } = useSigmaConverterPrefs();

// Normalised allow-list (lower-cased ids) or null when unrestricted.
const allowList = computed(() =>
  Array.isArray(props.siems) && props.siems.length
    ? props.siems.map((s) => String(s).toLowerCase())
    : null,
);
const isRestricted = computed(() => !!allowList.value);

// Per-instance local target override, only used when this converter is
// restricted via `siems` (so its choice never leaks into the global pref).
const localTarget = ref(null);

/**
 * This instance's effective target.
 *  - Unrestricted: the shared global pref (synced across converters + tabs).
 *  - Restricted:   a local choice constrained to the allow-list; defaults to the
 *    global pref when that already satisfies the list, else the first allowed id.
 */
const target = computed({
  get() {
    if (!isRestricted.value) return globalTarget.value;
    const list = allowList.value;
    if (localTarget.value && list.includes(localTarget.value))
      return localTarget.value;
    if (list.includes(globalTarget.value)) return globalTarget.value;
    return list[0];
  },
  set(id) {
    if (isRestricted.value) localTarget.value = id;
    else globalTarget.value = id;
  },
});

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

const engaged = ref(false); // local mount state (mirrors prefs once initialised)
const converting = ref(false); // this instance is mid-conversion

/**
 * This instance's effective phase, blending the SHARED engine lifecycle
 * (loading / ready / error — one Pyodide install for the whole page) with this
 * instance's local state (static before engaging, converting while running).
 */
const phase = computed(() => {
  if (!engaged.value) return "static";
  if (engineError.value || localError.value) return "error";
  if (enginePhase.value === "loading" || enginePhase.value === "idle")
    return "loading";
  if (converting.value) return "converting";
  return "ready";
});

/**
 * The editable input files. Each entry:
 *   { id, title, lang, role: 'rule' | 'pipeline', value }
 * Pipeline files are listed first (we usually want to show the pipeline before
 * the rule when demoing pipelines). There is always exactly one 'rule' file.
 */
const files = ref([
  {
    id: "rule",
    title: "rule.yml",
    lang: "yaml",
    role: "rule",
    value: SAMPLE_RULE,
  },
]);
const activeFile = ref(0);

const output = ref("");
const localError = ref(""); // this instance's conversion error
const copied = ref(false);
const menuOpen = ref(false);

// Combined error: a fatal engine error, or this instance's conversion error.
const error = computed(() => engineError.value || localError.value);

/**
 * Targets offered in this instance's dropdown. Sourced from the shared engine
 * once booted, then narrowed to the `siems` allow-list (preserving its order).
 * Before the engine boots — or for an id the engine doesn't report — we fall
 * back to a title derived from the SIEM icon metadata so restricted labels still
 * render. Unrestricted instances simply expose every engine target.
 */
const targets = computed(() => {
  const all = engineTargets.value || [];
  const list = allowList.value;
  if (!list) return all;
  const byId = new Map(all.map((t) => [t.id, t]));
  return list.map((id) => byId.get(id) || { id, title: titleCase(id) });
});
const loadDetail = engineDetail;

const staticRef = ref(null);
const outputRef = ref(null);
const dropdownRef = ref(null);

// One prism editor instance per file, keyed by file index. Hosts are the DOM
// nodes the editors mount into, captured via the :ref callback in the template.
const editorHosts = [];
const editors = [];

function setEditorHost(i, el) {
  editorHosts[i] = el || null;
}

const ruleFile = computed(() => files.value.find((f) => f.role === "rule"));
const pipelineYmls = computed(() =>
  files.value.filter((f) => f.role === "pipeline").map((f) => f.value),
);
// The engine accepts a single filter YAML; use the first filter file present.
const filterYml = computed(
  () => files.value.find((f) => f.role === "filter")?.value || "",
);

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

/** Does this title/filename look like a pipeline file rather than a rule? */
function looksLikePipeline(title) {
  return /pipeline|^pipelines\//i.test(title || "");
}

/**
 * Does this block look like a Sigma *filter* (meta) file rather than a rule?
 *
 * A Sigma filter has a TOP-LEVEL (column-0) `filter:` key and carries neither a
 * `detection:` nor a `correlation:` section. We must be strict here: ordinary
 * detection rules frequently contain an indented `filter:` *selection* (e.g.
 * `condition: selection and not filter`), and correlation rules contain a
 * `rules:` list — neither of which makes the block a filter file.
 */
function looksLikeFilter(title, value) {
  const v = value || "";
  const hasTopLevelFilter = /^filter:\s*$/m.test(v);
  const hasDetection = /^detection:/m.test(v);
  const hasCorrelation = /^correlation:/m.test(v);
  if (hasDetection || hasCorrelation) return false;
  if (hasTopLevelFilter) return true;
  // Fall back to the filename only when the content didn't disqualify it.
  return /^\.?\/?filters?\//i.test(title || "");
}

/**
 * Read the seed input file(s) from the static Shiki code blocks in the slot, so
 * the live editor starts from exactly what the reader was just looking at.
 *
 * Two authoring shapes are supported:
 *   1. A lone ```yaml rule block (plus an output block) → one rule file, no tabs.
 *   2. A VitePress `::: code-group` with titled blocks, e.g.
 *        ```yaml [pipelines/x.yml]  and  ```yaml [rules/y.yml]
 *      VitePress renders these with `<label data-title="…">` tabs; we read those
 *      titles to classify each block as a pipeline or the rule. Pipeline files
 *      are ordered first (we usually demo the pipeline before the rule).
 *
 * The converted-query block (splunk/sql/logql/…) is ignored for seeding.
 */
function seedFromSlot() {
  const el = staticRef.value;
  if (!el) return;

  const collected = [];

  // Prefer a code-group: read its tab titles, then pair each with its block.
  const group = el.querySelector(".vp-code-group");
  if (group) {
    const labels = [...group.querySelectorAll(".tabs label")].map(
      (l) => l.dataset.title || l.textContent.trim(),
    );
    const blocks = [
      ...group.querySelectorAll(".blocks > div[class*='language-']"),
    ];
    blocks.forEach((block, i) => {
      const lang = langOf(block);
      if (!isInputLang(lang)) return; // skip output blocks inside the group
      const code = codeText(block);
      if (!code) return;
      collected.push({
        title: labels[i] || `file ${i + 1}.yml`,
        lang,
        value: code,
      });
    });
  }

  // Fall back to top-level language blocks (the simple single-rule shape).
  if (!collected.length) {
    const blocks = [...el.querySelectorAll(":scope > div[class*='language-']")];
    for (const block of blocks) {
      const lang = langOf(block);
      if (!isInputLang(lang)) continue;
      const code = codeText(block);
      if (code) collected.push({ title: "rule.yml", lang, value: code });
    }
  }

  if (!collected.length) return;

  // Classify + order: pipeline + filter files first, the rule last. Exactly one
  // rule — the last block that is neither a pipeline nor a filter (authors put
  // the rule after its pipeline/filter).
  const ordered = [];
  let ruleEntry = null;
  for (const c of collected) {
    if (looksLikePipeline(c.title)) {
      ordered.push({
        id: `pipe-${ordered.length}`,
        title: c.title,
        lang: c.lang,
        role: "pipeline",
        value: c.value,
      });
    } else if (looksLikeFilter(c.title, c.value)) {
      ordered.push({
        id: `filter-${ordered.length}`,
        title: c.title,
        lang: c.lang,
        role: "filter",
        value: c.value,
      });
    } else {
      ruleEntry = c; // keep the last one as the rule
    }
  }
  ordered.push({
    id: "rule",
    title: ruleEntry?.title || "rule.yml",
    lang: ruleEntry?.lang || "yaml",
    role: "rule",
    value: ruleEntry?.value || SAMPLE_RULE,
  });

  files.value = ordered;
  // Default to the pipeline tab when present (show the pipeline first).
  activeFile.value = 0;
}

/** Extract the language id from a VitePress `language-*` block element. */
function langOf(block) {
  const m = [...block.classList].find((c) => c.startsWith("language-"));
  return m ? m.slice("language-".length) : "";
}

/** Languages we treat as editable input (everything else is a query output). */
function isInputLang(lang) {
  return lang === "yaml" || lang === "yml";
}

/** Read the source text out of a rendered Shiki block. */
function codeText(block) {
  const codeEl = block.querySelector("pre code") || block.querySelector("code");
  return codeEl ? codeEl.textContent?.replace(/\n$/, "") : "";
}

// Heroicons "bolt" (solid) path — injected as raw SVG so the bolt can live in
// the static DOM next to VitePress' (non-Vue) copy button.
const BOLT_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clip-rule="evenodd" /></svg>`;

/**
 * Inject a bolt "Live Edit" trigger into every static code block, sitting right
 * beside VitePress' copy button (same DOM section, so it positions relative to
 * it and works for plain blocks AND ::: code-group tabs). Also force the copy
 * button to stay visible (no hover required) so the pair reads as one control.
 */
function decorateStatic() {
  const el = staticRef.value;
  if (!el) return;
  const blocks = [...el.querySelectorAll('div[class*="language-"]')];
  let boltPlaced = false; // only the first input block gets the bolt
  for (const block of blocks) {
    if (block.querySelector(".sigma-engage")) continue; // already decorated
    // Keep the copy button permanently visible (it normally fades in on hover).
    block.classList.add("sigma-decorated");

    // Only the first editable input (YAML) block gets the bolt; the remaining
    // blocks (other tabs, the static query preview) keep just their (now
    // always-visible) copy button.
    if (boltPlaced || !isInputLang(langOf(block))) continue;
    boltPlaced = true;

    const wrap = document.createElement("div");
    wrap.className = "sigma-engage group";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sigma-engage-btn";
    btn.setAttribute("aria-label", "Live Edit");
    btn.innerHTML = `<span class="sigma-engage-label">Live Edit</span><span class="sigma-engage-icon">${BOLT_SVG}</span>`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      engage();
    });

    const tip = document.createElement("span");
    tip.setAttribute("role", "tooltip");
    tip.className = "sigma-engage-tip";
    tip.innerHTML = `Heads up: this downloads the pySigma engine (Pyodide / WebAssembly), a large <strong>~10&nbsp;MB+</strong> one-time download. It runs entirely in your browser and is only fetched when you click.<span class="sigma-engage-tip-arrow"></span>`;

    wrap.appendChild(btn);
    wrap.appendChild(tip);
    block.appendChild(wrap);
  }
}

async function engage() {
  if (engaged.value) return;
  seedFromSlot();
  localError.value = "";
  prefEngaged.value = true; // remember globally
  engaged.value = true;

  try {
    // Boot (or reuse) the single shared engine + prism editor for the page.
    const prism = await bootEngine();
    prism.applyTheme(isDark.value);

    await nextTick();
    mountInputEditors();

    // Install this instance's target on the shared engine (installed once
    // globally; a no-op if another converter already installed it).
    await installSharedBackend(target.value);
    convert();
  } catch (e) {
    localError.value = e instanceof Error ? e.message : String(e);
  }
}

/** Turn the live editor off — globally + persisted. Tears down the shared engine. */
function disengage() {
  prefEngaged.value = false;
  menuOpen.value = false;
  destroyEditors();
  output.value = "";
  localError.value = "";
  engaged.value = false;
  // The shared engine is torn down once; other instances react via prefEngaged.
  disposeEngine();
}

/** Mount one prism editor per input file into its host node. */
function mountInputEditors() {
  const prismApi = getPrism();
  if (!prismApi) return;
  destroyEditors();
  files.value.forEach((file, i) => {
    const host = editorHosts[i];
    if (!host) return;
    const ed = prismApi.createEditor(host, {
      value: file.value,
      language: "yaml",
      tabSize: 2,
      insertSpaces: true,
      lineNumbers: false,
      wordWrap: true,
    });
    ed.on("update", (value) => {
      file.value = value;
      if (ruleFile.value?.value.trim()) convert();
    });
    editors[i] = ed;
  });
}

/** Tear down every mounted editor instance. */
function destroyEditors() {
  for (const ed of editors) ed?.remove?.();
  editors.length = 0;
}

let convertSeq = 0;

async function convert() {
  const ruleText = ruleFile.value?.value || "";
  if (!ruleText.trim()) return;
  const seq = ++convertSeq;
  converting.value = true;
  copied.value = false;

  try {
    const ymls = pipelineYmls.value.filter((y) => y.trim());
    const filter = filterYml.value.trim();
    const result = await sharedConvert(
      ruleText,
      target.value,
      undefined, // built-in pipeline names (none)
      ymls.length ? ymls : undefined, // inline pipeline YAML(s)
      filter || undefined, // inline Sigma filter YAML
    );
    if (seq !== convertSeq) return;
    if (result.error) {
      localError.value = result.error;
    } else {
      localError.value = "";
      // Collapse blank lines (the engine emits double newlines between
      // correlation pipeline stages) so the rendered query stays compact and
      // matches the static examples in the docs.
      output.value = String(result.query ?? "").replace(/\n{2,}/g, "\n");
      await nextTick();
      renderOutput();
    }
  } catch (e) {
    if (seq !== convertSeq) return;
    localError.value = e instanceof Error ? e.message : String(e);
  } finally {
    if (seq === convertSeq) converting.value = false;
  }
}

/** Read-only syntax highlighting for the converted query. */
function renderOutput() {
  const prismApi = getPrism();
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

// Re-convert + install backend (on the shared engine) when the target changes.
// Also fired when another instance / tab changes the shared pref.
watch(target, async (next, prev) => {
  if (!engaged.value || next === prev) return;
  try {
    await installSharedBackend(next);
  } catch {
    /* installBackend may be a no-op for some targets */
  }
  convert();
});

// React to the shared "engaged" pref: auto-engage if another instance turned it
// on, and tear down if another instance turned it off.
watch(prefEngaged, (on) => {
  if (on && !engaged.value) engage();
  else if (!on && engaged.value) {
    // Another instance turned the editor off; mirror locally without re-tearing
    // down the (already disposed) shared engine.
    menuOpen.value = false;
    destroyEditors();
    output.value = "";
    localError.value = "";
    engaged.value = false;
  }
});

// Swap prism theme on dark/light toggle (also re-render this instance's output).
watch(isDark, () => {
  getPrism()?.applyTheme?.(isDark.value);
  if (engaged.value && output.value) renderOutput();
});

onMounted(async () => {
  document.addEventListener("click", onDocClick);
  // Inject the bolt trigger(s) into the static code blocks once they're in DOM.
  await nextTick();
  decorateStatic();
  // Honour the persisted "engaged" preference on load.
  if (prefEngaged.value) engage();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  destroyEditors();
  // Note: the shared engine is intentionally NOT disposed here — it is reused by
  // other converters and across SPA navigation, so it lives for the session
  // (until the user explicitly turns the live editor off via disengage()).
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

/* ---------------------------------------------------------------------------
   Bolt "Live Edit" trigger injected into each static code block (see
   decorateStatic). Styled with :deep() because the nodes are created in JS, so
   they live inside the scoped subtree but carry no scope attribute. The bolt
   sits at right:60px — just left of VitePress' copy button (40px @ right:12px,
   +8px gap) — so they read as a matched pair. When the copy button expands to
   its "Copied" pill it grows leftward only ~copied-text width; the 8px gap +
   the bolt's own position keep them from colliding.
   ------------------------------------------------------------------------- */

/* Keep VitePress' copy button permanently visible on decorated blocks (it
   normally only fades in when the block is hovered). */
.sigma-converter-static :deep(.sigma-decorated > button.copy) {
  opacity: 1;
}

.sigma-converter-static :deep(.sigma-engage) {
  position: absolute;
  top: 12px;
  right: 60px;
  z-index: 3;
}

/* 40x40 collapsed (matches the copy button), 4px radius, sky brand fill. The
   label is width-clipped to 0 and revealed on hover, expanding leftward. */
.sigma-converter-static :deep(.sigma-engage-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-width: 40px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: #0ea5e9; /* sky-500 */
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--vp-shadow-1);
  transition:
    width 0.2s,
    background-color 0.2s;
}
.sigma-converter-static :deep(.sigma-engage-btn:hover) {
  background-color: #0284c7; /* sky-600 */
}
.sigma-converter-static :deep(.sigma-engage-icon) {
  display: inline-flex;
  flex-shrink: 0;
}
.sigma-converter-static :deep(.sigma-engage-icon svg) {
  width: 16px;
  height: 16px;
}
.sigma-converter-static :deep(.sigma-engage-label) {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transition:
    max-width 0.2s,
    opacity 0.2s,
    margin 0.2s;
}
.sigma-converter-static :deep(.sigma-engage:hover .sigma-engage-label) {
  max-width: 120px;
  opacity: 1;
  margin-right: 8px;
}

/* One-time-download warning tooltip, anchored to the bolt's right edge. */
.sigma-converter-static :deep(.sigma-engage-tip) {
  pointer-events: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  width: 16rem;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #0f172a; /* slate-900 */
  color: #fff;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0;
  box-shadow: var(--vp-shadow-3);
  transition: opacity 0.15s;
}
:where(.dark) .sigma-converter-static :deep(.sigma-engage-tip) {
  background-color: #334155; /* slate-700 */
}
.sigma-converter-static :deep(.sigma-engage:hover .sigma-engage-tip) {
  opacity: 1;
}
.sigma-converter-static :deep(.sigma-engage-tip-arrow) {
  position: absolute;
  right: 12px;
  bottom: 100%;
  margin-bottom: -4px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background-color: #0f172a;
}
:where(.dark) .sigma-converter-static :deep(.sigma-engage-tip-arrow) {
  background-color: #334155;
}

/* Edge-to-edge on small viewports — mirror VitePress code blocks, which use
   `margin: 16px -24px` (negative side margins matching the page's 24px content
   padding) and drop their border-radius below 640px so they bleed to the screen
   edges. Above 640px they sit inset with rounded corners. We apply the same so
   the converter lines up with the surrounding static Shiki blocks. */
@media (max-width: 639px) {
  .sigma-live {
    margin-left: -24px;
    margin-right: -24px;
  }
  /* Square off the corners so the block meets both screen edges cleanly. */
  .sigma-toolbar {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }
  .sigma-block--input {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .sigma-block--output {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

/* Multi-file input tabs — mirror VitePress' code-group tab metrics (48px tall
   labels with a 2px active underline bar). The bar can't be expressed cleanly
   as a utility because it's a pseudo-element. */
.sigma-tab {
  line-height: 48px;
}
.sigma-tab::after {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  z-index: 1;
  height: 2px;
  border-radius: 2px;
  content: "";
  background-color: transparent;
  transition: background-color 0.25s;
}
.sigma-tab[aria-selected="true"]::after {
  background-color: var(--vp-code-tab-active-bar-color);
}
/* Round the tab bar's top corners (it becomes the top of the joined block when
   present) and clip so the input editor below keeps a clean square top edge. */
.sigma-block--input:has(.sigma-tabs) {
  overflow: hidden;
}
.sigma-tabs {
  border-radius: 8px 8px 0 0;
}
@media (max-width: 639px) {
  .sigma-tabs {
    border-radius: 0;
  }
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

/* Wrap the read-only converted query instead of overflowing horizontally.
   renderCodeBlock leaves the rendered lines as `white-space: pre`, so force
   wrapping and allow long tokens (field=value strings, regexes) to break. */
.sigma-output-code :deep(.prism-code-editor),
.sigma-output-code :deep(.prism-code-editor .pce-wrapper),
.sigma-output-code :deep(.prism-code-editor .pce-line) {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.sigma-output-code :deep(.prism-code-editor) {
  overflow-x: hidden;
}
</style>
