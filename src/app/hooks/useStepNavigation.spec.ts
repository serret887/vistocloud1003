import { test, expect } from '@playwright/test'
import { isStepEnabledPure, getNextPure, getPrevPure } from './useStepNavigation'

test('useStepNavigation enforces gating and supports next/prev', async () => {
  const defs: any = [
    { id: 'client-info' },
    { id: 'employment' },
    { id: 'income' },
  ]
  const states: any = [
    { id: 'client-info', completionPercentage: 100 },
    { id: 'employment', completionPercentage: 0 },
    { id: 'income', completionPercentage: 0 },
  ]
  expect(isStepEnabledPure(defs, states, 'client-info')).toBe(true)
  expect(isStepEnabledPure(defs, states, 'employment')).toBe(true)
  expect(isStepEnabledPure(defs, states, 'income')).toBe(false)
  expect(getNextPure(defs, states, 'client-info')).toBe('employment')
  expect(getPrevPure(defs, states, 'client-info')).toBeUndefined()
})
