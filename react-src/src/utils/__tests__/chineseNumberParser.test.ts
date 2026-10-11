import { describe, it, expect } from 'vitest'
import { 
  parseChineseNumber, 
  extractChineseNumbers, 
  extractOperator, 
  hasEqualsExpression 
} from '../chineseNumberParser'

describe('parseChineseNumber', () => {
  it('should parse basic single digits', () => {
    expect(parseChineseNumber('一')).toBe(1)
    expect(parseChineseNumber('二')).toBe(2)
    expect(parseChineseNumber('三')).toBe(3)
    expect(parseChineseNumber('九')).toBe(9)
    expect(parseChineseNumber('零')).toBe(0)
  })

  it('should parse tens', () => {
    expect(parseChineseNumber('十')).toBe(10)
    expect(parseChineseNumber('十五')).toBe(15)
    expect(parseChineseNumber('二十')).toBe(20)
    expect(parseChineseNumber('二十三')).toBe(23)
    expect(parseChineseNumber('九十九')).toBe(99)
  })

  it('should parse hundreds', () => {
    expect(parseChineseNumber('一百')).toBe(100)
    expect(parseChineseNumber('二百五十')).toBe(250)
    expect(parseChineseNumber('三百六十五')).toBe(365)
    expect(parseChineseNumber('九百九十九')).toBe(999)
  })

  it('should parse thousands', () => {
    expect(parseChineseNumber('一千')).toBe(1000)
    expect(parseChineseNumber('二千五百')).toBe(2500)
    expect(parseChineseNumber('九千九百九十九')).toBe(9999)
  })

  it('should parse ten thousands', () => {
    expect(parseChineseNumber('一万')).toBe(10000)
    expect(parseChineseNumber('二万五千')).toBe(25000)
  })

  it('should handle invalid input', () => {
    expect(parseChineseNumber('')).toBe(null)
    expect(parseChineseNumber('hello')).toBe(null)
    expect(parseChineseNumber('abc')).toBe(null)
  })
})

describe('extractChineseNumbers', () => {
  it('should extract Chinese numbers from text', () => {
    expect(extractChineseNumbers('三加五')).toEqual([3, 5])
    expect(extractChineseNumbers('二十乘以十五')).toEqual([20, 15])
    expect(extractChineseNumbers('一百减去五十')).toEqual([100, 50])
  })

  it('should extract Arabic numbers from text', () => {
    expect(extractChineseNumbers('3加5')).toEqual([3, 5])
    expect(extractChineseNumbers('20乘以15')).toEqual([20, 15])
    expect(extractChineseNumbers('100减去50')).toEqual([100, 50])
  })

  it('should extract mixed numbers from text', () => {
    expect(extractChineseNumbers('三加5')).toEqual([3, 5])
    expect(extractChineseNumbers('20乘以十五')).toEqual([20, 15])
  })

  it('should return empty array for text with no numbers', () => {
    expect(extractChineseNumbers('加法运算')).toEqual([])
    expect(extractChineseNumbers('hello world')).toEqual([])
  })
})

describe('extractOperator', () => {
  it('should extract addition operators', () => {
    expect(extractOperator('三加五')).toBe('+')
    expect(extractOperator('二十加上十')).toBe('+')
    expect(extractOperator('一百加法运算')).toBe('+')
  })

  it('should extract subtraction operators', () => {
    expect(extractOperator('五减三')).toBe('-')
    expect(extractOperator('二十减去十')).toBe('-')
    expect(extractOperator('一百减法运算')).toBe('-')
  })

  it('should extract multiplication operators', () => {
    expect(extractOperator('三乘五')).toBe('×')
    expect(extractOperator('二十乘以十')).toBe('×')
    expect(extractOperator('一百乘法运算')).toBe('×')
  })

  it('should extract division operators', () => {
    expect(extractOperator('十除五')).toBe('÷')
    expect(extractOperator('二十除以十')).toBe('÷')
    expect(extractOperator('一百除法运算')).toBe('÷')
  })

  it('should return null for text with no operators', () => {
    expect(extractOperator('三五八')).toBe(null)
    expect(extractOperator('hello world')).toBe(null)
  })
})

describe('hasEqualsExpression', () => {
  it('should detect equals expressions', () => {
    expect(hasEqualsExpression('三加五等于几')).toBe(true)
    expect(hasEqualsExpression('二十乘以十等于多少')).toBe(true)
    expect(hasEqualsExpression('一百减去五十是多少')).toBe(true)
    expect(hasEqualsExpression('五除以五是几')).toBe(true)
  })

  it('should return false for text without equals expressions', () => {
    expect(hasEqualsExpression('三加五')).toBe(false)
    expect(hasEqualsExpression('二十乘以十')).toBe(false)
    expect(hasEqualsExpression('hello world')).toBe(false)
  })
})