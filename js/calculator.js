/**
 * OmniCalc - Math & Calculation Engine
 * 
 * Provides safe expression parsing, precedence handling (Shunting-Yard algorithm),
 * precision arithmetic, and scientific calculations without relying on eval().
 */

class CalculatorEngine {
  constructor() {
    this.angleMode = 'DEG'; // 'DEG' or 'RAD'
    this.clear();
  }

  clear() {
    this.expression = '';
    this.currentInput = '0';
    this.isResult = false;
    this.hasDecimal = false;
  }

  clearEntry() {
    if (this.isResult) {
      this.clear();
      return;
    }
    if (this.currentInput.length > 1) {
      if (this.currentInput.slice(-1) === '.') {
        this.hasDecimal = false;
      }
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = '0';
      this.hasDecimal = false;
    }
  }

  setAngleMode(mode) {
    if (mode === 'DEG' || mode === 'RAD') {
      this.angleMode = mode;
    }
  }

  appendDigit(digit) {
    if (this.isResult) {
      this.currentInput = digit;
      this.expression = '';
      this.isResult = false;
      this.hasDecimal = false;
      return;
    }

    if (this.currentInput === '0') {
      this.currentInput = digit;
    } else {
      // Prevent excessively long inputs
      if (this.currentInput.length < 18) {
        this.currentInput += digit;
      }
    }
  }

  appendDecimal() {
    if (this.isResult) {
      this.currentInput = '0.';
      this.expression = '';
      this.isResult = false;
      this.hasDecimal = true;
      return;
    }

    if (!this.hasDecimal) {
      this.currentInput += '.';
      this.hasDecimal = true;
    }
  }

  appendConstant(constant) {
    const val = constant === 'pi' ? Math.PI : Math.E;
    this.currentInput = this.formatNumber(val);
    this.isResult = false;
    this.hasDecimal = true;
  }

  toggleSign() {
    if (this.currentInput === '0' || this.currentInput === '0.') return;
    if (this.currentInput.startsWith('-')) {
      this.currentInput = this.currentInput.slice(1);
    } else {
      this.currentInput = '-' + this.currentInput;
    }
  }

  applyPercent() {
    const val = parseFloat(this.currentInput);
    if (isNaN(val)) return;

    // If an expression exists ending with an operator, e.g. "100 + " and currentInput is "10"
    // percentage should compute 10% of 100 = 10 -> "100 + 10"
    const trimmed = this.expression.trim();
    const lastOpMatch = trimmed.match(/([\+\−\×\÷])\s*$/);
    if (lastOpMatch) {
      const op = lastOpMatch[1];
      const prevNumMatch = trimmed.slice(0, lastOpMatch.index).trim();
      const prevVal = this.evaluateSimple(prevNumMatch);
      if (!isNaN(prevVal) && (op === '+' || op === '−')) {
        const percentVal = (prevVal * val) / 100;
        this.currentInput = this.formatNumber(percentVal);
        return;
      }
    }

    // Default unary percentage (e.g. 50% = 0.5)
    this.currentInput = this.formatNumber(val / 100);
  }

  applyFunction(func) {
    const val = parseFloat(this.currentInput);
    if (isNaN(val)) return;

    let res;
    switch (func) {
      case 'sin': {
        const rad = this.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
        // Fix floating point inaccuracies like sin(180 deg) = 0
        res = Math.abs(Math.sin(rad)) < 1e-15 ? 0 : Math.sin(rad);
        break;
      }
      case 'cos': {
        const rad = this.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
        // Fix floating point inaccuracies like cos(90 deg) = 0
        res = Math.abs(Math.cos(rad)) < 1e-15 ? 0 : Math.cos(rad);
        break;
      }
      case 'tan': {
        const rad = this.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
        if (Math.abs(Math.cos(rad)) < 1e-15) {
          throw new Error('Undefined (tan 90°)');
        }
        res = Math.abs(Math.tan(rad)) < 1e-15 ? 0 : Math.tan(rad);
        break;
      }
      case 'ln':
        if (val <= 0) throw new Error('Invalid input for ln');
        res = Math.log(val);
        break;
      case 'log':
        if (val <= 0) throw new Error('Invalid input for log');
        res = Math.log10(val);
        break;
      case 'sqrt':
        if (val < 0) throw new Error('Invalid input (negative sqrt)');
        res = Math.sqrt(val);
        break;
      case 'square':
        res = Math.pow(val, 2);
        break;
      case 'reciprocal':
        if (val === 0) throw new Error('Cannot divide by 0');
        res = 1 / val;
        break;
      case 'fact':
        if (val < 0 || !Number.isInteger(val)) throw new Error('Factorial requires non-negative integer');
        if (val > 170) throw new Error('Overflow');
        res = this.factorial(val);
        break;
      default:
        return;
    }

    this.currentInput = this.formatNumber(res);
    this.isResult = true;
    this.hasDecimal = this.currentInput.includes('.');
  }

  factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  setOperator(opSymbol) {
    if (this.isResult) {
      this.expression = `${this.currentInput} ${opSymbol} `;
      this.isResult = false;
      this.currentInput = '0';
      this.hasDecimal = false;
      return;
    }

    // If an operator was already typed and user hasn't entered a new number yet
    if (this.currentInput === '0' && this.expression.trim().length > 0) {
      const trimmed = this.expression.trim();
      const lastChar = trimmed.slice(-1);
      if (['+', '−', '×', '÷', '^'].includes(lastChar)) {
        this.expression = trimmed.slice(0, -1) + opSymbol + ' ';
        return;
      }
    }

    this.expression += `${this.currentInput} ${opSymbol} `;
    this.currentInput = '0';
    this.hasDecimal = false;
  }

  appendParenthesis(paren) {
    if (paren === '(') {
      if (this.currentInput !== '0' && !this.isResult) {
        this.expression += `${this.currentInput} × ( `;
      } else {
        this.expression += '( ';
      }
      this.currentInput = '0';
    } else if (paren === ')') {
      this.expression += `${this.currentInput} ) `;
      this.currentInput = '0';
    }
    this.hasDecimal = false;
    this.isResult = false;
  }

  compute() {
    let fullExpr = this.expression;
    if (!this.isResult && this.currentInput !== '') {
      fullExpr += `${this.currentInput}`;
    }

    fullExpr = fullExpr.trim();
    if (!fullExpr) return null;

    try {
      const result = this.evaluateExpression(fullExpr);
      const formatted = this.formatNumber(result);

      const record = {
        expression: fullExpr,
        result: formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      this.currentInput = formatted;
      this.expression = '';
      this.isResult = true;
      this.hasDecimal = formatted.includes('.');

      return record;
    } catch (err) {
      this.currentInput = err.message || 'Error';
      this.expression = '';
      this.isResult = true;
      return null;
    }
  }

  /**
   * Helper to evaluate sub-expression safely
   */
  evaluateSimple(expr) {
    try {
      return this.evaluateExpression(expr);
    } catch {
      return NaN;
    }
  }

  /**
   * Safe parser using Shunting-Yard to convert infix notation to RPN and evaluate
   */
  evaluateExpression(expr) {
    // Standardize operator characters
    let clean = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    // Tokenize
    const tokens = this.tokenize(clean);
    if (!tokens || tokens.length === 0) return 0;

    // Convert to RPN (Reverse Polish Notation)
    const rpn = this.shuntingYard(tokens);

    // Evaluate RPN
    return this.evaluateRPN(rpn);
  }

  tokenize(expr) {
    const tokens = [];
    const regex = /\s*([0-9]+\.?[0-9]*|\.?[0-9]+|\+|\-|\*|\/|\^|\(|\))\s*/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(expr)) !== null) {
      if (match.index !== lastIndex) {
        throw new Error('Malformed expression');
      }
      tokens.push(match[1]);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex !== expr.length) {
      throw new Error('Malformed expression');
    }

    return tokens;
  }

  shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '^': 3
    };

    const associativity = {
      '+': 'L',
      '-': 'L',
      '*': 'L',
      '/': 'L',
      '^': 'R'
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Number
      if (!isNaN(parseFloat(token))) {
        outputQueue.push(parseFloat(token));
        continue;
      }

      // Unary minus handling (e.g. at start or after an operator/open parenthesis)
      if (token === '-' && (i === 0 || ['+', '-', '*', '/', '^', '('].includes(tokens[i - 1]))) {
        // Lookahead to negate the next number or sub-expression
        if (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i + 1]))) {
          outputQueue.push(-parseFloat(tokens[i + 1]));
          i++; // skip next number
          continue;
        }
      }

      // Operator
      if (token in precedence) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] in precedence &&
          ((associativity[token] === 'L' && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
            (associativity[token] === 'R' && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
        continue;
      }

      // Left parenthesis
      if (token === '(') {
        operatorStack.push(token);
        continue;
      }

      // Right parenthesis
      if (token === ')') {
        let foundLeftParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop();
          if (top === '(') {
            foundLeftParen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundLeftParen) {
          throw new Error('Mismatched parentheses');
        }
        continue;
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop();
      if (top === '(' || top === ')') {
        throw new Error('Mismatched parentheses');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  evaluateRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
      if (typeof token === 'number') {
        stack.push(token);
      } else {
        if (stack.length < 2) {
          throw new Error('Malformed expression');
        }
        const b = stack.pop();
        const a = stack.pop();

        let res;
        switch (token) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) throw new Error('Cannot divide by 0');
            res = a / b;
            break;
          case '^':
            res = Math.pow(a, b);
            break;
          default:
            throw new Error(`Unknown operator: ${token}`);
        }
        stack.push(res);
      }
    }

    if (stack.length !== 1) {
      throw new Error('Malformed expression');
    }

    const finalVal = stack[0];
    if (!isFinite(finalVal)) {
      throw new Error('Result exceeds limits');
    }

    return finalVal;
  }

  /**
   * Accurate number formatting to avoid floating-point display artifacts (0.1 + 0.2 = 0.3)
   */
  formatNumber(num) {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    // Fix precision up to 12 significant decimals
    const rounded = Math.round((num + Number.EPSILON) * 1e12) / 1e12;
    
    // If number is huge or microscopic, use exponential notation
    if (Math.abs(rounded) >= 1e15 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-7)) {
      return rounded.toExponential(6).replace(/\+/, '');
    }

    return rounded.toString();
  }
}
