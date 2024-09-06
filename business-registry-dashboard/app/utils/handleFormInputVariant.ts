// sets the form field to error variant if the form has errors or to bcGov if no errors
export function handleFormInputVariant (path: string, formErrors: FormPathError[] | undefined): 'error' | 'bcGovLg' {
  if (formErrors) {
    const hasError = formErrors.some((error: FormPathError) => error.path === path)
    return hasError ? 'error' : 'bcGovLg'
  } else {
    return 'bcGovLg'
  }
}
