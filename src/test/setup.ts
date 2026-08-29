import '@testing-library/jest-dom/vitest'
import '@/shared/i18n'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
