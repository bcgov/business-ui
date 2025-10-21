<script setup lang="ts">
import { toPacificDateTime } from '#imports'

const isCommentOpen = ref(false)

const filing = inject<BusinessLedgerItem>('filing')!

const { comments } = useBusinessLedger(filing)

const isDisableNonBenCorps = () => false
const isAuthorizedDetailComments = false

const showCommentDialog = (show: boolean) => {
  isCommentOpen.value = show
}
</script>

<template>
  <div data-testid="comments-list">
    <div class="flex gap-2">
      <div>
        <strong class="flex justify-items-center">
          <UIcon
            class="mt-1"
            name="i-mdi-message-text-outline"
            size="large"
          />
          <span class="ml-1">
            {{ $t('label.details') }} ({{ comments.length || 0 }})</span>
        </strong>
      </div>
      <div class="ml-auto pr-2 order-2">
        <UButton
          v-if="!isDisableNonBenCorps() && isAuthorizedDetailComments"
          class="rounded-sm px-3 py-2"
          :disabled="!filing.filingId"
          @click="showCommentDialog(true)"
        >
          <span>{{ $t('label.addDetail') }}</span>
        </UButton>
      </div>
    </div>
    <!-- the detail comments list -->
    <div class="mt-3 flex flex-col gap-5 text-sm" data-testid="detail-comments-list">
      <div
        v-for="(comment, index) in comments"
        :key="index"
        class="pl-0 pr-0 detail-body"
      >
        <div class="flex flex-col gap-0.5">
          <div class="body-2">
            <strong v-if="!isAuthorizedDetailComments">{{ $t('label.bcRegistriesStaff') }}</strong>
            <strong v-else>{{ comment.submitterDisplayName || 'N/A' }}</strong>
            ({{ toPacificDateTime(new Date(comment.timestamp)) || $t('label.unknown') }})
          </div>
          <div class="body-2">
            <div class="whitespace-pre-line break-words">
              {{ comment.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
