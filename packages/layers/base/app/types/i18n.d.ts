// Augment ComponentCustomProperties to fix typescript warning

// https://nuxt.com/blog/v3-13#vue-typescript-changes
// https://vuejs.org/api/utility-types.html#componentcustomproperties
// https://vue-i18n.intlify.dev/api/composition.html#composer
import type { Composer } from 'vue-i18n'
import type {
  ComponentCustomProperties as _ComponentCustomProperties,
  ComponentCustomOptions as _ComponentCustomOptions
} from 'vue'

declare module '@vue/runtime-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomOptions extends _ComponentCustomOptions {} // ensure type is merged and not overwritten
  interface ComponentCustomProperties extends _ComponentCustomProperties {
    $i18n: Composer
    $t: Composer['t']
    $te: Composer['te']
    $tm: Composer['tm']
    $rt: Composer['rt']
    $d: Composer['d']
    $n: Composer['n']
  }
}

export {}
