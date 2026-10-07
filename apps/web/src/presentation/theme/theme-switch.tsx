import {
  THEME_PREFERENCES,
  type ThemePreference
} from '@adrienlcp/theme-preference'
import { useThemePreference } from '@adrienlcp/theme-preference/react'
import type React from 'react'

import { Radio, RadioGroup } from '@/presentation/components/radio-group'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { themeStore } from './theme-store'

const LABEL_KEY_FOR = {
  dark: 'theme.dark',
  light: 'theme.light',
  system: 'theme.system'
} as const satisfies Record<ThemePreference, string>

const isThemePreference = (value: string): value is ThemePreference =>
  THEME_PREFERENCES.some((preference) => preference === value)

/** Light, dark, or whatever the phone is set to — the last is the default. */
export const ThemeSwitch: React.FC = () => {
  const translate = useTranslate()
  const { preference, setPreference } = useThemePreference(themeStore)

  return (
    <RadioGroup
      className='theme-switch'
      label={translate('theme.label')}
      onChange={(value) => {
        if (isThemePreference(value)) setPreference(value)
      }}
      value={preference}
    >
      {THEME_PREFERENCES.map((choice) => (
        <Radio key={choice} value={choice}>
          {translate(LABEL_KEY_FOR[choice])}
        </Radio>
      ))}
    </RadioGroup>
  )
}
