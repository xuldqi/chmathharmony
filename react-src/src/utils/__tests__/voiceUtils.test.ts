import { describe, expect, it } from 'vitest';
import {
  evaluateMathExpression,
  isValidMathExpression,
  processVoiceMathExpression,
} from '../voiceUtils';

describe('processVoiceMathExpression', () => {
  it('normalizes common Chinese math query', () => {
    expect(processVoiceMathExpression('三加五等于多少')).toBe('3+5=');
    expect(processVoiceMathExpression('八除以二')).toBe('8/2');
    expect(processVoiceMathExpression('八百五加一')).toBe('850+1');
    expect(processVoiceMathExpression('一万三加一')).toBe('13000+1');
    expect(processVoiceMathExpression('一万零三加一')).toBe('10003+1');
  });

  it('normalizes English number words and operators', () => {
    expect(processVoiceMathExpression('three plus five')).toBe('3+5');
    expect(processVoiceMathExpression('nine minus two')).toBe('9-2');
  });
});

describe('isValidMathExpression', () => {
  it('accepts valid expressions', () => {
    expect(isValidMathExpression('3+5*2')).toBe(true);
    expect(isValidMathExpression('(8/2)+1')).toBe(true);
    expect(isValidMathExpression('3+5=')).toBe(true);
  });

  it('rejects malformed expressions', () => {
    expect(isValidMathExpression('3++2')).toBe(false);
    expect(isValidMathExpression('3+')).toBe(false);
    expect(isValidMathExpression('abc')).toBe(false);
  });
});

describe('evaluateMathExpression', () => {
  it('evaluates valid expressions', () => {
    expect(evaluateMathExpression('3+5*2')).toBe(13);
    expect(evaluateMathExpression('(8/2)+1')).toBe(5);
    expect(evaluateMathExpression('3+5=')).toBe(8);
  });

  it('returns null on invalid expressions', () => {
    expect(evaluateMathExpression('3++2')).toBeNull();
    expect(evaluateMathExpression('abc')).toBeNull();
  });
});
