export const useConnectDetailsHeaderStore = defineStore('connect/detailsHeader', () => {
  const loading = ref(false)
  const title = ref<ConnectDetailHeaderTitle>({} as ConnectDetailHeaderTitle)
  const subtitles = ref<ConnectDetailHeaderItem[]>([])
  const details = ref<ConnectDetailHeaderItem[]>([])
  const sideDetails = ref<ConnectDetailHeaderSideDetail[]>([])
  const bottomButtons = ref<ConnectDetailHeaderBtn[]>([])

  return {
    loading,
    title,
    subtitles,
    details,
    sideDetails,
    bottomButtons
  }
})
