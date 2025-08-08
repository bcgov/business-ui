import type { HookResult } from '@nuxt/schema'

type StandaloneTransitionApplicationHook = {
  message: string
}

declare module '#app' {
  interface RuntimeNuxtHooks {
    'app:transition-application-form:incomplete': (StandaloneTransitionApplicationHook) => HookResult
  }
  interface NuxtHooks {
    'app:transition-application-form:incomplete': (StandaloneTransitionApplicationHook) => HookResult
  }
}
