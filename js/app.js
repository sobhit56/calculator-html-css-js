/**
 * OmniCalc - UI Controller & Event Handlers
 * 
 * Handles DOM interaction, display scaling, theme switching, history persistence,
 * clipboard copy, and comprehensive keyboard shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new CalculatorEngine();

  // DOM Elements
  const primaryDisplay = document.getElementById('primary-display');
  const expressionDisplay = document.getElementById('expression-display');
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const angleModeBtn = document.getElementById('angle-mode-btn');
  const angleLabel = document.getElementById('angle-label');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const historyToggleBtn = document.getElementById('history-toggle-btn');
  const historyDrawer = document.getElementById('history-drawer');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const copyResultBtn = document.getElementById('copy-result-btn');
  const toast = document.getElementById('toast');
  const scientificKeys = document.getElementById('scientific-keys');
  const calculatorApp = document.querySelector('.calculator-app');
  const keys = document.querySelectorAll('.key');

  // State
  let history = JSON.parse(localStorage.getItem('omnicalc_history') || '[]');
  let currentTheme = localStorage.getItem('omnicalc_theme') || 
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  let isScientific = localStorage.getItem('omnicalc_mode') === 'scientific';

  // ---------------- Initialize UI ----------------
  applyTheme(currentTheme);
  setScientificMode(isScientific);
  renderHistory();
  updateDisplay();

  // ---------------- Display Formatting ----------------
  function formatDisplayNumber(str) {
    if (!str || str === 'Error' || str.includes('Cannot') || str.includes('Undefined') || str.includes('Infinity')) {
      return str;
    }

    if (str.includes('e')) {
      return str; // Exponential
    }

    const parts = str.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    // Format integer portion with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedInteger + decimalPart;
  }

  function updateDisplay() {
    expressionDisplay.textContent = engine.expression;
    primaryDisplay.textContent = formatDisplayNumber(engine.currentInput);

    // Auto-scale font size if number is very long
    const length = engine.currentInput.length;
    if (length > 14) {
      primaryDisplay.style.fontSize = '1.4rem';
    } else if (length > 10) {
      primaryDisplay.style.fontSize = '1.8rem';
    } else {
      primaryDisplay.style.fontSize = '2.5rem';
    }
  }

  // ---------------- Theme Handling ----------------
  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('omnicalc_theme', theme);
    currentTheme = theme;
  }

  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  });

  // ---------------- Scientific Mode Handling ----------------
  function setScientificMode(active) {
    isScientific = active;
    localStorage.setItem('omnicalc_mode', active ? 'scientific' : 'standard');

    if (active) {
      scientificKeys.classList.remove('hidden');
      angleModeBtn.classList.remove('hidden');
      calculatorApp.classList.add('scientific-active');
      modeToggleBtn.classList.add('active');
    } else {
      scientificKeys.classList.add('hidden');
      angleModeBtn.classList.add('hidden');
      calculatorApp.classList.remove('scientific-active');
      modeToggleBtn.classList.remove('active');
    }
  }

  modeToggleBtn.addEventListener('click', () => {
    setScientificMode(!isScientific);
  });

  angleModeBtn.addEventListener('click', () => {
    const nextMode = engine.angleMode === 'DEG' ? 'RAD' : 'DEG';
    engine.setAngleMode(nextMode);
    angleLabel.textContent = nextMode;
    showToast(`Angle mode: ${nextMode}`);
  });

  // ---------------- History Management ----------------
  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9"/>
            <polyline points="12 7 12 12 15 15"/>
          </svg>
          <p>No calculations yet</p>
        </div>`;
      return;
    }

    historyList.innerHTML = '';
    history.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.tabIndex = 0;
      el.innerHTML = `
        <div class="history-expr">${item.expression} =</div>
        <div class="history-res">${item.result}</div>
      `;
      el.addEventListener('click', () => {
        engine.currentInput = item.result;
        engine.expression = '';
        engine.isResult = true;
        updateDisplay();
        closeHistoryDrawer();
        showToast('Restored result from history');
      });
      historyList.appendChild(el);
    });
  }

  function addHistoryItem(item) {
    if (!item) return;
    history.unshift(item);
    if (history.length > 30) history.pop(); // Keep last 30
    localStorage.setItem('omnicalc_history', JSON.stringify(history));
    renderHistory();
  }

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('omnicalc_history');
    renderHistory();
    showToast('Calculation history cleared');
  });

  function openHistoryDrawer() {
    historyDrawer.classList.add('open');
    historyDrawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.classList.add('active');
  }

  function closeHistoryDrawer() {
    historyDrawer.classList.remove('open');
    historyDrawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.classList.remove('active');
  }

  historyToggleBtn.addEventListener('click', openHistoryDrawer);
  closeHistoryBtn.addEventListener('click', closeHistoryDrawer);
  drawerBackdrop.addEventListener('click', closeHistoryDrawer);

  // ---------------- Copy to Clipboard ----------------
  copyResultBtn.addEventListener('click', async () => {
    const textToCopy = engine.currentInput;
    if (!textToCopy || textToCopy === '0') return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Copied to clipboard!');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    }
  });

  // ---------------- Toast Notifications ----------------
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // ---------------- Keypad Actions ----------------
  function handleAction(action, value) {
    switch (action) {
      case 'digit':
        engine.appendDigit(value);
        break;
      case 'decimal':
        engine.appendDecimal();
        break;
      case 'clear-all':
        engine.clear();
        break;
      case 'backspace':
        engine.clearEntry();
        break;
      case 'negate':
        engine.toggleSign();
        break;
      case 'percent':
        engine.applyPercent();
        break;
      case 'operator':
        engine.setOperator(value);
        break;
      case 'parenthesis-open':
        engine.appendParenthesis('(');
        break;
      case 'parenthesis-close':
        engine.appendParenthesis(')');
        break;
      case 'equals': {
        const item = engine.compute();
        if (item) {
          addHistoryItem(item);
        }
        break;
      }
      case 'power':
        engine.setOperator('^');
        break;
      case 'pi':
        engine.appendConstant('pi');
        break;
      case 'e':
        engine.appendConstant('e');
        break;
      case 'func':
        engine.applyFunction(value);
        break;
    }

    updateDisplay();
  }

  // Click listeners for keys
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const num = key.getAttribute('data-num');
      const action = key.getAttribute('data-action');
      const op = key.getAttribute('data-op');

      if (num !== null) {
        handleAction('digit', num);
      } else if (action === 'divide' || action === 'multiply' || action === 'subtract' || action === 'add') {
        handleAction('operator', op);
      } else if (action === 'power') {
        handleAction('power', '^');
      } else if (action === 'pi' || action === 'e') {
        handleAction(action, action);
      } else if (['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'square', 'reciprocal', 'fact'].includes(action)) {
        handleAction('func', action);
      } else if (action) {
        handleAction(action);
      }
    });
  });

  // ---------------- Keyboard Shortcuts ----------------
  const keyMap = {
    '0': () => handleAction('digit', '0'),
    '1': () => handleAction('digit', '1'),
    '2': () => handleAction('digit', '2'),
    '3': () => handleAction('digit', '3'),
    '4': () => handleAction('digit', '4'),
    '5': () => handleAction('digit', '5'),
    '6': () => handleAction('digit', '6'),
    '7': () => handleAction('digit', '7'),
    '8': () => handleAction('digit', '8'),
    '9': () => handleAction('digit', '9'),
    '.': () => handleAction('decimal'),
    '+': () => handleAction('operator', '+'),
    '-': () => handleAction('operator', '−'),
    '*': () => handleAction('operator', '×'),
    '/': () => handleAction('operator', '÷'),
    '^': () => handleAction('power', '^'),
    '%': () => handleAction('percent'),
    '(': () => handleAction('parenthesis-open'),
    ')': () => handleAction('parenthesis-close'),
    '=': () => handleAction('equals'),
    'Enter': () => handleAction('equals'),
    'Backspace': () => handleAction('backspace'),
    'Escape': () => handleAction('clear-all'),
    'Delete': () => handleAction('clear-all')
  };

  document.addEventListener('keydown', (e) => {
    // If drawer is open and user hits Esc, close drawer
    if (e.key === 'Escape' && historyDrawer.classList.contains('open')) {
      closeHistoryDrawer();
      return;
    }

    if (e.key in keyMap) {
      e.preventDefault();
      keyMap[e.key]();

      // Visual feedback: find and animate button
      highlightKey(e.key);
    }
  });

  function highlightKey(keyChar) {
    let targetKey;
    if (!isNaN(keyChar)) {
      targetKey = document.querySelector(`.key[data-num="${keyChar}"]`);
    } else if (keyChar === '+') {
      targetKey = document.querySelector(`.key[data-action="add"]`);
    } else if (keyChar === '-') {
      targetKey = document.querySelector(`.key[data-action="subtract"]`);
    } else if (keyChar === '*') {
      targetKey = document.querySelector(`.key[data-action="multiply"]`);
    } else if (keyChar === '/') {
      targetKey = document.querySelector(`.key[data-action="divide"]`);
    } else if (keyChar === '=' || keyChar === 'Enter') {
      targetKey = document.getElementById('btn-equals');
    } else if (keyChar === 'Backspace') {
      targetKey = document.getElementById('btn-backspace');
    } else if (keyChar === 'Escape' || keyChar === 'Delete') {
      targetKey = document.getElementById('btn-ac');
    }

    if (targetKey) {
      targetKey.classList.add('key-active');
      setTimeout(() => targetKey.classList.remove('key-active'), 120);
    }
  }
});
