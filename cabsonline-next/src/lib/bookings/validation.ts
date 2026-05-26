export type BookingFormValues = {
  customer_name: string;
  phone: string;
  unit_number: string;
  street_number: string;
  street_name: string;
  pickup_suburb: string;
  destination_suburb: string;
  pickup_date: string;
  pickup_time: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
};

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

const digitsOnly = /^\d+$/;

export function validateBookingForm(values: BookingFormValues) {
  const errors: BookingFormErrors = {};

  if (!values.customer_name.trim()) {
    errors.customer_name = "Customer name is required.";
  } else if (values.customer_name.trim().length > 100) {
    errors.customer_name = "Customer name must be 100 characters or less.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10,12}$/.test(values.phone.trim())) {
    errors.phone = "Phone number must be 10 to 12 digits.";
  }

  if (values.unit_number.trim()) {
    if (!digitsOnly.test(values.unit_number.trim())) {
      errors.unit_number = "Unit number must contain digits only.";
    } else if (values.unit_number.trim().length > 10) {
      errors.unit_number = "Unit number must be 10 digits or less.";
    }
  }

  if (!values.street_number.trim()) {
    errors.street_number = "Street number is required.";
  } else if (!digitsOnly.test(values.street_number.trim())) {
    errors.street_number = "Street number must contain digits only.";
  } else if (values.street_number.trim().length > 10) {
    errors.street_number = "Street number must be 10 digits or less.";
  }

  if (!values.street_name.trim()) {
    errors.street_name = "Street name is required.";
  } else if (values.street_name.trim().length > 50) {
    errors.street_name = "Street name must be 50 characters or less.";
  }

  if (values.pickup_suburb.trim().length > 50) {
    errors.pickup_suburb = "Pickup suburb must be 50 characters or less.";
  }

  if (values.destination_suburb.trim().length > 50) {
    errors.destination_suburb = "Destination suburb must be 50 characters or less.";
  }

  if (!values.pickup_date) {
    errors.pickup_date = "Pickup date is required.";
  }

  if (!values.pickup_time) {
    errors.pickup_time = "Pickup time is required.";
  }

  if (values.pickup_date && values.pickup_time) {
    const pickupAt = new Date(`${values.pickup_date}T${values.pickup_time}`);
    const currentMinute = new Date();
    currentMinute.setSeconds(0, 0);

    if (Number.isNaN(pickupAt.getTime()) || pickupAt < currentMinute) {
      errors.pickup_time = "Pickup date and time must not be in the past.";
    }
  }

  return errors;
}

export function hasBookingFormErrors(errors: BookingFormErrors) {
  return Object.keys(errors).length > 0;
}

export function nullableText(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "=") {
    return null;
  }

  return trimmed;
}
