const ACTIVE_TIMERS = new WeakMap();
const INITIALIZED = new WeakSet();

let liveRegion = null;

/**
 * Creates a shared aria-live region for screen readers.
 */
function getLiveRegion() {
  if (liveRegion) return liveRegion;

  liveRegion = document.createElement("div");

  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("role", "status");

  Object.assign(liveRegion.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
  });

  document.body.appendChild(liveRegion);

  return liveRegion;
}

function announce(message) {
  if (!message) return;

  const region = getLiveRegion();

  region.textContent = "";

  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/**
 * Gets copyable text from any supported element.
 */
function getElementText(element) {
  if (!element) return "";

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return element.value ?? "";
  }

  return element.textContent?.trim() ?? "";
}

/**
 * Resolves the text to copy.
 *
 * Priority:
 * 1. sv-copy-type="url"
 * 2. nearest item text
 * 3. wrapper text fallback
 */
function resolveCopyText(trigger) {
  const type = trigger.getAttribute("sv-copy-type");

  if (type === "url") {
    return window.location.href;
  }

  const item = trigger.closest('[sv-copy-element="item"]');

  if (item) {
    const textElement = item.querySelector('[sv-copy-element="text"]');

    if (!textElement) {
      console.warn("[sv-copy] Missing text element inside item.");
      return "";
    }

    return getElementText(textElement);
  }

  const wrapper = trigger.closest('[sv-copy-element="wrapper"]');

  if (!wrapper) {
    console.warn("[sv-copy] Trigger must be inside a wrapper.");
    return "";
  }

  const textElement = wrapper.querySelector('[sv-copy-element="text"]');

  if (!textElement) {
    console.warn("[sv-copy] Missing text element.");
    return "";
  }

  return getElementText(textElement);
}

/**
 * Writes text to clipboard.
 * Falls back to execCommand when Clipboard API fails.
 */
async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to fallback.
    }
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");

  Object.assign(textarea.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
  });

  document.body.appendChild(textarea);

  textarea.select();

  let success = false;

  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  textarea.remove();

  return success;
}

/**
 * Shows success state.
 */
function showSuccessState(trigger) {
  const duration = Number(trigger.getAttribute("sv-copy-duration")) || 1500;

  const message = trigger.getAttribute("sv-copy-message");

  const activeClass = trigger.getAttribute("sv-copy-active-class");

  const label = trigger.querySelector('[sv-copy-element="label"]');

  const existing = ACTIVE_TIMERS.get(trigger);

  if (existing) {
    clearTimeout(existing.timeoutId);
  }

  if (!existing) {
    ACTIVE_TIMERS.set(trigger, {
      originalLabel: label?.textContent ?? "",
      timeoutId: null,
    });
  }

  const state = ACTIVE_TIMERS.get(trigger);

  if (message && label) {
    label.textContent = message;
  }

  if (activeClass) {
    trigger.classList.add(activeClass);
  }

  state.timeoutId = setTimeout(() => {
    if (message && label) {
      label.textContent = state.originalLabel;
    }

    if (activeClass) {
      trigger.classList.remove(activeClass);
    }

    ACTIVE_TIMERS.delete(trigger);
  }, duration);
}

async function handleClick(event) {
  const trigger = event.currentTarget;

  const text = resolveCopyText(trigger);

  if (!text) {
    trigger.dispatchEvent(
      new CustomEvent("sv:copy:error", {
        detail: {
          reason: "empty",
          text,
        },
      }),
    );

    announce("Nothing to copy");

    return;
  }

  const success = await writeToClipboard(text);

  if (!success) {
    trigger.dispatchEvent(
      new CustomEvent("sv:copy:error", {
        detail: {
          reason: "clipboard-write-failed",
          text,
        },
      }),
    );

    announce("Copy failed");

    return;
  }

  trigger.dispatchEvent(
    new CustomEvent("sv:copy:success", {
      detail: { text },
    }),
  );

  announce("Copied to clipboard");

  showSuccessState(trigger);
}

/**
 * Initializes SV Copy.
 */
export function initCopyToClipboard() {
  const triggers = document.querySelectorAll('[sv-copy-element="trigger"]');

  triggers.forEach((trigger) => {
    if (INITIALIZED.has(trigger)) return;

    INITIALIZED.add(trigger);

    trigger.addEventListener("click", handleClick);
  });
}
