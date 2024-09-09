export default defineAppConfig({
  ui: {
    accordion: {
      wrapper: 'w-full flex flex-col',
      container: 'w-full flex flex-col',
      item: {
        base: '',
        size: 'text-sm',
        color: 'text-bcGovColor-darkGray dark:text-white',
        padding: 'pt-1.5 pb-3',
        icon: 'ms-auto transform transition-transform duration-200'
      },
      transition: {
        enterActiveClass: 'overflow-hidden transition-[height] duration-200 ease-out',
        leaveActiveClass: 'overflow-hidden transition-[height] duration-200 ease-out'
      },
      default: {
        openIcon: 'i-heroicons-chevron-down-20-solid',
        closeIcon: '',
        class: 'mb-1.5 w-full',
        variant: 'accordian_trigger'
      }
    },
    alert: {
      variant: {
        error: 'bg-red-50 dark:bg-red-400 dark:bg-opacity-10 text-red-500 dark:text-red-400 ring-1 ring-inset ring-red-500 dark:ring-red-400 ring-opacity-25 dark:ring-opacity-25',
        info: 'bg-white text-orange-500 ring-opacity-25 dark:ring-opacity-25',
        warning: 'bg-yellow-50 dark:bg-yellow-400 dark:bg-opacity-10 text-yellow-500 dark:text-yellow-400 ring-1 ring-inset ring-yellow-500 dark:ring-yellow-400 ring-opacity-25 dark:ring-opacity-25'
      }
    },
    button: {
      size: {
        bcGov: 'text-sm'
      },
      padding: {
        bcGov: 'px-7 py-3'
      },
      gap: {
        bcGov: 'gap-x-2.5'
      },
      square: {
        bcGov: 'p-1.5'
      },
      icon: {
        size: {
          bcGov: 'h-5 w-5'
        }
      },
      color: {
        white: {
          link: 'text-white text-base font-semibold tracking-wide dark:text-white hover:bg-white/[0.1] dark:bg-gray-900 dark:hover:bg-gray-800/75 focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-white transition-colors duration-300 ease-in-out',
          solid: 'shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-900 dark:text-white bg-white hover:bg-gray-50 disabled:bg-white dark:bg-gray-900 dark:hover:bg-gray-800/50 dark:disabled:bg-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-white'
        }
      },
      variant: {
        table_header_clear: 'text-bcGovColor-darkGray rounded-none rounded-tr-md bg-gray-100 hover:bg-gray-200 font-semibold dark:text-white dark:hover:bg-blue-100/10 disabled:bg-{color}-500 dark:disabled:bg-{color}-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-{color}-500 dark:focus-visible:outline-white transition-colors duration-300 ease-in-out border-gray-700 focus:border-primary-500 bg-gray-100 hover:bg-gray-200 border-b-[1px] focus:border-b-2 focus:ring-0',
        accordian_trigger: 'text-bcGovColor-darkGray font-semibold dark:text-white dark:hover:bg-blue-100/10 hover:bg-blue-50 disabled:bg-{color}-500 dark:disabled:bg-{color}-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-{color}-500 dark:focus-visible:outline-white transition-colors duration-300 ease-in-out',
        link: 'text-{color}-500 tracking-wide text-base hover:text-{color}-600 disabled:text-{color}-500 dark:text-white dark:hover:text-blue-300 dark:disabled:text-{color}-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-{color}-500 dark:focus-visible:ring-white',
        solid: 'shadow-sm text-white dark:text-gray-900 bg-{color}-500 hover:bg-{color}-600 disabled:bg-{color}-500 dark:bg-[#E0E7ED] dark:hover:bg-bcGovGray-500 dark:disabled:bg-{color}-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-{color}-500 dark:focus-visible:outline-white',
        outline: 'ring-1 ring-inset ring-current text-{color}-500 dark:text-[#E0E7ED] hover:bg-{color}-50 disabled:bg-transparent dark:hover:bg-[#E0E7ED]/25 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-{color}-500 dark:focus-visible:ring-white',
        select_menu_trigger: 'border-gray-700 focus-visible:border-primary-500 bg-gray-100 hover:bg-gray-200 border-b-[1px] focus-visible:border-b-2 focus:ring-0 h-[42px] rounded-t-m rounded-b-none'
      },
      default: {
      }
    },
    card: {
      ring: 'ring-1 ring-gray-200 dark:ring-gray-300/50',
      divide: 'divide-y divide-gray-200 dark:divide-gray-300/50'
    },
    checkbox: {
      wrapper: 'flex items-start',
      base: 'mt-1 mr-2',
      border: 'border-gray-500',
      label: 'text-base text-bcGovColor-midGray font-normal'
    },
    divider: {
      border: {
        base: 'flex border-bcGovGray-500 dark:border-gray-300/50'
      }
    },
    formGroup: {
      label: { base: 'block text-base font-bold py-3 text-gray-900' },
      help: 'mt-2 text-xs text-gray-600 dark:text-gray-400'
    },
    input: {
      base: 'bg-gray-100 hover:bg-gray-200 border-b-[1px] focus:border-b-2 focus:ring-0',
      rounded: 'rounded-none rounded-t-md',
      variant: {
        bcGovLg: 'h-[56px] border-gray-700 placeholder-gray-700 focus:border-primary-500 focus:placeholder-primary-500',
        bcGovSm: 'h-[42px] border-gray-700 placeholder-gray-700 focus:border-primary-500 focus:placeholder-primary-500',
        error: 'h-[56px] border-red-500 focus:border-red-500 placeholder-red-500 focus:placeholder-red-500',
        primary: 'border-primary-500 placeholder-primary-500 border-b-2'
      }
    },
    notification: {
      title: 'text-sm font-medium text-white',
      description: 'mt-1 text-sm leading-4 text-white',
      background: 'bg-gray-700',
      progress: {
        base: 'hidden',
        background: 'bg-{color}-500 dark:bg-{color}-400'
      }
    },
    notifications: {
      position: 'bottom-0 left-1/2 -translate-x-1/2'
    },
    pagination: {
      wrapper: 'flex items-center -space-x-px',
      base: '',
      rounded: 'first:rounded-s-md last:rounded-e-md',
      default: {
        size: 'sm',
        activeButton: {
          color: 'primary'
        },
        inactiveButton: {
          color: 'white'
        },
        firstButton: {
          color: 'white',
          class: 'rtl:[&_span:first-child]:rotate-180',
          icon: 'i-heroicons-chevron-double-left-20-solid'
        },
        lastButton: {
          color: 'white',
          class: 'rtl:[&_span:last-child]:rotate-180',
          icon: 'i-heroicons-chevron-double-right-20-solid'
        },
        prevButton: {
          color: 'white',
          class: 'rtl:[&_span:first-child]:rotate-180',
          icon: 'i-heroicons-chevron-left-20-solid'
        },
        nextButton: {
          color: 'white',
          class: 'rtl:[&_span:last-child]:rotate-180',
          icon: 'i-heroicons-chevron-right-20-solid'
        }
      }
    },
    popover: {
      background: 'bg-gray-700',
      ring: 'ring-1 ring-gray-700',
      width: 'max-w-xs sm:max-w-sm',
      popper: {
        // arrow: true
      },
      arrow: {
        base: 'before:w-3 before:h-3',
        ring: 'before:ring-1 before:ring-gray-700',
        background: 'before:bg-gray-700',
        rounded: 'before:rounded-none',
        placement: "group-data-[popper-placement*='right']:-left-1 group-data-[popper-placement*='left']:-right-1 group-data-[popper-placement*='top']:-bottom-1 group-data-[popper-placement*='bottom']:-top-1"
      }
    },
    radio: {
      border: 'border-gray-500'
    },
    select: {
      base: 'bg-gray-100 hover:bg-gray-200 h-[56px] border-b-[1px] focus:border-b-2 focus:ring-0',
      rounded: 'rounded-none rounded-t-md',
      variant: {
        bcGov: 'border-gray-700',
        error: 'border-red-500'
      },
      icon: {
        base: 'text-gray-700'
      }
    },
    selectMenu: {
      label: 'text-gray-700',
      rounded: 'rounded-none',
      width: 'min-w-fit',
      option: {
        rounded: 'rounded-none',
        active: 'text-primary-500',
        selected: 'text-primary-500 bg-gray-100',
        icon: {
          active: 'text-primary-500'
        },
        selectedIcon: {
          base: 'text-primary-500'
        }
      }
    },
    table: {
      divide: 'divide-y divide-gray-300 dark:divide-gray-300/50',
      tbody: 'divide-y divide-gray-200 dark:divide-gray-300/50',
      th: {
        color: 'text-bcGovColor-darkGray dark:text-white'
      },
      td: {
        color: 'text-bcGovColor-midGray dark:text-gray-300'
      }
    },
    tabs: {
      wrapper: 'relative space-y-2',
      container: 'relative w-full',
      base: 'focus:outline-none',
      list: {
        base: 'relative',
        background: 'bg-gray-200 dark:bg-gray-800',
        rounded: 'rounded-lg',
        shadow: '',
        padding: 'p-1',
        height: 'h-10',
        width: 'w-full',
        marker: {
          wrapper: 'absolute top-[4px] left-[4px] duration-200 ease-out focus:outline-none',
          base: 'w-full h-full',
          background: 'bg-white dark:bg-gray-900',
          rounded: 'rounded-md',
          shadow: 'shadow-sm'
        },
        tab: {
          base: 'relative inline-flex items-center justify-center flex-shrink-0 w-full ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 dark:ui-focus-visible:ring-white dark:focus-visible:ring-white ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors duration-200 ease-out',
          background: '',
          active: 'text-bcGovColor-activeBlue font-semibold dark:text-white',
          inactive: 'text-bcGovColor-darkGray dark:text-gray-300',
          height: 'h-8',
          padding: 'px-3',
          size: 'text-sm',
          font: 'font-medium',
          rounded: 'rounded-md',
          shadow: ''
        }
      }
    },
    textarea: {
      base: 'bg-gray-100 hover:bg-gray-200 border-b-[1px] focus:border-b-2 h-20 focus:ring-0 text-gray-900',
      rounded: 'rounded-none rounded-t-md',
      variant: {
        bcGov: 'border-gray-700 placeholder-gray-700 focus:border-primary-500 focus:placeholder-primary-500',
        error: 'border-red-500 focus:border-red-500 placeholder-red-500 focus:placeholder-red-500'
      }
    },
    toggle: {
      active: 'bg-{color}-500 dark:bg-{color}-500',
      inactive: 'bg-gray-200 dark:bg-gray-700',
      ring: 'focus-visible:ring-2 focus-visible:ring-{color}-500 dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      container: {
        base: 'pointer-events-none relative inline-block rounded-full bg-white dark:bg-white shadow transform ring-0 transition ease-in-out duration-200'
      }
    },
    tooltip: {
      wrapper: 'relative inline-flex max-h-min',
      container: 'z-20 group min-h-fit',
      background: 'bg-gray-700',
      color: 'text-white',
      ring: 'ring-1 ring-gray-700',
      rounded: 'rounded',
      base: 'h-auto px-2 py-1 text-sm font-normal relative whitespace-normal',
      arrow: {
        base: 'before:w-3 before:h-3',
        ring: 'before:ring-1 before:ring-gray-700',
        background: 'before:bg-gray-700',
        rounded: 'before:rounded-none'
      }
    },
    verticalNavigation: {
      active: 'text-bcGovColor-activeBlue dark:text-white font-semibold',
      inactive: 'text-bcGovColor-midGray dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:before:bg-gray-50 dark:hover:before:bg-gray-800/50',
      base: 'group relative flex items-center gap-1.5 focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-1 focus-visible:before:ring-primary-500 dark:focus-visible:before:ring-white before:absolute before:inset-px before:rounded-md disabled:cursor-not-allowed disabled:opacity-75'
    }
  }
})
