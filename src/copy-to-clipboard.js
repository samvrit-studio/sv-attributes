const ACTIVE_TIMERS = new WeakMap();
const INITIALIZED = new WeakSet();

let liveRegion = null;

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

function resolveCopyText(trigger) {
  const type = trigger.getAttribute("sv-copyclip-type");

  if (type === "url") {
    return window.location.href;
  }

  const item = trigger.closest('[sv-copyclip-element="item"]');

  if (item) {
    const textElement = item.querySelector('[sv-copyclip-element="text"]');

    if (!textElement) {
      console.warn("[sv-copyclip] Missing text element inside item.");
      return "";
    }

    return getElementText(textElement);
  }

  const wrapper = trigger.closest('[sv-copyclip-element="wrapper"]');

  if (!wrapper) {
    console.warn("[sv-copyclip] Trigger must be inside a wrapper.");
    return "";
  }

  const textElement = wrapper.querySelector('[sv-copyclip-element="text"]');

  if (!textElement) {
    console.warn("[sv-copyclip] Missing text element.");
    return "";
  }

  return getElementText(textElement);
}

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

function showSuccessState(trigger) {
  const duration = Number(trigger.getAttribute("sv-copyclip-duration")) || 1500;

  const message = trigger.getAttribute("sv-copyclip-message");

  const activeClass = trigger.getAttribute("sv-copyclip-active-class");

  const label = trigger.querySelector('[sv-copyclip-element="label"]');

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

export function initCopyClip() {
  const triggers = document.querySelectorAll('[sv-copyclip-element="trigger"]');

  triggers.forEach((trigger) => {
    if (INITIALIZED.has(trigger)) return;

    INITIALIZED.add(trigger);

    trigger.addEventListener("click", handleClick);
  });
}
