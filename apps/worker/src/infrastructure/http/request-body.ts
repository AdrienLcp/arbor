/** The request's JSON body, or `null` when it has none or it does not parse: the schema check that follows refuses both. */
export const readJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/** The request's form fields, or `null` when the body is not a form. */
export const readFormBody = async (
  request: Request
): Promise<FormData | null> => {
  try {
    return await request.formData()
  } catch {
    return null
  }
}
