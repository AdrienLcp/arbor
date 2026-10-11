import { useTranslate } from '@/presentation/i18n/i18n-context'

type UnknownParentWords = {
  hint: string
  /** What pressing the slot does, for a screen reader. */
  label: string
}

/** The words of an unknown parent's slot, naming the child whose parent is missing; `null` when that child is not known. */
export const useUnknownParentWords = (): ((
  childName: string | null
) => UnknownParentWords) => {
  const translate = useTranslate()

  return (childName) =>
    childName === null
      ? {
          hint: translate('tree.unknownParent.hint'),
          label: translate('tree.unknownParent.hint')
        }
      : {
          hint: translate('tree.unknownParent.hintOf', { name: childName }),
          label: translate('tree.unknownParent.label', { name: childName })
        }
}
