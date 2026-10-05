import { expect, test } from 'claude-code/testing'
import { COURSES } from './lessons'

test('every lesson has enough words for 4 options', () => {
  for (const lessons of Object.values(COURSES)) {
    expect(lessons.flatMap(l => l.words).length).toBeGreaterThanOrEqual(4)
  }
})
