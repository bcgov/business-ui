import { defineNuxtModule, createResolver } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'business-base-assets',
    configKey: 'businessBaseAssets'
  },
  defaults: {},
  async setup(_options, _nuxt) {
    console.info('Setting up **BusinessBase** assets module')
    const resolver = createResolver(import.meta.url)

    _nuxt.options.css.push(resolver.resolve('./runtime/assets/business-base-tw.css'))
  }
})
