/* eslint-disable max-len */

export default defineAppConfig({
  ui: {
    badge: {
      slots: {
        base: 'font-medium inline-flex items-center',
        label: 'truncate font-bold',
        leadingIcon: 'shrink-0',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailingIcon: 'shrink-0'
      }
    },
    buttonGroup: {
      base: 'relative',
      variants: {
        size: {
          xs: '',
          sm: '',
          md: '',
          lg: '',
          xl: ''
        },
        orientation: {
          horizontal: 'inline-flex -space-x-px divide-x divide-gray-300',
          vertical: 'flex flex-col -space-y-px'
        }
      }
    },
    checkbox: {
      slots: {
        root: 'relative flex items-center group',
        base: 'rounded-xs relative shrink-0 flex overflow-visible items-center justify-center ring-2 ring-gray-700 before:absolute before:-inset-2.75 before:flex before:items-center before:justify-center group-hover:before:bg-[#C7C7C7]/80 before:rounded-full cursor-pointer group-active:before:bg-[#454545]/40 has-data-[state=checked]:hover:before:bg-[#7AA1D2]/40 has-data-[state=checked]:active:before:bg-[#155fb7]/40 before:transition-colors',
        label: 'cursor-pointer text-sm'
      },
      variants: {
        variant: {
          card: {
            root: 'bg-gray-100 border border-gray-300 rounded-sm'
          }
        },
        indicator: {
          start: {
            wrapper: 'ms-4'
          }
        }
      },
      compoundVariants: [
        {
          size: 'lg',
          variant: 'card',
          class: {
            root: 'p-4.25'
          }
        },
        {
          color: 'primary',
          variant: 'card',
          class: {
            root: 'has-data-[state=checked]:border-gray-300 cursor-pointer'
          }
        }
      ]
    }
  }
})
