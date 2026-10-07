import type React from 'react'
import { Link } from 'react-router'

import { paths } from '@/infrastructure/router/navigation'
import { useTranslate } from '@/presentation/i18n/i18n-context'

export const NotFoundPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <main>
      <h1>{translate('notFound.title')}</h1>
      <Link to={paths.home}>{translate('notFound.home')}</Link>
    </main>
  )
}
