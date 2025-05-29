import { createApp } from 'vue'

// helper from https://vuejs.org/guide/scaling-up/testing.html#testing-composables
export function withSetup (composable: any) {
  let result
  const app = createApp({
    setup () {
      result = composable()
      // suppress missing template warning
      return () => {}
    }
  })
  app.mount(document.createElement('div'))
  // return the result and the app instance
  // for testing provide/unmount
  return [result, app]
}
