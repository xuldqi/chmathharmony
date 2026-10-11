/**
 * 数学表达式解析器
 * 用于解析自然语言数学表达式并执行计算
 */

import { extractChineseNumbers, extractOperator, hasEqualsExpression } from './chineseNumberParser';

export interface MathExpression {
  operand1: number;
  operator: string;
  operand2: number;
  hasEquals: boolean;
}

/**
 * 解析自然语言数学表达式
 * @param text 输入的自然语言文本
 * @returns 解析后的数学表达式对象，如果无法解析则返回null
 */
export function parseMathExpression(text: string): MathExpression | null {
  // 提取数字
  const numbers = extractChineseNumbers(text);
  
  // 提取运算符
  const operator = extractOperator(text);
  
  // 检查是否有等于表达
  const hasEquals = hasEqualsExpression(text);
  
  // 验证是否有足够的信息构成一个完整的表达式
  if (numbers.length >= 2 && operator) {
    return {
      operand1: numbers[0],
      operator: operator,
      operand2: numbers[1],
      hasEquals: hasEquals
    };
  }
  
  return null;
}

/**
 * 执行数学计算
 * @param expression 数学表达式对象
 * @returns 计算结果
 */
export function calculateExpression(expression: MathExpression): number | null {
  const { operand1, operator, operand2 } = expression;
  
  switch (operator) {
    case '+':
      return operand1 + operand2;
    case '-':
      return operand1 - operand2;
    case '×':
      return operand1 * operand2;
    case '÷':
      if (operand2 === 0) {
        return null; // 除零错误
      }
      return operand1 / operand2;
    default:
      return null;
  }
}

/**
 * 处理完整的语音数学表达式
 * @param text 语音识别的文本
 * @returns 包含表达式和结果的对象，如果无法处理则返回null
 */
export function processVoiceMathExpression(text: string): {
  expression: MathExpression;
  result: number;
  steps: string[];
} | null {
  const expression = parseMathExpression(text);
  
  if (!expression) {
    return null;
  }
  
  const result = calculateExpression(expression);
  
  if (result === null) {
    return null;
  }
  
  // 生成计算步骤
  const steps = [
    `识别到: ${expression.operand1} ${expression.operator} ${expression.operand2}`,
    `计算结果: ${result}`
  ];
  
  return {
    expression,
    result,
    steps
  };
}

/**
 * 检查文本是否是数学表达式
 * @param text 输入文本
 * @returns 是否是数学表达式
 */
export function isMathExpression(text: string): boolean {
  const numbers = extractChineseNumbers(text);
  const operator = extractOperator(text);
  const hasEquals = hasEqualsExpression(text);
  
  // 至少需要两个数字、一个运算符，或者包含等于表达
  return (numbers.length >= 2 && operator !== null) || hasEquals;
}