// sets the form field to error variant if the form has errors or to bcGov if no errors
export function handleFormInputVariant (path: string, formErrors: FormPathError[] | undefined): 'error' | 'bcGov' {
  if (formErrors) {
    const hasError = formErrors.some((error: FormPathError) => error.path === path)
    return hasError ? 'error' : 'bcGov'
  } else {
    return 'bcGov'
  }
}
