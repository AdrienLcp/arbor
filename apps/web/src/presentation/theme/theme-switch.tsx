import {
  THEME_PREFERENCES,
  type ThemePreference
} from '@adrienlcp/theme-preference'
import { useThemePreference } from '@adrienlcp/theme-preference/react'
import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { themeStore } from './theme-store'

import './theme-switch.sass'

const LABEL_KEY_FOR = {
  dark: 'theme.dark',
  light: 'theme.light',
  system: 'theme.system'
} as const satisfies Record<ThemePreference, string>

/** Light, dark, or whatever the phone is set to — the last is the default. */
export const ThemeSwitch: React.FC = () => {
  const translate = useTranslate()
  const { preference, setPreference } = useThemePreference(themeStore)

  return (
    <fieldset className='theme-switch'>
      <legend className='theme-switch-legend'>
        {translate('theme.label')}
      </legend>
      <div className='choices'>
        {THEME_PREFERENCES.map((choice) => (
          <label className='choice' key={choice}>
            <input
              checked={preference === choice}
              name='theme'
              onChange={() => setPreference(choice)}
              type='radio'
              value={choice}
            />
            <span className='choice-label'>
              {translate(LABEL_KEY_FOR[choice])}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
