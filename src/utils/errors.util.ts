interface FieldError {
  field: string,
  message: string,
}

export interface FormError {
  heading: string,
  errors: FieldError[],
  errorMessage: string,
}
export const getDefaultChoiceError = (): FormError => ({
  heading: 'There is a problem',
  errors: [
    {
      field: 'postcode',
      message: 'Select yes if you can take more MOT bookings',
    },
  ],
  errorMessage: 'Select yes if you can take more MOT bookings',
});
