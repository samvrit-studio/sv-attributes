const ACTIVE_TIMERS = new WeakMap();

let liveRegion = null;

/**
 * Lazily creates a single shared visually-hidden aria-live region
 * used to announce copy results to screen reader users.
 */
function getLiveRegion() {
  if (liveRegion) return liveRegion;

  liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("role", "status");
  liveRegion.style.position = "absolute";
  liveRegion.style.width = "1px";
  liveRegion.style.height = "1px";
  liveRegion.style.overflow = "hidden";
  liveRegion.style.clip = "rect(0 0 0 0)";
  liveRegion.style.whiteSpace = "nowrap";

  document.body.appendChild(liveRegion);
  return liveRegion;
}

function announce(message) {
  if (!message) return;
  const region = getLiveRegion();
  // Clear first so repeated identical messages are still announced.
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/**
 * Reads the copyable text from an element, accounting for form fields
 * whose value lives in `.value` rather than `.textContent`.
 */
function getElementText(element) {
  if (!element) return "";

  const tag = element.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return element.value ?? "";
  }

  return element.textContent?.trim() ?? "";
}

/**
 * Resolves the text that should be copied for a given trigger element.
 * Priority: literal sv-copy-text -> sv-copy-target selector -> trigger's own text.
 */
function resolveCopyText(trigger) {
  const literal = trigger.getAttribute("sv-copy-text");
  if (literal !== null) return literal;

  const targetSelector = trigger.getAttribute("sv-copy-target");
  if (targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(
        `[sv-copy-to-clipboard] No element found for sv-copy-target="${targetSelector}"`,
      );
      return "";
    }
    return getElementText(target);
  }

  return getElementText(trigger);
}

/**
 * Writes text to the clipboard, falling back to the legacy
 * execCommand approach when the Clipboard API is unavailable
 * (e.g. non-secure contexts or older browsers).
 */
async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy approach.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

/**
 * Temporarily swaps the trigger's text content to show a success
 * message, then restores the original text after sv-copy-duration ms.
 */
function showMessage(trigger, message) {
  const duration = Number(trigger.getAttribute("sv-copy-duration")) || 1500;

  // If a timer is already running for this trigger, clear it so rapid
  // clicks don't restore the original text too early.
  const existing = ACTIVE_TIMERS.get(trigger);
  if (existing) {
    clearTimeout(existing.timeoutId);
  } else {
    // Only store the "original" text the first time, so repeated
    // clicks during the active window don't capture the message itself.
    trigger.dataset.svCopyOriginalText = trigger.textContent;
  }

  trigger.textContent = message;

  const timeoutId = setTimeout(() => {
    trigger.textContent = trigger.dataset.svCopyOriginalText ?? "";
    delete trigger.dataset.svCopyOriginalText;
    ACTIVE_TIMERS.delete(trigger);
  }, duration);

  ACTIVE_TIMERS.set(trigger, { timeoutId });
}

async function handleClick(event) {
  const trigger = event.currentTarget;
  const text = resolveCopyText(trigger);

  if (!text) {
    trigger.dispatchEvent(
      new CustomEvent("sv:copy:error", {
        detail: { reason: "empty", text },
      }),
    );
    return;
  }

  const success = await writeToClipboard(text);

  if (success) {
    trigger.dispatchEvent(
      new CustomEvent("sv:copy:success", { detail: { text } }),
    );
    announce("Copied to clipboard");

    const message = trigger.getAttribute("sv-copy-message");
    if (message !== null) {
      showMessage(trigger, message);
    }
  } else {
    trigger.dispatchEvent(
      new CustomEvent("sv:copy:error", {
        detail: { reason: "clipboard-write-failed", text },
      }),
    );
    announce("Copy failed");
  }
}

export function initCopyToClipboard() {
  const triggers = document.querySelectorAll('[sv-copy="click"]');

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", handleClick);
  });
}
