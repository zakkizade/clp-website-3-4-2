type QueryResult = { data: unknown[]; error: null }

const emptyQuery = (): any => {
  const result = Promise.resolve({ data: [], error: null } satisfies QueryResult)
  return {
    select: () => emptyQuery(),
    eq: () => emptyQuery(),
    order: () => result,
    upsert: () => result,
    insert: () => result,
    update: () => emptyQuery(),
    delete: () => emptyQuery(),
    then: result.then.bind(result),
  }
}

export function createClient(): any {
  return {
    from: () => emptyQuery(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: path }, error: null }),
      }),
    },
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: "Account sign-in is unavailable in local mode." } }),
      signUp: async () => ({ data: null, error: { message: "Account sign-up is unavailable in local mode." } }),
      signInWithOAuth: async () => ({ data: null, error: { message: "OAuth is unavailable in local mode." } }),
    },
  }
}
