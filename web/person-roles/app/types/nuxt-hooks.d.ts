import type { HookResult } from '@nuxt/schema'

type OfficerFormIncompleteHook = {
  message: string
}

declare module '#app' {
  interface RuntimeNuxtHooks {
    'app:officer-form:incomplete': (OfficerFormIncompleteHook) => HookResult
  }
  interface NuxtHooks {
    'app:officer-form:incomplete': (OfficerFormIncompleteHook) => HookResult
  }
}
