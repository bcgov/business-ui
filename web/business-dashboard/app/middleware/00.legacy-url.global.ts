/**
 * Keeps the pre-migration (unprefixed) dashboard urls working
 * - root: registry home dashboard
 * - no locale prefix: same url under the default locale
 */
export default defineNuxtRouteMiddleware((to) => {
  const { $i18n } = useNuxtApp()
  const localeCodes = $i18n.localeCodes.value

  if (isRootPath(to.path, localeCodes)) {
    return navigateTo(`${useRuntimeConfig().public.registryHomeUrl}dashboard`, { external: true })
  }

  const prefixedUrl = getLocalePrefixedUrl(to.fullPath, localeCodes, $i18n.defaultLocale)
  if (prefixedUrl) {
    return navigateTo(prefixedUrl, { replace: true })
  }
})
