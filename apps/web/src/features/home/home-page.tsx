import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-context'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import './home-page.sass'

export const HomePage: React.FC = () => {
  const translate = useTranslate()

  return (
    <main className='home-page'>
      <h1 className='app-name'>{translate('app.name')}</h1>
      <p className='tagline'>{translate('home.tagline')}</p>
      <ThemeSwitch />
    </main>
  )
}
