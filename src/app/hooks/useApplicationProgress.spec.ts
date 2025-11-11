import { test, expect } from '@playwright/test'
import { computeProgress } from './useApplicationProgress'

const defs = [
  { id: 'client-info', title: '', description: '', estimatedTime: '', fields: [] },
  { id: 'employment', title: '', description: '', estimatedTime: '', fields: [] },
] as any

test('useApplicationProgress computes per-step and overall', async () => {
  const states = [
    { id: 'client-info', status: 'completed', completionPercentage: 100, errorCount: 0 },
    { id: 'employment', status: 'current', completionPercentage: 50, errorCount: 0 },
  ] as any
  const result = computeProgress(defs, states)
  expect(result.perStep['client-info']).toBe(100)
  expect(result.perStep['employment']).toBe(50)
  expect(result.overallPercentage).toBe(75)
})
