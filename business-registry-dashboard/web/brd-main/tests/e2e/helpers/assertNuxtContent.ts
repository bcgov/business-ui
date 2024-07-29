import { expect, type Page } from '@playwright/test'
export async function assertNuxtContent (page: Page, id: string, visible: boolean) {
  const nuxtContent = page.getByTestId(`content-data-${id}`)
  if (visible) {
    await expect(nuxtContent).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
    await expect(nuxtContent).not.toBeEmpty()
    await expect(nuxtContent).toBeVisible()
  } else {
    await expect(nuxtContent).not.toBeVisible()
  }
}
