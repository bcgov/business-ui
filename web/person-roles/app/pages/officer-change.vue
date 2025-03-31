<script setup lang="ts">
const state = ref({
  name: {
    first: '',
    middle: '',
    last: ''
  }
  // roles: [],
  // mailingAddress: {
  //   street: '',
  //   streetAdditional: '',
  //   city: '',
  //   region: '',
  //   postalCode: '',
  //   country: '',
  //   locationDescription: ''
  // },
  // deliveryAddress: {
  //   street: '',
  //   streetAdditional: '',
  //   city: '',
  //   region: '',
  //   postalCode: '',
  //   country: '',
  //   locationDescription: ''
  // }
})

const items = [
  { label: 'Chief Executive Officer', value: 'ceo' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Chief Financial Officer', value: 'cfo' },
  { label: 'Secretary', value: 'secretary' },
  { label: 'President', value: 'president' },
  { label: 'Assistant Secretary', value: 'assistant-secretary' },
  { label: 'Vice President', value: 'vp' },
  { label: 'Other Office(s)', value: 'other' },
  { label: 'Chair', value: 'chair' }
]

const roles = ref([])

watchEffect(() => console.log(roles.value))
</script>

<template>
  <div class="py-10 space-y-10">
    <h1>Officer Change</h1>

    <UForm
      :state
      class="bg-white rounded-sm p-6 max-w-4xl mx-auto"
    >
      <div class="flex flex-col sm:flex-row gap-6">
        <h2 class="w-1/4 font-bold text-bcGovGray-900 text-base">
          Add Officer
        </h2>
        <div class="flex flex-col gap-8">
          <FormSection
            label="Name"
            :invalid="false"
          >
            <div class="flex flex-col gap-4 sm:flex-row">
              <UFormField
                v-slot="{ error }"
                name="name.first"
                class="grow flex-1"
              >
                <FormInput
                  id="first-name"
                  v-model="state.name.first"
                  required
                  :invalid="!!error"
                  label="First Name"
                />
              </UFormField>
              <UFormField
                v-slot="{ error }"
                name="name.middle"
                class="grow flex-1"
              >
                <FormInput
                  id="middle-name"
                  v-model="state.name.middle"
                  :invalid="!!error"
                  label="Middle Name (Optional)"
                />
              </UFormField>
              <UFormField
                v-slot="{ error }"
                name="name.last"
                class="grow flex-1"
              >
                <FormInput
                  id="last-name"
                  v-model="state.name.last"
                  required
                  :invalid="!!error"
                  label="Last Name"
                />
              </UFormField>
            </div>
          </FormSection>

          <FormSection
            label="Roles"
            :invalid="false"
          >
            <FormCheckboxGroup
              v-model="roles"
              :items
            />
          <!-- <div class="flex flex-col gap-4 sm:flex-row">
            <UFormField
              v-slot="{ error }"
              name="name.first"
              class="grow flex-1"
            >
              <FormInput
                id="first-name"
                v-model="state.name.first"
                required
                :invalid="!!error"
                label="First Name"
              />
            </UFormField>
            <UFormField
              v-slot="{ error }"
              name="name.middle"
              class="grow flex-1"
            >
              <FormInput
                id="middle-name"
                v-model="state.name.middle"
                :invalid="!!error"
                label="Middle Name (Optional)"
              />
            </UFormField>
            <UFormField
              v-slot="{ error }"
              name="name.last"
              class="grow flex-1"
            >
              <FormInput
                id="last-name"
                v-model="state.name.last"
                required
                :invalid="!!error"
                label="Last Name"
              />
            </UFormField>
          </div> -->
          </FormSection>
        </div>
      </div>
    </UForm>
  </div>
</template>
