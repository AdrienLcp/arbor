import type React from 'react'

import type { FiliationKind } from '@arbor/protocol/filiation'

import { SegmentedControl } from '@/presentation/components/segmented-control'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { LINK_KINDS } from './link-kinds'

type LinkKindControlProps = {
  /** The name of the person the relative is tied to. */
  name: string
  onChange: (kind: FiliationKind) => void
  /** Whether the relative is the person's child or their parent: the words differ, "raised" for one, "step-parent" for the other. */
  relation: 'child' | 'parent'
  value: FiliationKind
}

/** How a child or a parent is tied to the person: by birth, adoption, as raised, or fostered. */
export const LinkKindControl: React.FC<LinkKindControlProps> = ({
  name,
  onChange,
  relation,
  value
}) => {
  const translate = useTranslate()

  return (
    <SegmentedControl
      label={translate('add.linkKind', { name })}
      onChange={onChange}
      options={LINK_KINDS.map((kind) => ({
        label: translate(`add.${relation}Kind.${kind}`),
        value: kind
      }))}
      value={value}
    />
  )
}
