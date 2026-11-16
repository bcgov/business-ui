<script setup lang="ts">
/**
 * Warns a resumed draft that staff filings changed the company information since it was started.
 * - hidden until a draft is rebased (report loaded and not up to date)
 * - unknown base: the warning only, no list
 */
const { t, te } = useI18n()
const { report } = useDraftRebase()

const SECTION_ORDER: DraftChangesSection[] = [
  'business', 'parties', 'offices', 'shareClasses', 'nameTranslations', 'resolutions', 'courtOrders'
]

const title = computed(() => report.value?.upToDate === null
  ? t('draftRebase.alert.titleUnknownBase')
  : t('draftRebase.alert.title'))

/** The report's entity key in the user's words - office types and business fields are labelled, names shown as sent */
function getEntityLabel(section: DraftChangesSection, entityKey: string) {
  if (section === 'offices') {
    return te(`officeType.${entityKey}`) ? t(`officeType.${entityKey}`) : entityKey
  }
  if (section === 'business') {
    return entityKey === 'legalName' ? t('label.legalName') : t('label.businessType')
  }
  // a ' #<id>' suffix only disambiguates same-named rows in the report
  return entityKey.replace(/ #\d+$/, '')
}

/** Every entity the intervening filings changed, with what happened to it */
function getChangedEntities(changes: DraftChangesReport) {
  return [...changes.conflicts, ...changes.alreadyApplied, ...changes.absorbed]
    .map(({ section, entityKey, change }) => ({ section, entityKey, change }))
}

const sections = computed(() => {
  const changes = report.value
  if (!changes || changes.upToDate !== false) {
    return []
  }
  const entities = getChangedEntities(changes)
  return SECTION_ORDER
    .map(section => ({
      section,
      label: t(`draftRebase.section.${section}`),
      items: entities
        .filter(e => e.section === section)
        .map(e => t(`draftRebase.action.${e.change}`, { entity: getEntityLabel(section, e.entityKey) }))
    }))
    .filter(section => section.items.length > 0)
})
</script>

<template>
  <UAlert
    v-if="report && report.upToDate !== true"
    data-testid="draft-rebase-alert"
    color="warning"
    variant="subtle"
    icon="i-mdi-alert"
    :title
    :ui="{ description: 'opacity-100' }"
  >
    <template #description>
      <div class="space-y-4 my-5">
        <div
          v-for="section in sections"
          :key="section.section"
          class="space-y-2"
          :data-testid="`draft-rebase-alert-${section.section}`"
        >
          <p class="text-neutral-highlighted font-bold">
            {{ section.label }}
          </p>
          <ul class="list-disc pl-6 space-y-1">
            <li
              v-for="item in section.items"
              :key="item"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <p class="text-neutral-highlighted">
          {{ $t('draftRebase.alert.footer') }}
          <strong>{{ $t('draftRebase.alert.footerReview') }}</strong>
        </p>
      </div>
    </template>
  </UAlert>
</template>
