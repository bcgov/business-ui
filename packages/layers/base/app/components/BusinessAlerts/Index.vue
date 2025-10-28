<script setup lang="ts">
const props = defineProps<{
  alertInfo: {
    type: BusinessAlert
    date?: string
    days?: string | number
    hideContact?: boolean
  }[]
}>()

const { rt, t, tm } = useI18n()
const unknownText = `[${t('text.unknown')}]`

const parseContentExtra = (alert: BusinessAlert) => {
  const translations: unknown = tm(`businessAlert.${alert}.contentExtra`)
  if (translations instanceof Array) {
    return translations.map(translation => rt(translation))
  }
}

const alerts = computed((): BusinessAlertItem[] => props.alertInfo.map(alert => (
  {
    alertType: alert.type,
    contentExtra: parseContentExtra(alert.type) || [],
    days: alert.days,
    icon: 'i-mdi-alert',
    label: t(`businessAlert.${alert.type}.label`, { date: alert.date || unknownText }),
    showContact: !alert.hideContact,
    ui: { leadingIcon: 'text-warning' }
  }
)))
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
        <div class="space-y-3">
          <!-- NOTE: no user inputted values are used below -->
          <!-- eslint-disable-next-line vue/no-v-html  -->
          <p v-html="item.content" />
          <p>
            <ConnectI18nHelper
              :translation-path="`businessAlert.${item.alertType}.content`"
              :days="item.days"
            />
          </p>
          <p v-for="content, i in item.contentExtra" :key="`contentExtra-${i}`">
            {{ content }}
          </p>
          <BusinessHelpContact v-if="item.showContact" hide-header />
        </div>
      </template>
    </UAccordion>
  </div>
</template>
