<script setup lang="ts">
import type { Form, FormError } from '@nuxt/ui'
import { UForm } from '#components'

const model = defineModel<PartyRoleSchema>({ required: true })

const { allowedRoles, roleClass } = defineProps<{
  allowedRoles: RoleTypeUi[]
  name?: string
  roleClass?: RoleClass
}>()

const { t } = useNuxtApp().$i18n

const partyRoleSchema = getPartyRoleSchema()

const formRef = useTemplateRef<Form<PartyRoleSchema>>('party-roles-form')
const formErrors = computed<FormError[] | undefined>(() => formRef.value?.getErrors())

const selectedRoles = computed({
  get() {
    return model.value.filter(role => !role.cessationDate).map(role => role.roleType)
  },
  set(newValue) {
    handleRoleChange(newValue)
  }
})

const selectableRoles = computed(() => allowedRoles.map(
  role => ({ label: t(`roleType.${role}`), value: role })
))

function handleRoleChange(newRoles: RoleTypeUi[]) {
  const todayUtc = getToday()
  const before = selectedRoles.value
  const after = newRoles

  const addedRoles = after.filter(role => !before.includes(role))
  const removedRoles = before.filter(role => !after.includes(role))

  addedRoles.forEach((role) => {
    const existingRole = model.value.find(selectedRole => selectedRole.roleType === role)
    if (existingRole?.cessationDate) {
      delete existingRole.cessationDate
    } else {
      model.value.push({
        roleType: role,
        ...(roleClass ? { roleClass } : {})
      })
    }
  })

  removedRoles.forEach((role) => {
    const existingRole = model.value.find(selectedRole => selectedRole.roleType === role)

    if (existingRole && existingRole.appointmentDate) {
      if (!existingRole?.cessationDate) {
        existingRole.cessationDate = todayUtc
      }
    } else if (existingRole) {
      // newly added so remove from the list instead of adding cessation date
      model.value = model.value.filter(selectedRole => selectedRole.roleType !== role)
    }
  })
}

// Clear roles validation error when selecting roles
// 'blur' wont clear errors for this field
watch(selectedRoles, (v) => {
  if (v.length) {
    formRef.value?.clear()
  }
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="party-roles-form"
    :schema="partyRoleSchema"
    nested
    :name
  >
    <ConnectFieldset
      :label="$t('label.roles')"
      :error="formErrors && formErrors[0]"
      :show-error-msg="true"
    >
      <UFormField
        id="party-roles"
        :ui="{ error: 'sr-only' }"
      >
        <UCheckboxGroup
          v-model="selectedRoles"
          data-testid="party-role-options"
          :items="selectableRoles"
          variant="card"
          size="lg"
          :ui="{
            fieldset: 'grid grid-cols-2 gap-4'
          }"
        />
      </UFormField>
    </ConnectFieldset>
  </UForm>
</template>
