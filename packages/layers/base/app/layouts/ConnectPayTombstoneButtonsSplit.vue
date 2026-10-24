<!-- right button group (cancel/submit) under the fee summary, left group (back/save) in the bottom bar -->
<template>
  <ConnectLayout>
    <template #header>
      <ConnectHeaderAuth />
    </template>
    <template #bottomHeaders>
      <ConnectTombstone />
    </template>
    <template #body>
      <ConnectLayoutPayBody>
        <slot />
        <template #actions>
          <ButtonControlGroup side="right" class="mt-4" />
        </template>
      </ConnectLayoutPayBody>
    </template>
    <template #topFooters>
      <div class="bg-shade-inverted pb-6 pt-10 px-2 sm:px-4" data-testid="connect-button-control-wrapper">
        <div class="app-inner-container app-body">
          <ButtonControlGroup side="left" />
        </div>
      </div>
    </template>
  </ConnectLayout>
</template>
