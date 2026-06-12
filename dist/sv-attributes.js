//#region src/current-year.js
function e() {
	document.querySelectorAll("[sv-current-year]").forEach((e) => {
		e.textContent = (/* @__PURE__ */ new Date()).getFullYear();
	});
}
//#endregion
//#region src/copy-to-clipboard.js
var t = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakSet(), r = null;
function i() {
	return r || (r = document.createElement("div"), r.setAttribute("aria-live", "polite"), r.setAttribute("role", "status"), Object.assign(r.style, {
		position: "absolute",
		width: "1px",
		height: "1px",
		overflow: "hidden",
		clip: "rect(0 0 0 0)",
		whiteSpace: "nowrap"
	}), document.body.appendChild(r), r);
}
function a(e) {
	if (!e) return;
	let t = i();
	t.textContent = "", requestAnimationFrame(() => {
		t.textContent = e;
	});
}
function o(e) {
	return e ? e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement ? e.value ?? "" : e.textContent?.trim() ?? "" : "";
}
function s(e) {
	if (e.getAttribute("sv-copy-type") === "url") return window.location.href;
	let t = e.closest("[sv-copy-element=\"item\"]");
	if (t) {
		let e = t.querySelector("[sv-copy-element=\"text\"]");
		return e ? o(e) : (console.warn("[sv-copy] Missing text element inside item."), "");
	}
	let n = e.closest("[sv-copy-element=\"wrapper\"]");
	if (!n) return console.warn("[sv-copy] Trigger must be inside a wrapper."), "";
	let r = n.querySelector("[sv-copy-element=\"text\"]");
	return r ? o(r) : (console.warn("[sv-copy] Missing text element."), "");
}
async function c(e) {
	if (navigator.clipboard?.writeText) try {
		return await navigator.clipboard.writeText(e), !0;
	} catch {}
	let t = document.createElement("textarea");
	t.value = e, t.setAttribute("readonly", ""), Object.assign(t.style, {
		position: "fixed",
		top: "-9999px",
		left: "-9999px"
	}), document.body.appendChild(t), t.select();
	let n = !1;
	try {
		n = document.execCommand("copy");
	} catch {
		n = !1;
	}
	return t.remove(), n;
}
function l(e) {
	let n = Number(e.getAttribute("sv-copy-duration")) || 1500, r = e.getAttribute("sv-copy-message"), i = e.getAttribute("sv-copy-active-class"), a = e.querySelector("[sv-copy-element=\"label\"]"), o = t.get(e);
	o && clearTimeout(o.timeoutId), o || t.set(e, {
		originalLabel: a?.textContent ?? "",
		timeoutId: null
	});
	let s = t.get(e);
	r && a && (a.textContent = r), i && e.classList.add(i), s.timeoutId = setTimeout(() => {
		r && a && (a.textContent = s.originalLabel), i && e.classList.remove(i), t.delete(e);
	}, n);
}
async function u(e) {
	let t = e.currentTarget, n = s(t);
	if (!n) {
		t.dispatchEvent(new CustomEvent("sv:copy:error", { detail: {
			reason: "empty",
			text: n
		} })), a("Nothing to copy");
		return;
	}
	if (!await c(n)) {
		t.dispatchEvent(new CustomEvent("sv:copy:error", { detail: {
			reason: "clipboard-write-failed",
			text: n
		} })), a("Copy failed");
		return;
	}
	t.dispatchEvent(new CustomEvent("sv:copy:success", { detail: { text: n } })), a("Copied to clipboard"), l(t);
}
function d() {
	document.querySelectorAll("[sv-copy-element=\"trigger\"]").forEach((e) => {
		n.has(e) || (n.add(e), e.addEventListener("click", u));
	});
}
//#endregion
//#region src/main.js
document.addEventListener("DOMContentLoaded", () => {
	e(), d();
});
//#endregion
