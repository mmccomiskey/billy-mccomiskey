import { describe, test, expect } from 'vitest'
import { truncateAtWord } from './text'

describe('truncateAtWord', () => {
  test('should return the text unchanged when under the limit', () => {
    expect(truncateAtWord('short story', 100)).toBe('short story')
  })

  test('should cut at a word boundary, not mid-word', () => {
    expect(truncateAtWord('the quick brown fox', 12)).toBe('the quick')
  })

  test('should trim trailing whitespace at the cut', () => {
    expect(truncateAtWord('hello world foo', 6)).toBe('hello')
  })

  test('should hard-cut when there is no space within the budget', () => {
    expect(truncateAtWord('supercalifragilistic', 5)).toBe('super')
  })
})
