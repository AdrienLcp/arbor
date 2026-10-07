import 'temporal-polyfill/global'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { adoptFamilyLink } from '@/features/family-access/adopt-family-link'
import { watchAddressFragment } from '@/infrastructure/browser'
import { routes } from '@/infrastructure/router/routes'
import { AppProviders } from '@/presentation/app-providers'

import '@/presentation/styles/globals.sass'

const container = document.getElementById('root')

if (container === null) {
  throw new Error('Missing #root in index.html')
}

adoptFamilyLink()

const router = createBrowserRouter(routes)

watchAddressFragment(() => {
  adoptFamilyLink()
  void router.revalidate()
})

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
)
