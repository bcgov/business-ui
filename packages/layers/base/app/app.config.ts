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
        label: 'text-base group-has-[button[aria-invalid=true]]:text-error'
      }
    }
  },
  formUi: {
    checkbox: {
      confirmCertify: {
        root: 'items-start',
        container: 'items-start h-auto pt-1',
        base: '!size-5 aria-invalid:ring-error'
      }
    }
  }
})
