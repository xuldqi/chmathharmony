import chinese2num from 'chinese2num';

// 语音识别结果处理工具

/**
 * 检查文本是否为纯数学表达式（已含数字、加减乘除等）
 */
export function isMathExpression(text: string): boolean {
  const cleanText = text.replace(/\s+/g, '');
  const mathPattern = new RegExp('^[0-9+\\-*/().=\\s]+$');
  const hasNumber = /\d/.test(cleanText);
  const hasOperator = /[+\-*/=]/.test(cleanText);
  return mathPattern.test(cleanText) && hasNumber && hasOperator;
}

/**
 * 检查文本是否可能为语音数学输入（含中文数字、运算符或英文 plus/minus 等）
 */
export function couldBeMathVoiceInput(text: string): boolean {
  if (!text || text.length < 2) return false;
  const t = text.toLowerCase();
  const hasChinese = /[零一二三四五六七八九十百加减乘除等于点]/.test(t);
  const hasEnglish = /\b(plus|add|minus|subtract|times|multiply|divide|divided by|equals|equal|point|zero|one|two|three|four|five|six|seven|eight|nine)\b/i.test(t);
  const hasDigits = /\d/.test(t);
  return hasChinese || hasEnglish || hasDigits;
}

/**
 * 将文本中的中文数字（如 "三千零五十" 或 "一一"）转换为阿拉伯数字
 */
function chineseToNumberStr(text: string): string {
  // 加入 0-9 和空格，避免像 "8 百 8 十 8" 被中间的数字或空格断开
  const cnNumChars = '零林另一幺依二两俩儿三仨山善伞四是事士式世市师寺五我无屋武舞六陆料乐榴溜流七亲鸡夕欹漆期齐骑其八班发吧拔把爸巴九近教酒旧就救舅久十百千万亿0123456789\\s';
  const regex = new RegExp(`[${cnNumChars}]+`, 'g');

  const chnNumChar: { [key: string]: number } = {
    '零': 0, '林': 0, '另': 0,
    '一': 1, '幺': 1, '依': 1,
    '二': 2, '两': 2, '俩': 2, '儿': 2,
    '三': 3, '仨': 3, '山': 3, '善': 3, '伞': 3,
    '四': 4, '是': 4, '事': 4, '士': 4, '式': 4, '世': 4, '市': 4, '师': 4, '寺': 4,
    '五': 5, '我': 5, '无': 5, '屋': 5, '武': 5, '舞': 5,
    '六': 6, '陆': 6, '料': 6, '乐': 6, '榴': 6, '溜': 6, '流': 6,
    '七': 7, '亲': 7, '鸡': 7, '夕': 7, '欹': 7, '漆': 7, '期': 7, '齐': 7, '骑': 7, '其': 7,
    '八': 8, '班': 8, '发': 8, '吧': 8, '拔': 8, '把': 8, '爸': 8, '巴': 8,
    '九': 9, '近': 9, '教': 9, '酒': 9, '旧': 9, '就': 9, '救': 9, '舅': 9, '久': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };
  const chnNameValue: { [key: string]: { value: number, secUnit: boolean } } = {
    '十': { value: 10, secUnit: false },
    '百': { value: 100, secUnit: false },
    '千': { value: 1000, secUnit: false },
    '万': { value: 10000, secUnit: true },
    '亿': { value: 100000000, secUnit: true }
  };

  function ChineseToNumber(chnStr: string): string {
    const cleanStr = chnStr.replace(/\s+/g, '');
    if (!cleanStr) return '';

    let rtn = 0;
    let section = 0;
    let number = 0;
    let secUnit = false;
    let lastUnitValue = 1;
    let lastUnitIndex = -1;
    const zeroLikeChars = new Set(['零', '林', '另', '0']);
    const str = cleanStr.split('');

    // 如果纯粹是连写的数字（如 "一一"，"33"），直接按字面数字拼接
    const hasUnit = str.some(char => chnNameValue[char] !== undefined);
    if (!hasUnit && str.length > 1) {
      return str.map(char => chnNumChar[char] !== undefined ? chnNumChar[char].toString() : '').join('');
    }

    const isColloquialUnitOmission = (() => {
      if (/[零林另0]/.test(cleanStr)) return false;
      const unitIndexes: number[] = [];
      for (let i = 0; i < str.length; i++) {
        if (chnNameValue[str[i]] !== undefined) unitIndexes.push(i);
      }
      if (unitIndexes.length === 0) return false;
      const lastUnitIndex = unitIndexes[unitIndexes.length - 1];
      const tail = str.slice(lastUnitIndex + 1);
      if (tail.length !== 1) return false;
      const tailNum = chnNumChar[tail[0]];
      return typeof tailNum !== 'undefined';
    })();

    if (!isColloquialUnitOmission) {
      try {
        const normalized = str
          .map((char) => {
            if (chnNameValue[char] !== undefined) return char;
            if (chnNumChar[char] !== undefined) return String(chnNumChar[char]);
            return char;
          })
          .join('');
        const parsed = chinese2num(normalized);
        if (typeof parsed === 'number' && Number.isFinite(parsed)) {
          return String(parsed);
        }
      } catch {
        // ignore, fallback to custom parser below
      }
    }

    if (str[0] === '十') {
      str.unshift('一');
    }

    for (let i = 0; i < str.length; i++) {
      const num = chnNumChar[str[i]];
      if (typeof num !== 'undefined') {
        number = num;
        if (i === str.length - 1) {
          section += number;
        }
      } else {
        const unitDef = chnNameValue[str[i]];
        const unit = unitDef ? unitDef.value : 1;
        secUnit = unitDef ? unitDef.secUnit : false;
        lastUnitValue = unit;
        lastUnitIndex = i;

        if (secUnit) {
          section = (section + number) * unit;
          rtn += section;
          section = 0;
        } else {
          section += (number * unit);
        }
        number = 0;
      }
    }

    // 口语省略位补全：
    // 例如「八百五」应按「八百五十」解析，「一千二」应按「一千二百」解析。
    // 若尾段带有零（如「一百零五」），则不补全。
    let total = rtn + section;
    if (lastUnitIndex >= 0) {
      const tailChars = str.slice(lastUnitIndex + 1);
      const hasTrailingSingleDigit =
        tailChars.length === 1 && typeof chnNumChar[tailChars[0]] !== 'undefined';
      const hasZeroMarker = tailChars.some((char) => zeroLikeChars.has(char));
      const hasExplicitLowerUnit = tailChars.some((char) => typeof chnNameValue[char] !== 'undefined');
      const impliedUnit = lastUnitValue >= 10 ? Math.floor(lastUnitValue / 10) : 1;

      if (hasTrailingSingleDigit && !hasZeroMarker && !hasExplicitLowerUnit && impliedUnit > 1) {
        const trailingNum = chnNumChar[tailChars[0]];
        total += trailingNum * (impliedUnit - 1);
      }
    }

    return total.toString();
  }

  return text.replace(regex, (match) => {
    // 只有当匹配项包含有效字符时才处理
    if (/[零一二三四五六七八九十百千万亿]/.test(match) || /\d/.test(match)) {
      return ChineseToNumber(match);
    }
    return match;
  });
}

/**
 * 处理语音识别的数学表达式
 * 后处理：简单规则替换（plus→+、乘以→* 等），支持中英双语
 * 容错：若识别成「二加三」等，通过映射转为 2+3
 * @param text 语音识别的文本
 * @returns 处理后的数学表达式（如 "3+2*4"）
 */
export function processVoiceMathExpression(text: string): string {
  if (!text) return '';

  let processed = text.toLowerCase().trim();
  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const replaceAllLiteral = (source: string, find: string, replacement: string) =>
    source.split(find).join(replacement);

  // 查询语境纠偏：Vosk 常把“几”识别成“其/期/齐/骑/鸡/七”
  // 例如“等于几”->“等于七”，这里统一还原成“等于几”
  processed = processed.replace(/(等于|是)\s*(其|期|齐|骑|鸡|七)/g, '$1几');
  // 数字语境纠偏：常见把“十”识别成“是/事/时”，例如“八百五是五”->“八百五十五”
  processed = processed.replace(/([零一二三四五六七八九两0-9])(是|事|时)([零一二三四五六七八九两0-9])/g, '$1十$3');
  // 数字语境纠偏：常见把“一百/一千/一十”误识别成“亿百/亿千/亿十”
  // 例如“亿百加亿百”应纠正为“一百加一百”
  processed = processed.replace(/(^|[+\-*/=(\s加减乘除])亿\s*(?=(百|千|十))/g, '$1一');
  // 数字语境纠偏：常见把“加一/减一”误识别成“加亿/减亿”
  // 仅在“运算符后紧跟的独立亿”时替换为“一”，避免把“5 亿 + 1”误改成“51+1”
  processed = processed.replace(/(^|[+\-*/=(加减乘除])\s*亿(?=\s*($|[+\-*/=)加减乘除]))/g, '$1一');

  // 把语音里的中文数字先转换为阿拉伯数字
  processed = chineseToNumberStr(processed);

  // 有些输入在数字转换后会丢空格（如 "8 plus 9" -> "8plus9"），这里补回数字/英文词的分隔
  processed = processed
    .replace(/([0-9])([a-z])/gi, '$1 $2')
    .replace(/([a-z])([0-9])/gi, '$1 $2');

  // 英文数字词先转成数字
  const englishNumberWords: { [key: string]: string } = {
    zero: '0', oh: '0',
    one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9',
  };
  const numberWordKeys = Object.keys(englishNumberWords).sort((a, b) => b.length - a.length);
  numberWordKeys.forEach((word) => {
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    processed = processed.replace(pattern, englishNumberWords[word]);
  });

  // 中文运算符（包含常见同音字容错，以及功能型指令）
  const chineseOperators: { [key: string]: string } = {
    '加上': '+', '加号': '+', '加': '+', '家': '+', '佳': '+', '甲': '+', '夹': '+', '僵': '+', '将': '+',
    '减去': '-', '减号': '-', '减': '-', '负': '-', '简': '-', '检': '-', '卷': '-', '件': '-', '辑': '-',
    '乘以': '*', '乘号': '*', '乘': '*', '叉': '*', '成': '*', '城': '*', '诚': '*', '称': '*', '倍': '*', '层': '*',
    '除以': '/', '除号': '/', '除': '/', '分之': '/', '出': '/', '处': '/', '初': '/', '楚': '/', '区': '/',
    '等于几': '=', '等于多少': '=', '等于': '=', '是几': '=', '是多少': '=', '等': '=', '计算': '=', '多少': '=',
    '括弧': '(', '括号': '(', '括回': ')',
    '点': '.', '块': '.',
    '清空': 'clear', '清除': 'clear', '清零': 'clear', '清屏': 'clear',
    '删掉': 'delete', '删除': 'delete', '回退': 'delete', '退格': 'delete'
  };

  // 英文运算符
  const englishOperators: { [key: string]: string } = {
    'plus': '+', 'add': '+',
    'minus': '-', 'subtract': '-', 'negative': '-',
    'multiplied by': '*', 'times': '*', 'multiply': '*', 'x': '*',
    'divided by': '/', 'divide': '/', 'over': '/',
    'equals': '=', 'equal': '=',
    'point': '.',
    'clear': 'clear', 'reset': 'clear',
    'delete': 'delete', 'backspace': 'delete'
  };

  // 替换运算符（按长度降序，先匹配「加上」再匹配「加」）
  const cnOpsKeys = Object.keys(chineseOperators).sort((a, b) => b.length - a.length);
  cnOpsKeys.forEach((chinese) => {
    processed = replaceAllLiteral(processed, chinese, ` ${chineseOperators[chinese]} `);
  });

  const enOpsKeys = Object.keys(englishOperators).sort((a, b) => b.length - a.length);
  enOpsKeys.forEach((english) => {
    const pattern = new RegExp(`\\b${escapeRegex(english)}\\b`, 'gi');
    processed = processed.replace(pattern, ` ${englishOperators[english]} `);
  });

  // 清理多余空格
  processed = processed.replace(/\s+/g, '');

  // 把连续的重复运算符折叠成一个
  processed = processed.replace(/([+\-*/=.])\1+/g, '$1');
  // 如果出现 "+-" 等不同符号连用，保留最后一个
  processed = processed.replace(/[+\-*/=]{2,}/g, (match) => match[match.length - 1]);

  return processed;
}

/**
 * 安全计算数学表达式（仅支持 + - * / 和括号）
 * @param expr 如 "3+2*4"、"6/2"、"3+2=5"（= 后忽略）
 * @returns 计算结果或 null
 */
export function evaluateMathExpression(expr: string): number | null {
  try {
    // 若有 =，只取左侧表达式计算（如 "3+2=5" -> eval "3+2"）
    const toEval = expr.split('=')[0].trim();
    if (!isValidMathExpression(toEval)) return null;
    const result = new Function(`return (${toEval})`)();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * 验证数学表达式是否有效
 */
export function isValidMathExpression(expression: string): boolean {
  try {
    const left = expression.split('=')[0].trim();
    if (!left) return false;
    if (/[^0-9+\-*/.()]/.test(left)) return false;
    if (!/\d/.test(left)) return false;
    if (/^[+*/.]/.test(left)) return false;
    if (/[+\-*/.]$/.test(left)) return false;

    // 检查括号是否匹配
    let parenthesesCount = 0;
    for (const char of left) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) return false;
    }
    if (parenthesesCount !== 0) return false;

    // 语法层面的最终校验，拦截如 "3++2"、"1..2"、"2/*3"
    const result = new Function(`return (${left})`)();
    return typeof result === 'number' && isFinite(result);
  } catch {
    return false;
  }
}
