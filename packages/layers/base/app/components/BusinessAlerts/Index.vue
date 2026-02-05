<script setup lang="ts">
defineProps<{ alerts: BusinessAlertItem[] }>()
</script>

<template>
  <div data-testid="business-alerts">
    <h2>
      {{ $t('label.alerts') }} ({{ alerts.length }})
    </h2>
    <UAccordion class="bg-shade-inverted rounded *:px-3" :items="alerts">
      <template #default="{ item }">
        <p>
          <strong>{{ item.label }}</strong>
        </p>
      </template>
      <template #trailing="{ open }">
        <UButton
          class="ml-auto"
          :label="open ? $t('label.closeDetails') : $t('label.viewDetails')"
          trailing-icon="i-mdi-chevron-down"
          variant="ghost"
        />
      </template>
      <template #body="{ item }">
        <div class="space-y-3" :data-testid="`business-alerts-${item.alertType}-content`">
          <ConnectI18nHelper
            as="p"
            :translation-path="`businessAlert.${item.alertType}.content`"
            :date="item.date"
            data-testid="business-alerts-content-text"
          />
          <i18n-t
            v-for="content, i in item.contentExtra"
            :key="`contentExtra-${i}`"
            :keypath="`businessAlert.${item.alertType}.contentExtra.${content.path}`"
            tag="p"
            scope="global"
            data-testid="business-alerts-content-extra-text"
          >
            <template #link>
              <UButton
                :to="$t(`businessAlert.${item.alertType}.contentExtra.${content.link?.to}`)"
                variant="link"
                class="underline p-0 text-small gap-1"
              >
                {{ $t(`businessAlert.${item.alertType}.contentExtra.${content.link?.path}`) }}
              </UButton>
            </template>
          </i18n-t>
          <BusinessHelpContact v-if="item.showContact" hide-header />
        </div>
      </template>
    </UAccordion>
  </div>
</template>
