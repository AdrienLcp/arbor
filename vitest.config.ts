import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
      include: [
        'apps/web/src/**/*.{ts,tsx}',
        'apps/worker/src/**/*.ts',
        'packages/*/src/**/*.ts'
      ],
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary']
    },
    passWithNoTests: true,
    projects: [
      'packages/core/vitest.config.ts',
      'packages/protocol/vitest.config.ts',
      'apps/worker/vitest.config.ts',
      'apps/web/vitest.config.ts'
    ]
  }
})
