<template>
  <div
    class="app-container"
    data-testid="form-layout"
  >
    <ConnectHeader />
    <ConnectSystemBanner />
    <ConnectBreadcrumb />
    <main class="app-inner-container app-body">
      <div class="flex flex-col lg:flex-row">
        <div class="grow">
          <slot />
        </div>
        <aside class="sticky bottom-0 z-10 w-full lg:static lg:mt-[96px] lg:w-[340px] lg:px-5">
          <!-- <ConnectFeeWidget class="sticky lg:top-10" /> -->
        </aside>
      </div>
    </main>
    <ConnectButtonControl />
    <ConnectFooter />
  </div>
</template>
