/* eslint-disable max-len */

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'bcGovGray'
    },
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
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'ghost',
          class: 'text-(--ui-primary) hover:bg-(--ui-primary)/10 active:bg-(--ui-primary)/25 focus:outline-none focus-visible:bg-(--ui-primary)/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent'
        }
      ]
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
          horizontal: 'inline-flex -space-x-px divide-x divide-bcGovGray-300',
          vertical: 'flex flex-col -space-y-px'
        }
      }
    },
    checkbox: {
      slots: {
        root: 'relative flex items-start',
        base: 'shrink-0 flex items-center justify-center rounded-(--ui-radius) text-(--ui-bg) ring-2 ring-inset ring-bcGovGray-700 focus-visible:outline-2 focus-visible:outline-offset-2',
        label: 'block font-medium text-(--ui-text) text-base'
      }
    },
    formField: {
      slots: {
        root: '',
        wrapper: '',
        labelWrapper: 'flex content-center items-center justify-between',
        label: 'block font-medium text-(--ui-text)',
        container: 'mt-1 relative',
        description: 'text-(--ui-text)',
        error: 'pl-4.5 mt-1 text-(--ui-error) text-xs',
        hint: 'text-(--ui-text)',
        help: 'pl-4.5 mt-1 text-(--ui-text) text-xs'
      },
      variants: {
        size: {
          xs: {
            root: 'text-xs'
          },
          sm: {
            root: 'text-xs'
          },
          md: {
            root: 'text-sm'
          },
          lg: {
            root: 'text-sm'
          },
          xl: {
            root: 'text-base'
          }
        },
        required: {
          true: {
            label: 'after:content-[\'*\'] after:ms-0.5 after:text-(--ui-error)'
          }
        }
      },
      defaultVariants: {
        size: 'md'
      }
    },
    input: {
      variants: {
        size: {
          bcGovLg: {
            base: 'px-2.5 pb-2 pt-6 text-base gap-1.5',
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5'
          }
        },
        variant: {
          bcGov: 'ring-0 ring-transparent peer rounded-t-sm rounded-b-none bg-bcGovGray-100 shadow-bcGovInput focus:ring-0 focus:outline-none focus:shadow-bcGovInputFocus text-bcGovGray-900'
        }
      },
      defaultVariants: {
        size: 'bcGovLg',
        color: 'primary',
        variant: 'bcGov'
      }
    },
    select: {
      slots: {
        content: 'rounded-sm',
        group: 'px-0 py-2',
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200 text-(--ui-text)', //  group-data-[state=open]:text-blue-500 group-data-focus:text-blue-500 // TODO: icon colour when focused
        item: 'my-0.75 text-bcGovGray-900 before:rounded-none data-highlighted:text-blue-500 data-highlighted:before:bg-blue-50 data-[state=checked]:text-blue-500',
        itemLeadingIcon: 'group-data-[state=checked]:text-blue-500 group-data-highlighted:text-blue-500 text-bcGovGray-900'
      },
      variants: {
        size: {
          bcGov: {
            base: 'px-0 py-0 text-base gap-1.5',
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
            label: 'p-1.5 text-xs gap-1.5',
            item: 'py-1.5 px-4 text-sm gap-3',
            itemLeadingIcon: 'size-5',
            itemLeadingAvatarSize: '2xs',
            itemLeadingChip: 'size-5',
            itemLeadingChipSize: 'md',
            itemTrailingIcon: 'size-5'
          }
        },
        variant: {
          bcGov: 'peer rounded-t-sm rounded-b-none bg-bcGovGray-100 focus:ring-0 focus:outline-none shadow-bcGovInput data-[state=open]:shadow-bcGovInputFocus focus:shadow-bcGovInputFocus text-bcGovGray-900'
        }
      },
      defaultVariants: {
        size: 'bcGov',
        color: 'primary',
        variant: 'bcGov'
      }
    },
    textarea: {
      variants: {
        size: {
          bcGovLg: {
            base: 'px-2.5 pb-1.5 pt-5 text-base gap-1.5',
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5'
          }
        },
        variant: {
          bcGov: 'peer rounded-t-sm rounded-b-none bg-bcGovGray-100 focus:ring-0 focus:outline-none shadow-bcGovInput focus:shadow-bcGovInputFocus text-bcGovGray-900'
        }
      },
      defaultVariants: {
        size: 'bcGovLg',
        color: 'primary',
        variant: 'bcGov'
      }
    }
  }
})
