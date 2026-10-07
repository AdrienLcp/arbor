import { z } from 'zod'

/** What a link lets its holder do, from least to most: read the tree, edit it, manage the family. */
export const ROLES = ['reader', 'contributor', 'keeper'] as const
export type Role = (typeof ROLES)[number]

/** Length of a family id and of an access key: 22 base64url characters carry 128 random bits. */
export const SECRET_LENGTH = 22

const secretSchema = z.string().regex(new RegExp(`^[\\w-]{${SECRET_LENGTH}}$`))

/** A family's address, random so that no one can list the families. */
export const familyIdSchema = secretSchema
export type FamilyId = z.infer<typeof familyIdSchema>

/** The secret a link carries in its fragment and the app sends as a bearer token. Stored hashed only. */
export const accessKeySchema = secretSchema
export type AccessKey = z.infer<typeof accessKeySchema>

/** Names a key in the keeper's list without revealing it. */
export const keyIdSchema = z.string().regex(/^[\w-]{1,32}$/)
export type KeyId = z.infer<typeof keyIdSchema>

/** A key as the keeper sees it in the family's settings: never the secret itself. */
export const keyViewSchema = z.object({
  createdAt: z.iso.datetime({ offset: true }),
  id: keyIdSchema,
  revokedAt: z.iso.datetime({ offset: true }).nullable(),
  role: z.enum(ROLES)
})
export type KeyView = z.infer<typeof keyViewSchema>

/** A key just made: the only moment its secret leaves the server. */
export const issuedKeySchema = z.object({
  id: keyIdSchema,
  key: accessKeySchema,
  role: z.enum(ROLES)
})
export type IssuedKey = z.infer<typeof issuedKeySchema>
