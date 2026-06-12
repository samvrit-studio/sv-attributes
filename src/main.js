import { initCurrentYear } from "./sv-current-year.js";
import { initCopyToClipboard } from "./sv-copy-to-clipboard.js";

document.addEventListener("DOMContentLoaded", () => {
  initCurrentYear();
  initCopyToClipboard();
});
