import { describe, test, expect } from 'vitest'
import { matchesQuery } from './search'
import type { Tune } from './types'

const tune: Tune = {
  id: 'the-diamond',
  title: 'The Diamond',
  rhythm: 'waltz',
  key: 'D',
  narrative: 'A waltz written for family in the Carpathian Mountains.',
  credits: { composer: 'Billy McComiskey' },
  archivalMetadata: {
    sourceCollection: 'Archive',
    rightsHolder: 'Billy McComiskey',
    recordingDate: '2020',
  },
  abcNotation: 'X:1',
  notationSource: 'thesession',
}

describe('matchesQuery', () => {
  test('should match everything when the query is empty', () => {
    expect(matchesQuery(tune, '')).toBe(true)
  })

  test('should match on the title, case-insensitively', () => {
    expect(matchesQuery(tune, 'diamond')).toBe(true)
    expect(matchesQuery(tune, 'DIAMOND')).toBe(true)
  })

  test('should match on the rhythm', () => {
    expect(matchesQuery(tune, 'waltz')).toBe(true)
  })

  test('should match within the narrative', () => {
    expect(matchesQuery(tune, 'Carpathian')).toBe(true)
  })

  test('should not match unrelated text', () => {
    expect(matchesQuery(tune, 'hornpipe')).toBe(false)
  })
})
