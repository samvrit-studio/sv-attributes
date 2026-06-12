//#region src/sv-current-year.js
function e() {
	document.querySelectorAll("[sv-current-year]").forEach((e) => {
		e.textContent = (/* @__PURE__ */ new Date()).getFullYear();
	});
}
//#endregion
//#region src/main.js
document.addEventListener("DOMContentLoaded", () => {
	e();
});
//#endregion
