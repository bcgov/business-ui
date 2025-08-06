<script setup lang="ts">
const {
  loading,
  title,
  subtitles,
  details,
  sideDetails,
  bottomButtons
} = storeToRefs(useConnectDetailsHeaderStore())

const validate = (sideDetail: ConnectDetailHeaderSideDetail, onlyOnExistingErr: boolean) => {
  if (onlyOnExistingErr && !sideDetail.edit?.validation?.error) {
    return
  }
  if (sideDetail.edit?.validation) {
    sideDetail.edit.validation.error = sideDetail.edit?.validation?.validate(sideDetail.value)
  }
}

const save = (sideDetail: ConnectDetailHeaderSideDetail) => {
  if (sideDetail.edit) {
    sideDetail.edit.validation?.validate(sideDetail.value)
    if (sideDetail.edit.validation?.error) {
      return
    }
    sideDetail.edit.isEditing = false
    sideDetail.edit.action()
  }
}

const handleButtonAction = async (button: ConnectDetailHeaderBtn) => {
  button.loading = true
  await button.action()
  button.loading = false
}
</script>

<template>
  <div
    class="bg-white py-8"
    data-testid="connect-details-header"
  >
    <div class="app-inner-container">
      <div
        v-if="loading"
        class="flex animate-pulse flex-col gap-2 *:space-y-2 sm:flex-row"
      >
        <div class="grow">
          <div class="h-9 w-[400px] rounded bg-gray-200" />
          <div class="h-5 w-[250px] rounded bg-gray-200" />
          <div class="h-5 w-[200px] rounded bg-gray-200" />
          <div class="h-5 w-[150px] rounded bg-gray-200" />
        </div>
        <div>
          <div class="h-5 w-[300px] rounded bg-gray-200" />
          <div class="h-5 w-[300px] rounded bg-gray-200" />
          <div class="h-5 w-[300px] rounded bg-gray-200" />
          <div class="h-5 w-[300px] rounded bg-gray-200" />
        </div>
      </div>
      <div
        v-else
        class="flex flex-col gap-2 sm:flex-row"
      >
        <div class="grow space-y-4">
          <div>
            <component
              :is="title.el"
              class="text-[1.375rem] font-bold text-gray-900"
            >
              {{ title.text }}
            </component>
            <div
              v-if="subtitles.length"
              class="flex divide-x divide-gray-500"
            >
              <ConnectDetailHeaderItem
                v-for="subtitle, i in subtitles"
                :key="'subtitle-' + i"
                v-bind="subtitle"
                class="px-2"
                :class="i === 0 ? 'pl-0' : ''"
              />
            </div>
          </div>
          <div class="space-y-1">
            <slot name="details">
              <div class="flex space-x-2">
                <div
                  v-for="detail, i in details"
                  :key="'detail-' + i"
                >
                  <ConnectDetailHeaderItem v-bind="detail" />
                </div>
              </div>
            </slot>
            <slot name="buttons">
              <div
                v-if="bottomButtons.length"
                class="flex flex-wrap gap-2"
              >
                <UButton
                  v-for="btn in bottomButtons"
                  :key="btn.label"
                  :label="btn.label"
                  :icon="btn.icon"
                  :loading="btn.loading"
                  class="pl-0"
                  color="primary"
                  variant="link"
                  @click="handleButtonAction(btn)"
                />
              </div>
            </slot>
          </div>
        </div>
        <dl class="space-y-1 pt-1 text-sm">
          <template
            v-for="detail in sideDetails"
            :key="detail.label"
          >
            <div :class="[detail.edit && !detail.edit.isEditing && 'mr-14']">
              <!-- TODO: design not finalized, this is a WIP  -->
              <UTooltip
                :prevent="detail.edit?.isEditing"
                :close-delay="100"
                :content="{ side: 'right', sideOffset: 0 }"
                :ui="{ content: 'bg-transparent opacity-100 shadow-none' }"
              >
                <div class="flex flex-row flex-wrap gap-2">
                  <dt
                    class="font-bold text-bcGovGray-900"
                    :class="[detail.edit?.isEditing && 'mt-1']"
                  >
                    {{ detail.label }}:
                  </dt>
                  <dd v-if="!detail.edit?.isEditing">
                    {{ detail.value }}
                  </dd>
                  <UFormField
                    v-else
                    :name="detail.label"
                    :error="detail.edit?.validation?.error || undefined"
                    size="xs"
                  >
                    <UInput
                      v-model="detail.value"
                      size="xs"
                      @input="validate(detail, true)"
                      @change="validate(detail, false)"
                    />
                  </UFormField>
                  <UButton
                    v-if="detail.edit?.isEditing"
                    class="mt-[2px] items-start"
                    :label="$t('word.Save')"
                    :padded="false"
                    variant="link"
                    @click="save(detail)"
                  />
                </div>
                <template #text>
                  <UButton
                    v-if="detail.edit && !detail.edit.isEditing"
                    icon="i-mdi-edit"
                    :label="$t('label.edit')"
                    :padded="false"
                    variant="link"
                    @click="detail.edit.isEditing = true"
                  />
                </template>
              </UTooltip>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </div>
</template>
