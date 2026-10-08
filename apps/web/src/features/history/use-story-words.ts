import type { ChangeLogEntry } from '@arbor/protocol/change-log'

import { useAuthorName } from '@/features/family-edits/use-author-name'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import type { NamedPerson, StoryLine } from './entry-story'
import { authorKey } from './history-days'
import { ofName, thatName } from './of-name'
import { useEntryClock } from './use-entry-clock'

/** Words a story line, in the interface's language. `entries` lets an undo or a restore name what it took back. */
export const useStoryWords = (
  entries: ReadonlyMap<number, ChangeLogEntry>
): ((line: StoryLine) => string) => {
  const translate = useTranslate()
  const locale = useLocale()
  const wordList = useWordList()
  const authorName = useAuthorName()
  const clock = useEntryClock()

  const named = (name: NamedPerson | 'unknown'): string =>
    name === 'unknown'
      ? translate('history.unknownPerson')
      : (name ?? translate('common.unnamedPerson'))
  const names = (list: readonly (NamedPerson | 'unknown')[]): string =>
    wordList(list.map(named))
  const of = (list: readonly (NamedPerson | 'unknown')[]): string =>
    ofName(locale, names(list))

  return (line) => {
    switch (line.kind) {
      case 'added':
        return [
          translate('history.line.added', { name: named(line.name) }),
          ...(line.parentNames.length === 0
            ? []
            : [
                translate('history.line.childOf', {
                  ofNames: of(line.parentNames)
                })
              ]),
          ...(line.childNames.length === 0
            ? []
            : [
                translate('history.line.parentOf', {
                  ofNames: of(line.childNames)
                })
              ]),
          ...(line.partnerNames.length === 0
            ? []
            : [
                translate('history.line.partnerOf', {
                  names: names(line.partnerNames)
                })
              ])
        ].join(', ')
      case 'renamed':
        return translate('history.line.renamed', {
          after: named(line.after),
          before: named(line.before)
        })
      case 'corrected':
        return translate('history.line.corrected', {
          fields: wordList(
            line.fields.map((field) => translate(`history.field.${field}`))
          ),
          ofName: of([line.name])
        })
      case 'binned':
        return translate('history.line.binned', { name: named(line.name) })
      case 'restored':
        return translate('history.line.restored', { name: named(line.name) })
      case 'removed':
        return translate('history.line.removed', { name: named(line.name) })
      case 'union': {
        const ofNames = of(line.partnerNames)
        if (line.ending !== null) {
          return translate('history.line.unionEnded', {
            ending: line.ending,
            ofNames
          })
        }
        return translate(`history.line.union.${line.change}`, {
          ofNames,
          union: line.unionKind
        })
      }
      case 'filiation': {
        const people = {
          child: named(line.childName),
          ofParent: of([line.parentName]),
          parent: named(line.parentName),
          thatChild: thatName(locale, named(line.childName))
        }
        return line.change === 'create' && line.filiationKind !== 'birth'
          ? translate('history.line.filiation.createKind', {
              ...people,
              kind: line.filiationKind
            })
          : translate(`history.line.filiation.${line.change}`, people)
      }
      case 'event': {
        const event =
          line.eventKind === 'other' && line.label !== null
            ? translate('history.event.labelled', { label: line.label })
            : translate(`history.event.${line.eventKind}`)
        return translate(`history.line.event.${line.change}`, {
          event,
          ofName: of([line.name])
        })
      }
      case 'photo':
        return line.name === 'none'
          ? translate(`history.line.photo.${line.change}Unlinked`)
          : translate(`history.line.photo.${line.change}`, {
              ofName: of([line.name])
            })
      case 'undo': {
        const authors = new Map(
          line.revisions
            .map((revision) => entries.get(revision)?.author)
            .filter((author) => author !== undefined)
            .map((author) => [authorKey(author), authorName(author)])
        )
        return translate('history.line.undo', {
          count: line.revisions.length,
          ofNames: ofName(locale, wordList([...authors.values()]))
        })
      }
      case 'restore': {
        const target = entries.get(line.revision)
        return target === undefined
          ? translate('history.line.restoreStart')
          : translate('history.line.restore', {
              moment: clock.momentOf(target.at)
            })
      }
    }
  }
}
