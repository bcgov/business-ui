/**
 * E2E LaunchDarkly mock helper for business-registry-dashboard.
 */
import type { Page } from '@playwright/test'

export async function mockLaunchDarkly (page: Page, flags: Record<string, unknown> = {}) {
  await page.route(/launchdarkly-js-client-sdk/, async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        var __LD_FLAGS__ = ${JSON.stringify(flags)};
        function initialize() {
          var listeners = {};
          var client = {
            on: function (event, cb) {
              listeners[event] = cb;
              if (event === 'initialized') {
                // resolve on the next microtask so callers can attach listeners synchronously first
                Promise.resolve().then(function () { cb(); });
              }
            },
            off: function () {},
            variation: function (key, defaultValue) {
              return Object.prototype.hasOwnProperty.call(__LD_FLAGS__, key) ? __LD_FLAGS__[key] : defaultValue;
            },
            allFlags: function () { return __LD_FLAGS__; },
            identify: function () { return Promise.resolve(); },
            close: function () { return Promise.resolve(); }
          };
          return client;
        }
        export { initialize };
      `
    })
  })

  // Belt-and-suspenders: block the real LD network hosts too, in case a real
  // ldClientId is configured locally and the module interception above is bypassed
  // (i.e. a future refactor that lazy-imports the SDK differently).
  await page.route('https://clientsdk.launchdarkly.com/**', async (route) => {
    await route.fulfill({ json: {} })
  })
  await page.route('https://events.launchdarkly.com/**', async (route) => {
    await route.fulfill({ status: 202 })
  })
  await page.route('https://clientstream.launchdarkly.com/**', async (route) => {
    await route.fulfill({ status: 200, body: '' })
  })
}
