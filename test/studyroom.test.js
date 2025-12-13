import { describe, it, expect } from 'vitest'
import { filterStudyRooms } from '../src/controllers/studyrooms_controller.js'
import { studyRooms } from '../src/db/data.js'

describe('Study room filtering', () => {
  it('filters by availability', () => {
    const result = filterStudyRooms(studyRooms, { available: true })
    expect(result.length).toBe(2)
    expect(result.every(r => r.available)).toBe(true)
  })

  it('filters by minimum capacity', () => {
    const result = filterStudyRooms(studyRooms, { minCapacity: 5 })
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Study Room B')
  })
})
