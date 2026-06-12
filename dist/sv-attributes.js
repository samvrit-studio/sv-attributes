//#region src/sv-current-year.js
function e() {
	document.querySelectorAll("[sv-current-year]").forEach((e) => {
		e.textContent = (/* @__PURE__ */ new Date()).getFullYear();
	});
}
//#endregion
//#region src/sv-copy-to-clipboard.js
var t = /* @__PURE__ */ new WeakMap(), n = null;
function r() {
	return n || (n = document.createElement("div"), n.setAttribute("aria-live", "polite"), n.setAttribute("role", "status"), n.style.position = "absolute", n.style.width = "1px", n.style.height = "1px", n.style.overflow = "hidden", n.style.clip = "rect(0 0 0 0)", n.style.whiteSpace = "nowrap", document.body.appendChild(n), n);
}
function i(e) {
	if (!e) return;
	let t = r();
	t.textContent = "", requestAnimationFrame(() => {
		t.textContent = e;
	});
}
function a(e) {
	if (!e) return "";
	let t = e.tagName;
	return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" ? e.value ?? "" : e.textContent?.trim() ?? "";
}
function o(e) {
	let t = e.getAttribute("sv-copy-text");
	if (t !== null) return t;
	let n = e.getAttribute("sv-copy-target");
	if (n) {
		let e = document.querySelector(n);
		return e ? a(e) : (console.warn(`[sv-copy-to-clipboard] No element found for sv-copy-target="${n}"`), "");
	}
	return a(e);
}
async function s(e) {
	if (navigator.clipboard?.writeText) try {
		return await navigator.clipboard.writeText(e), !0;
	} catch {}
	let t = document.createElement("textarea");
	t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.top = "-9999px", t.style.left = "-9999px", document.body.appendChild(t), t.select();
	let n = !1;
	try {
		n = document.execCommand("copy");
	} catch {
		n = !1;
	}
	return document.body.removeChild(t), n;
}
function c(e, n) {
	let r = Number(e.getAttribute("sv-copy-duration")) || 1500, i = t.get(e);
	i ? clearTimeout(i.timeoutId) : e.dataset.svCopyOriginalText = e.textContent, e.textContent = n;
	let a = setTimeout(() => {
		e.textContent = e.dataset.svCopyOriginalText ?? "", delete e.dataset.svCopyOriginalText, t.delete(e);
	}, r);
	t.set(e, { timeoutId: a });
}
async function l(e) {
	let t = e.currentTarget, n = o(t);
	if (!n) {
		t.dispatchEvent(new CustomEvent("sv:copy:error", { detail: {
			reason: "empty",
			text: n
		} }));
		return;
	}
	if (await s(n)) {
		t.dispatchEvent(new CustomEvent("sv:copy:success", { detail: { text: n } })), i("Copied to clipboard");
		let e = t.getAttribute("sv-copy-message");
		e !== null && c(t, e);
	} else t.dispatchEvent(new CustomEvent("sv:copy:error", { detail: {
		reason: "clipboard-write-failed",
		text: n
	} })), i("Copy failed");
}
function u() {
	document.querySelectorAll("[sv-copy=\"click\"]").forEach((e) => {
		e.addEventListener("click", l);
	});
}
//#endregion
//#region src/main.js
document.addEventListener("DOMContentLoaded", () => {
	e(), u();
});
//#endregion
