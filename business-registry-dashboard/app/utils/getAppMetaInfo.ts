export async function getAppMetaInfo () {
  const config = useRuntimeConfig()
  const uiVersion = config.public.uiVersion

  try {
    const apiMeta = await useBarApi<{ API: string, FrameWork: string }>('/meta/info')

    const appVersion = {
      ui: uiVersion,
      api: apiMeta.API.split('/')[1]
    }

    return appVersion
  } catch {}
}
