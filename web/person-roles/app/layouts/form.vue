<template>
  <div
    class="app-container"
    data-testid="form-layout"
  >
    <ConnectHeader />
    <ConnectSystemBanner />
    <ConnectBreadcrumb />
    <main class="app-inner-container app-body">
      <div class="flex flex-col lg:flex-row lg:gap-6 grow">
        <div class="grow max-w-full overflow-hidden">
          <slot />
        </div>

        <div class="shrink-0 lg:w-[300px] lg:static sticky lg:mt-10">
          <ConnectFeeWidget class="sticky lg:top-10" />
        </div>
      </div>
    </main>
    <ConnectButtonControl />
    <ConnectFooter />
  </div>
</template>
