# OmniCalc 🧮

A modern, responsive, and tactile web calculator built with vanilla JavaScript, modern CSS, and HTML5. OmniCalc transitions seamlessly between a clean everyday standard calculator and a full-featured scientific calculator with calculation history and keyboard navigation.

---

## ✨ Features

- **Dual-Mode Architecture**:
  - **Standard Mode**: Everyday arithmetic (`+`, `−`, `×`, `÷`), parentheses, percentages, and sign toggle (`±`).
  - **Scientific Mode**: Trigonometry (`sin`, `cos`, `tan`), logarithms (`ln`, `log`), powers (`x²`, `xʸ`), roots (`√x`), reciprocal (`1/x`), factorials (`x!`), constants (`π`, `e`), and `DEG`/`RAD` angle switcher.
- **Precision Calculation Engine**:
  - Built using a safe Shunting-Yard parser (RPN evaluation) without insecure `eval()`.
  - Floating-point correction to eliminate IEEE-754 precision artifacts (e.g. `0.1 + 0.2 = 0.3`).
- **Dark & Light Mode**:
  - Beautiful glassmorphic themes with automatic system color scheme detection and manual toggle.
  - Theme preference persisted in `localStorage`.
- **Calculation History Drawer**:
  - Keep track of past expressions and results.
  - Click any historical entry to restore its value directly into the calculator.
  - Stored locally across browser sessions.
- **Copy to Clipboard**:
  - One-click button to copy current result to clipboard with visual toast confirmation.
- **Full Keyboard Navigation**:
  - Full keyboard bindings with tactile on-screen button highlight animations.
- **Zero Dependencies**:
  - Pure HTML5, CSS3, and modern Vanilla JS. No bulky frameworks or build steps required.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `0` - `9` | Enter numbers |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Arithmetic operators (`+`, `−`, `×`, `÷`) |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last entered character |
| `Escape` or `Delete` | Clear all (AC) |
| `%` | Percentage |
| `(`, `)` | Parentheses |
| `^` | Power / Exponentiation |

---

## 📁 Project Structure

```text
Calculator/
├── index.html              # Main calculator application entry point
├── Calculator project.html # Legacy redirect to index.html
├── README.md               # Project documentation
├── .gitignore              # Git ignore rules
├── css/
│   └── style.css           # Modern styles, themes, and animations
└── js/
    ├── calculator.js       # Core math engine, Shunting-Yard parser, and precision logic
    └── app.js              # UI controller, DOM events, history, and shortcuts
```

---

## 🚀 Getting Started

No build process or installation is required:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/<username>/<repo-name>.git
   cd Calculator
   ```
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge):
   - Double-click `index.html`, or
   - Use VS Code Live Server extension, or
   - Run a lightweight HTTP server:
     ```bash
     npx serve .
     ```

---

## 🌐 Deploy to GitHub Pages

To host this live for free on GitHub Pages:
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages** in your repository.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your calculator will be live within seconds at `https://<username>.github.io/<repo-name>/`.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
