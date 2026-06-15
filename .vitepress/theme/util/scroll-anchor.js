/**
 * Scroll anchoring — keep a chosen element visually fixed across page reflow.
 *
 * When a user action triggers asynchronous, possibly page-wide layout changes
 * (content above the clicked element grows or shrinks), the spot the user just
 * interacted with gets shoved up or down the page. Browsers' native CSS
 * `overflow-anchor` is unreliable for JS-driven changes and can't be told which
 * node to anchor, so we do it explicitly: capture an element's viewport offset,
 * then re-align the page on every animation frame for a short window so that
 * element stays put no matter how the surrounding layout reflows.
 *
 * This is intentionally framework-agnostic (no Vue), a single global anchor at
 * a time (the most recent `pinElement` call wins), and self-releasing — it
 * never hijacks scrolling indefinitely and bows out the moment the user scrolls.
 *
 * Typical use: call `pinElement(node)` right BEFORE the state change that will
 * cause the reflow (while `node` is still laid out at its current position).
 *
 *   import { pinElement } from "../util/scroll-anchor.js";
 *   pinElement(event.currentTarget.closest(".my-widget"));
 *   doTheThingThatReflowsThePage();
 */

let anchorEl = null;
let anchorTop = 0;
let anchorRaf = 0;
let anchorTimer = null;
let listening = false;
// The Y we last scrolled the page to ourselves. Used to tell our own corrective
// scrolls apart from a genuine user scroll without relying on event timing.
let lastSelfScrollY = -1;

function clearAnchor() {
  if (anchorRaf) {
    cancelAnimationFrame(anchorRaf);
    anchorRaf = 0;
  }
  if (anchorTimer) {
    clearTimeout(anchorTimer);
    anchorTimer = null;
  }
  if (listening && typeof window !== "undefined") {
    window.removeEventListener("scroll", onUserScroll);
    listening = false;
  }
  anchorEl = null;
  lastSelfScrollY = -1;
}

// If the user scrolls themselves while we're anchoring, back off — they've
// taken over and we shouldn't yank the page back. Our own corrective scrolls
// land at lastSelfScrollY; anything else is the user, so we release.
function onUserScroll() {
  if (!anchorEl) return;
  if (Math.abs(window.scrollY - lastSelfScrollY) <= 1) return; // our own scroll
  clearAnchor();
}

/** Keep the anchored element at its captured offset, then schedule the next frame. */
function frame() {
  if (!anchorEl) return;
  const rect = anchorEl.getBoundingClientRect();
  // Guard against a collapsed/detached element (e.g. a node that became
  // display:none). Its rect reads all-zeros, which would otherwise be treated as
  // "top moved to 0" and scroll the whole page to the top. Skip such frames.
  const collapsed =
    !anchorEl.isConnected ||
    (rect.top === 0 && rect.bottom === 0 && rect.height === 0);
  if (!collapsed) {
    const delta = rect.top - anchorTop;
    if (Math.abs(delta) > 0.5) {
      window.scrollBy(0, delta);
      lastSelfScrollY = window.scrollY; // record where WE put it
    }
  }
  anchorRaf = requestAnimationFrame(frame);
}

/**
 * Pin `el` at its current viewport position across the imminent reflow.
 *
 * Safe to call repeatedly; the most recent call wins. No-op (and harmless) when
 * `el` is missing, motion is reduced, or required browser APIs are unavailable.
 *
 * @param {Element|null|undefined} el  The element to keep visually fixed.
 * @param {object} [opts]
 * @param {number} [opts.duration=8000]  How long (ms) to keep correcting before
 *   auto-releasing. Pick a window comfortably covering the async reflows you
 *   expect (engine boot, network, late renders) without hijacking scroll for ever.
 */
export function pinElement(el, { duration = 8000 } = {}) {
  if (typeof window === "undefined" || !el) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  clearAnchor();
  anchorEl = el;
  anchorTop = el.getBoundingClientRect().top;

  window.addEventListener("scroll", onUserScroll, { passive: true });
  listening = true;

  anchorRaf = requestAnimationFrame(frame);
  anchorTimer = setTimeout(clearAnchor, duration);
}

/** Stop any active anchor immediately. */
export function releaseAnchor() {
  clearAnchor();
}
