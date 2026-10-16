/* eslint-disable max-len */
// NB: Outline styles changed recently, may need to update here
// https://github.com/nuxt/ui/pull/6576
export default defineAppConfig({
  ui: {
    badge: {
      variants: {
        size: {
          md: {
            base: 'text-sm px-2.5 py-0'
          }
        }
      }
    },
    checkbox: {
      slots: {
        root: 'items-start group',
        base: 'size-[18px]! ring-2! ring-neutral aria-invalid:ring-error!',
        container: 'items-start h-auto pt-1',
        label: 'text-base group-has-[button[aria-invalid=true]]:text-error'
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'card',
          class: {
            root: 'hover:bg-shade! border-line-muted! has-data-[state=checked]:bg-shade cursor-pointer has-focus-visible:outline-0! has-focus-visible:border-line-muted!',
            base: 'focus-visible:outline-primary! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-solid! focus:outline-none'
          }
        },
        {
          color: 'primary',
          variant: 'list',
          indicator: ['start', 'end'],
          class: {
            base: 'outline-primary outline-offset-2 focus-visible:outline-2'
          }
        }
      ]
    },
    radioGroup: {
      variants: {
        variant: {
          card: {
            item: 'border-line-muted!'
          }
        }
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: ['card', 'table'],
          class: {
            item: 'has-data-[state=checked]:bg-white hover:bg-shade! hover:has-data-[state=checked]:bg-white! has-data-[state=checked]:border-primary! has-focus-visible:outline-none!',
            base: 'focus-visible:outline-primary! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-solid!',
          }
        },
        {
          color: 'primary',
          variant: 'list',
          indicator: ['start', 'end'],
          class: {
            base: 'focus-visible:outline-primary! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-solid!',
          }
        }
      ]
    }
  }
})
