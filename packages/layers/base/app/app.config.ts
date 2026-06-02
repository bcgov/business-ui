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
        root: 'items-start',
        base: '!size-[18px] !ring-2 ring-neutral aria-invalid:!ring-error',
        container: 'items-start h-auto pt-1',
        label: 'text-base group-has-[button[aria-invalid=true]]:text-error'
      }
    }
  }
})
