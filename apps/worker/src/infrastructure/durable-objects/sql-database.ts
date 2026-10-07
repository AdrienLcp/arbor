/** A value SQLite stores; a blob is a `Uint8Array` both ways, whatever the driver uses. */
export type SqlValue = Uint8Array | number | string | null

/**
 * The family's SQLite database, as the stores use it. One statement per call:
 * the Durable Object runs transactions itself and refuses `BEGIN`.
 */
export type SqlDatabase = {
  exec: (query: string, ...bindings: SqlValue[]) => Record<string, unknown>[]
  /** The bytes the database takes on disk, blobs included. */
  size: () => number
  transaction: <T>(run: () => T) => T
}

const toStorageValue = (value: SqlValue) =>
  value instanceof Uint8Array ? value.slice().buffer : value

const fromStorageValue = (value: unknown) =>
  value instanceof ArrayBuffer ? new Uint8Array(value) : value

/** The database of a Durable Object, whose SQLite hands blobs over as `ArrayBuffer`s. */
export const sqlDatabaseOf = (storage: DurableObjectStorage): SqlDatabase => ({
  exec: (query, ...bindings) =>
    storage.sql
      .exec(query, ...bindings.map(toStorageValue))
      .toArray()
      .map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([column, value]) => [
            column,
            fromStorageValue(value)
          ])
        )
      ),
  size: () => storage.sql.databaseSize,
  transaction: (run) => storage.transactionSync(run)
})
