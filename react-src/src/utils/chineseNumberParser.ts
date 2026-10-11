/**
 * 中文数字解析工具
 * 支持将中文数字转换为阿拉伯数字
 */

// 基础数字映射
const basicNumbers: { [key: string]: number } = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
  '十': 10
};

// 单位映射
const units: { [key: string]: number } = {
  '十': 10,
  '百': 100,
  '千': 1000,
  '万': 10000
};

/**
 * 将中文数字转换为阿拉伯数字
 * @param chineseNumber 中文数字字符串
 * @returns 转换后的数字，如果无法转换则返回null
 */
export function parseChineseNumber(chineseNumber: string): number | null {
  if (!chineseNumber) return null;
  const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);
  
  // 处理简单的单个数字
  if (hasOwn(basicNumbers, chineseNumber)) {
    return basicNumbers[chineseNumber];
  }
  
  // 处理复合数字（如：二十三、一百五十等）
  let result = 0;
  let current = 0;
  
  for (let i = 0; i < chineseNumber.length; i++) {
    const char = chineseNumber[i];
    
    if (hasOwn(basicNumbers, char) && char !== '十') {
      current = basicNumbers[char];
    } else if (hasOwn(units, char)) {
      const unit = units[char];
      
      if (char === '十' && i === 0) {
        // 处理"十"开头的情况（如：十五）
        current = 1;
      }
      
      if (unit === 10) {
        result += current * unit;
        current = 0;
      } else if (unit >= 100) {
        result += current * unit;
        current = 0;
      }
    }
  }
  
  result += current;
  return result > 0 ? result : null;
}

/**
 * 从文本中提取所有中文数字
 * @param text 输入文本
 * @returns 提取到的数字数组
 */
export function extractChineseNumbers(text: string): number[] {
  const numbers: { value: number, index: number }[] = [];
  
  // 查找中文数字
  const chineseNumberRegex = /[零一二三四五六七八九十百千万]+/g;
  let match;
  while ((match = chineseNumberRegex.exec(text)) !== null) {
    const num = parseChineseNumber(match[0]);
    if (num !== null) {
      numbers.push({ value: num, index: match.index });
    }
  }
  
  // 查找阿拉伯数字
  const arabicNumberRegex = /\d+/g;
  while ((match = arabicNumberRegex.exec(text)) !== null) {
    numbers.push({ value: parseInt(match[0], 10), index: match.index });
  }
  
  // 按照在文本中出现的位置排序
  numbers.sort((a, b) => a.index - b.index);
  
  return numbers.map(n => n.value);
}

/**
 * 识别运算符
 * @param text 输入文本
 * @returns 运算符字符串，如果没有找到则返回null
 */
export function extractOperator(text: string): string | null {
  const operatorMap: { [key: string]: string } = {
    '加': '+',
    '加上': '+',
    '加法': '+',
    '减': '-',
    '减去': '-',
    '减法': '-',
    '乘': '×',
    '乘以': '×',
    '乘法': '×',
    '除': '÷',
    '除以': '÷',
    '除法': '÷'
  };
  
  for (const [key, value] of Object.entries(operatorMap)) {
    if (text.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * 检查文本是否包含等于的表达
 * @param text 输入文本
 * @returns 是否包含等于表达
 */
export function hasEqualsExpression(text: string): boolean {
  const equalsExpressions = ['等于', '等于几', '等于多少', '是多少', '是几'];
  return equalsExpressions.some(expr => text.includes(expr));
}
