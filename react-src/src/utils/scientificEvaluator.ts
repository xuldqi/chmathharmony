/**
 * 科学计算器解析与求值算法
 * 移植自 newcal 项目 (FixedScientificCalculator + MathEvaluator + ExpressionParser)
 */

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

export class ScientificEvaluator {
  private pos = -1;
  private expression = '';
  private angleMode: 'deg' | 'rad' = 'deg';
  public divisionByZero = false;
  public syntaxError = false;
  private lastWasPercentage = false;

  constructor(angleMode: 'deg' | 'rad' = 'deg') {
    this.angleMode = angleMode;
  }

  public setAngleMode(mode: 'deg' | 'rad') {
    this.angleMode = mode;
  }

  public getAngleMode(): 'deg' | 'rad' {
    return this.angleMode;
  }

  /**
   * 预处理表达式（隐式乘法、符号替换、补齐括号）
   */
  public preprocess(rawExpr: string, autoCompleteParen = false): string {
    if (!rawExpr) return '';

    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/sin⁻¹/g, 'asin')
      .replace(/cos⁻¹/g, 'acos')
      .replace(/tan⁻¹/g, 'atan')
      .replace(/cot⁻¹/g, 'acot')
      .replace(/√/g, 'sqrt');

    // 自动添加隐式乘号
    let clean = '';
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      const prev = i > 0 ? expr[i - 1] : '';

      // 数字或右括号或常量后紧接 '('
      if (ch === '(' && prev && /[0-9.)eπ!%]/.test(prev)) {
        clean += '*(';
        continue;
      }

      // ')' 后紧接数字、常量或函数
      if (prev === ')' && /[0-9.eπa-zA-Z]/.test(ch)) {
        clean += '*' + ch;
        continue;
      }

      // 数字或 '!' 紧接常量或函数名
      if (/[0-9!%]/.test(prev) && /[eπ]/.test(ch)) {
        clean += '*' + ch;
        continue;
      }

      // 数字紧接函数名 (如 2sin(30))
      if (/[0-9]/.test(prev) && /[a-zA-Z]/.test(ch)) {
        clean += '*' + ch;
        continue;
      }

      clean += ch;
    }

    // 补齐括号
    if (autoCompleteParen) {
      let openCount = 0;
      let closeCount = 0;
      for (const c of clean) {
        if (c === '(') openCount++;
        else if (c === ')') closeCount++;
      }
      if (openCount > closeCount) {
        clean += ')'.repeat(openCount - closeCount);
      }
    }

    return clean;
  }

  /**
   * 计算表达式
   */
  public evaluate(rawExpr: string, autoCompleteParen = false): EvaluationResult {
    if (!rawExpr || rawExpr.trim() === '') {
      return { success: false, error: '空表达式' };
    }

    try {
      const expr = this.preprocess(rawExpr, autoCompleteParen);

      // 连续非法运算符检查
      if (this.hasConsecutiveOperators(expr)) {
        return { success: false, error: '语法错误' };
      }

      this.pos = -1;
      this.expression = expr;
      this.nextChar();
      this.divisionByZero = false;
      this.syntaxError = false;
      this.lastWasPercentage = false;

      const result = this.parseExpression();

      while (this.pos < this.expression.length && this.currentChar() === ' ') {
        this.nextChar();
      }

      if (this.pos < this.expression.length) {
        return { success: false, error: '语法错误' };
      }

      if (!isFinite(result) || isNaN(result)) {
        if (this.divisionByZero) {
          return { success: false, error: '0 不能做除数' };
        }
        return { success: false, error: '计算错误' };
      }

      return {
        success: true,
        value: result,
        formatted: this.formatResult(result),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Division by zero')) {
        return { success: false, error: '0 不能做除数' };
      }
      return { success: false, error: msg || '语法错误' };
    }
  }

  private hasConsecutiveOperators(expr: string): boolean {
    const operatorPattern = /[+\-*\/%^]{2,}/g;
    const matches = expr.match(operatorPattern);
    if (!matches) return false;

    for (const match of matches) {
      if (match.length === 2 && match[1] === '-') {
        const idx = expr.indexOf(match);
        const prevChar = idx > 0 ? expr[idx - 1] : '';
        if (!prevChar || '(+-*/%^'.includes(prevChar)) {
          continue; // 合法负号
        }
      }
      return true;
    }
    return false;
  }

  private nextChar(): void {
    this.pos++;
  }

  private currentChar(): string {
    return this.pos < this.expression.length ? this.expression[this.pos] : '';
  }

  private eat(charToEat: string): boolean {
    while (this.currentChar() === ' ') this.nextChar();
    if (this.currentChar() === charToEat) {
      this.nextChar();
      return true;
    }
    return false;
  }

  private parseExpression(): number {
    let x = this.parseTerm();
    while (true) {
      if (this.eat('+')) {
        const nextTerm = this.parseTerm();
        if (this.lastWasPercentage) {
          x = x + x * nextTerm;
          this.lastWasPercentage = false;
        } else {
          x = x + nextTerm;
        }
      } else if (this.eat('-')) {
        const nextTerm = this.parseTerm();
        if (this.lastWasPercentage) {
          x = x - x * nextTerm;
          this.lastWasPercentage = false;
        } else {
          x = x - nextTerm;
        }
      } else {
        return x;
      }
    }
  }

  private parseTerm(): number {
    let x = this.parseFactor();
    while (true) {
      if (this.eat('*')) {
        const nextFactor = this.parseFactor();
        x = x * nextFactor;
      } else if (this.eat('/')) {
        const divisor = this.parseFactor();
        if (divisor === 0) {
          this.divisionByZero = true;
          throw new Error('Division by zero');
        }
        x = x / divisor;
      } else if (this.eat('%')) {
        x = x / 100;
        this.lastWasPercentage = true;
      } else if (this.eat('^')) {
        const exponent = this.parseFactor();
        x = Math.pow(x, exponent);
      } else if (this.eat('!')) {
        if (!Number.isInteger(x) || x < 0) {
          throw new Error('阶乘需非负整数');
        }
        if (x > 20) {
          throw new Error('阶乘数值过大');
        }
        let fact = 1;
        for (let i = 2; i <= x; i++) fact *= i;
        x = fact;
      } else {
        return x;
      }
    }
  }

  private parseFactor(): number {
    if (this.eat('+')) return this.parseFactor();
    if (this.eat('-')) return -this.parseFactor();

    let x: number;
    const startPos = this.pos;

    if (this.eat('(')) {
      x = this.parseExpression();
      if (!this.eat(')')) {
        throw new Error('缺少右括号');
      }
    } else if (this.isDigit(this.currentChar()) || this.currentChar() === '.') {
      while (this.isDigit(this.currentChar()) || this.currentChar() === '.') {
        this.nextChar();
      }
      const numberString = this.expression.substring(startPos, this.pos);
      const dotCount = (numberString.match(/\./g) || []).length;
      if (dotCount > 1) {
        throw new Error('数字格式错误');
      }
      x = parseFloat(numberString);
      if (isNaN(x)) {
        throw new Error('无效数字');
      }
    } else if (this.isLetter(this.currentChar())) {
      const funcStartPos = this.pos;
      while (this.isLetter(this.currentChar()) || this.isDigit(this.currentChar())) {
        this.nextChar();
      }
      const funcName = this.expression.substring(funcStartPos, this.pos);

      // 常数
      if (funcName === 'π' || funcName === 'pi') {
        x = Math.PI;
      } else if (funcName === 'e' && this.currentChar() !== '(') {
        x = Math.E;
      } else {
        // 函数调用
        if (!this.eat('(')) {
          throw new Error(`函数 ${funcName} 后应有括号`);
        }
        const arg = this.parseExpression();
        if (!this.eat(')')) {
          throw new Error(`函数 ${funcName} 缺少右括号`);
        }

        x = this.evaluateFunction(funcName, arg);
      }
    } else {
      throw new Error(`意料之外的字符: ${this.currentChar()}`);
    }

    return x;
  }

  private evaluateFunction(funcName: string, arg: number): number {
    const isDeg = this.angleMode === 'deg';
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    switch (funcName) {
      case 'sin': {
        const rad = isDeg ? toRadians(arg) : arg;
        const val = Math.sin(rad);
        return Math.abs(val) < 1e-15 ? 0 : val;
      }
      case 'cos': {
        const rad = isDeg ? toRadians(arg) : arg;
        const val = Math.cos(rad);
        return Math.abs(val) < 1e-15 ? 0 : val;
      }
      case 'tan': {
        if (isDeg) {
          const norm = Math.abs(arg % 180);
          if (Math.abs(norm - 90) < 1e-10) {
            throw new Error('tan 90° 无定义');
          }
        }
        const rad = isDeg ? toRadians(arg) : arg;
        return Math.tan(rad);
      }
      case 'cot': {
        const rad = isDeg ? toRadians(arg) : arg;
        const t = Math.tan(rad);
        if (Math.abs(t) < 1e-15) {
          throw new Error('cot 无定义');
        }
        return 1 / t;
      }
      case 'asin': {
        if (arg < -1 || arg > 1) {
          throw new Error('asin 输入需在 [-1, 1]');
        }
        const rad = Math.asin(arg);
        return isDeg ? toDegrees(rad) : rad;
      }
      case 'acos': {
        if (arg < -1 || arg > 1) {
          throw new Error('acos 输入需在 [-1, 1]');
        }
        const rad = Math.acos(arg);
        return isDeg ? toDegrees(rad) : rad;
      }
      case 'atan': {
        const rad = Math.atan(arg);
        return isDeg ? toDegrees(rad) : rad;
      }
      case 'acot': {
        if (arg === 0) {
          const rad = Math.PI / 2;
          return isDeg ? 90 : rad;
        }
        const rad = Math.atan(1 / arg);
        return isDeg ? toDegrees(rad) : rad;
      }
      case 'ln': {
        if (arg <= 0) throw new Error('对数参数须为正数');
        return Math.log(arg);
      }
      case 'lg':
      case 'log': {
        if (arg <= 0) throw new Error('对数参数须为正数');
        return Math.log10(arg);
      }
      case 'sqrt': {
        if (arg < 0) throw new Error('负数无平方根');
        return Math.sqrt(arg);
      }
      case 'abs':
        return Math.abs(arg);
      default:
        throw new Error(`未知函数: ${funcName}`);
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isLetter(char: string): boolean {
    return (
      (char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      char === 'π' ||
      char === '√'
    );
  }

  /**
   * 高精度结果格式化（与 newcal MathEvaluator 一致）
   */
  public formatResult(result: number): string {
    if (isNaN(result)) return '非数值';
    if (!isFinite(result)) return result > 0 ? '无穷大' : '负无穷大';

    // 检查是否非常接近整数 (消除浮点精度抖动如 0.1 + 0.2)
    if (Math.abs(result - Math.round(result)) < 1e-10) {
      return Math.round(result).toString();
    }

    // 很大或极小数值使用科学计数法
    if (Math.abs(result) > 1e11 || (Math.abs(result) < 1e-6 && result !== 0)) {
      return parseFloat(result.toPrecision(8)).toExponential();
    }

    // 最多保留 10 位有效数字，去除末尾无意义 0
    const formatted = parseFloat(result.toPrecision(10));
    return formatted.toString();
  }
}

/**
 * 判断计算结果是否为“约等于”（长小数、无理数、无限循环小数等）
 * - 整数或小数位数 <= 3 的有限小数判定为精确值（“等于”）
 * - 小数位数 > 3 的判定为近似值（“约等于”），语音报数时建议截断简化
 */
export function isApproximateResult(val: number): boolean {
  if (!Number.isFinite(val) || Number.isNaN(val)) return false;
  // 浮点抖动消除：非常接近整数的算作整数精确值
  if (Math.abs(val - Math.round(val)) < 1e-9) return false;
  // 最多 3 位小数的有限小数（如 0.5, 0.25, 0.125, 1.2, 3.45）属于精确可整读小数
  const times1000 = val * 1000;
  if (Math.abs(times1000 - Math.round(times1000)) < 1e-6) {
    return false;
  }
  return true;
}

/**
 * 近似数值播报简化（最多保留 4 位有效小数，并剔除末尾多余 0）
 */
export function simplifyApproxNumber(val: number): number {
  return parseFloat(val.toFixed(4));
}
