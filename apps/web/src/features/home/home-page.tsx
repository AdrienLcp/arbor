import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-context'

export const HomePage: React.FC = () => {
  const translate = useTranslate()

  return (
    <main>
      <h1>{translate('app.name')}</h1>
      <p>{translate('home.tagline')}</p>
    </main>
  )
}
