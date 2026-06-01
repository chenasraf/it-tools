import { describe, expect, it } from 'vitest'
import { computeTargetDimensions } from './image-resizer.service'

const source = { width: 800, height: 600 }

describe('image-resizer', () => {
  describe('computeTargetDimensions', () => {
    it('stretches to the requested fixed size', () => {
      expect(
        computeTargetDimensions({ mode: 'stretch', source, stretch: { width: 1024, height: 256 } }),
      ).toEqual({
        width: 1024,
        height: 256,
      })
    })

    it('scales by percentage', () => {
      expect(computeTargetDimensions({ mode: 'percentage', source, percentage: 50 })).toEqual({
        width: 400,
        height: 300,
      })
      expect(computeTargetDimensions({ mode: 'percentage', source, percentage: 200 })).toEqual({
        width: 1600,
        height: 1200,
      })
    })

    it('matches width and keeps aspect ratio', () => {
      expect(computeTargetDimensions({ mode: 'width', source, width: 400 })).toEqual({
        width: 400,
        height: 300,
      })
    })

    it('matches height and keeps aspect ratio', () => {
      expect(computeTargetDimensions({ mode: 'height', source, height: 300 })).toEqual({
        width: 400,
        height: 300,
      })
    })

    it('clamps to at least 1 pixel', () => {
      expect(computeTargetDimensions({ mode: 'percentage', source, percentage: 0 })).toEqual({
        width: 1,
        height: 1,
      })
      expect(computeTargetDimensions({ mode: 'width', source, width: 0 })).toEqual({
        width: 1,
        height: 1,
      })
    })
  })
})
