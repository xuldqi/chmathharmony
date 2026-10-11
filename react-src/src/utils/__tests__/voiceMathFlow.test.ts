import { describe, expect, it } from 'vitest';
import {
  evaluateMathExpression,
  isValidMathExpression,
  processVoiceMathExpression,
} from '../voiceUtils';

type ValidCase = {
  input: string;
  normalized: string;
  result: number;
};

type InvalidCase = {
  input: string;
};

const validCases: ValidCase[] = [
  { input: '三加五', normalized: '3+5', result: 8 },
  { input: '二十加三', normalized: '20+3', result: 23 },
  { input: '一百二十三加四', normalized: '123+4', result: 127 },
  { input: '十减三', normalized: '10-3', result: 7 },
  { input: '五十减二十', normalized: '50-20', result: 30 },
  { input: '七乘八', normalized: '7*8', result: 56 },
  { input: '九乘以六', normalized: '9*6', result: 54 },
  { input: '八除二', normalized: '8/2', result: 4 },
  { input: '八除以二', normalized: '8/2', result: 4 },
  { input: '三点五加二', normalized: '3.5+2', result: 5.5 },
  { input: '三加三等于', normalized: '3+3=', result: 6 },
  { input: '三加三等于几', normalized: '3+3=', result: 6 },
  { input: '三加三等于七', normalized: '3+3=', result: 6 },
  { input: '三加五等于多少', normalized: '3+5=', result: 8 },
  { input: '十二加二十三', normalized: '12+23', result: 35 },
  { input: '两百加三十', normalized: '200+30', result: 230 },
  { input: '一千减九百九十九', normalized: '1000-999', result: 1 },
  { input: '一万减一', normalized: '10000-1', result: 9999 },
  { input: '八百五十五加一', normalized: '855+1', result: 856 },
  { input: '八百五是五加一', normalized: '855+1', result: 856 },
  { input: '八百五加一', normalized: '850+1', result: 851 },
  { input: '一千二减三百', normalized: '1200-300', result: 900 },
  { input: '一万三加一', normalized: '13000+1', result: 13001 },
  { input: '一万零三加一', normalized: '10003+1', result: 10004 },
  { input: '一万零三十加一', normalized: '10030+1', result: 10031 },
  { input: '一万零三十加亿', normalized: '10030+1', result: 10031 },
  { input: '五亿加一', normalized: '500000000+1', result: 500000001 },
  { input: '五 亿 加 一', normalized: '500000000+1', result: 500000001 },
  { input: '零三十加一', normalized: '30+1', result: 31 },
  { input: '亿百加亿百', normalized: '100+100', result: 200 },
  { input: '亿 百 加 亿 百', normalized: '100+100', result: 200 },
  { input: '一一加二', normalized: '11+2', result: 13 },
  { input: 'three plus five', normalized: '3+5', result: 8 },
  { input: 'nine minus two', normalized: '9-2', result: 7 },
  { input: 'six divided by three', normalized: '6/3', result: 2 },
  { input: 'two times eight', normalized: '2*8', result: 16 },
  { input: '8 plus 9 equals', normalized: '8+9=', result: 17 },
  { input: 'one point five plus two', normalized: '1.5+2', result: 3.5 },
  { input: '10 multiply 6', normalized: '10*6', result: 60 },
  { input: '25 divide 5', normalized: '25/5', result: 5 },
];

const invalidCases: InvalidCase[] = [
  { input: '今天是星期三' },
  { input: '清空' },
  { input: '删除' },
  { input: '三加' },
  { input: '++' },
  { input: 'hello world' },
];

describe('voice math flow dataset', () => {
  it('normalizes and evaluates valid utterances correctly', () => {
    validCases.forEach((item) => {
      const normalized = processVoiceMathExpression(item.input);
      expect(normalized, `normalized failed: ${item.input}`).toBe(item.normalized);
      expect(isValidMathExpression(normalized), `invalid expression: ${item.input}`).toBe(true);
      expect(evaluateMathExpression(normalized), `evaluation failed: ${item.input}`).toBe(item.result);
    });
  });

  it('rejects invalid utterances safely', () => {
    invalidCases.forEach((item) => {
      const normalized = processVoiceMathExpression(item.input);
      expect(isValidMathExpression(normalized), `should be invalid: ${item.input}`).toBe(false);
      expect(evaluateMathExpression(normalized), `should not evaluate: ${item.input}`).toBeNull();
    });
  });
});
