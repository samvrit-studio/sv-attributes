import { initCurrentYear } from "./current-year.js";
import { initCopyClip } from "./copy-to-clipboard.js";

document.addEventListener("DOMContentLoaded", () => {
  initCurrentYear();
  initCopyClip();
});
