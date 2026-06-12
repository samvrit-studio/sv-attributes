# SV Attributes

Reusable Webflow attributes and utilities by Samvrit Studio.

## Installation

Add the script before the closing `</body>` tag:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/samvrit-studio/sv-attributes@v1.0.0/dist/sv-attributes.js"
></script>
```

## Attributes

### sv-current-year

Automatically inserts the current year.

#### HTML

```html
<span sv-current-year></span>
```

#### Output

```text
2026
```

### sv-copy-to-clipboard

Copies text to the clipboard when an element is clicked.

#### Basic usage

Copies the trigger's own text content:

```html
<button sv-copy="click" sv-copy-message="Copied!">Copy this text</button>
```

#### Copy from another element

Use `sv-copy-target` with any CSS selector. For `<input>`, `<textarea>`,
and `<select>` elements, the field's `value` is copied; for everything else,
`textContent` is used.

```html
<input id="email-field" type="text" value="hello@samvritstudio.com" readonly />
<button sv-copy="click" sv-copy-target="#email-field">Copy email</button>
```

#### Copy a literal string

Use `sv-copy-text` to copy a static value that isn't shown on the page:

```html
<button sv-copy="click" sv-copy-text="WELCOME10">Copy discount code</button>
```

#### Attributes reference

| Attribute          | Required | Description                                                              |
| ------------------ | -------- | ------------------------------------------------------------------------ |
| `sv-copy="click"`  | Yes      | Marks the element as a copy trigger.                                     |
| `sv-copy-text`     | No       | A literal string to copy. Takes priority over `sv-copy-target`.          |
| `sv-copy-target`   | No       | CSS selector for the element whose text/value should be copied.          |
| `sv-copy-message`  | No       | Temporary text shown on the trigger after a successful copy.             |
| `sv-copy-duration` | No       | How long (ms) the message is shown before reverting. Defaults to `1500`. |

If neither `sv-copy-text` nor `sv-copy-target` is set, the trigger's own
text is copied.

#### Events

The trigger element dispatches custom events you can listen for:

```html
<button id="copy-btn" sv-copy="click" sv-copy-text="Hello world">Copy</button>

<script type="module">
  document
    .getElementById("copy-btn")
    .addEventListener("sv:copy:success", (e) => {
      console.log("Copied:", e.detail.text);
    });

  document.getElementById("copy-btn").addEventListener("sv:copy:error", (e) => {
    console.log("Copy failed:", e.detail.reason);
  });
</script>
```

#### Browser support

Uses the `navigator.clipboard` API where available, with an automatic
fallback to `document.execCommand("copy")` for non-secure contexts (e.g.
`http://` or `file://`) and older browsers.

#### Accessibility

A shared, visually-hidden `aria-live="polite"` region announces "Copied to
clipboard" or "Copy failed" to screen reader users, independent of the
`sv-copy-message` visual feedback.

## License

MIT
