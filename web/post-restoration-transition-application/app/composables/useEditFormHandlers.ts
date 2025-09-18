const { scrollToAnchor } = useAnchorScroll({
  scrollOptions: {
    offsetTop: -25,
    behavior: 'smooth'
  }
})

export type FormHandlerAction = 'edit' | 'submit'

export const useEditFormHandlers = () => {
  const { openEditComponentId } = storeToRefs(usePostRestorationTransitionApplicationStore())
  const { openEditFormError } = storeToRefs(usePostRestorationErrorsStore())

  const scrollToOpenForm = (action: FormHandlerAction = 'edit') => {
    if (openEditComponentId?.value) {
      if (action === 'submit') {
        openEditFormError.value = 'errors.closeOpenFormBeforeSubmitting'
      } else {
        // both for edit and as default open form edit error
        openEditFormError.value = 'errors.closeOpenFormBeforeOtherChanges'
      }

      scrollToAnchor(openEditComponentId.value)
      return true
    } else {
      openEditFormError.value = undefined
      return false
    }
  }

  const editFormClosed = (formToCloseId: string) => {
    if (openEditComponentId.value === formToCloseId) {
      openEditComponentId.value = undefined
      openEditFormError.value = undefined
    } else {
      console.warn(`trying to close form: ${formToCloseId} but form: ${openEditComponentId.value} is open`)
    }
  }

  const editFormOpen = (formId: string, action: FormHandlerAction = 'edit') => {
    if (openEditComponentId.value) {
      return scrollToOpenForm(action)
    }

    openEditComponentId.value = formId
    return false
  }

  return {
    editFormClosed,
    editFormOpen,
    scrollToOpenForm
  }
}
