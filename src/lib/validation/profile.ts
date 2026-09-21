export function validateServiceCategories(categories: string[]): string | null {
  if (categories.length === 0) return "Select at least one service category.";
  return null;
}

export function validateServiceCity(city: string): string | null {
  if (!city.trim()) return "Enter your service city.";
  return null;
}

export function validateServiceState(state: string): string | null {
  if (!state.trim()) return "Select your service state.";
  return null;
}

export function validateYearsExperience(years: number): string | null {
  if (!Number.isFinite(years) || years < 0 || years > 50) {
    return "Enter a number of years between 0 and 50.";
  }
  return null;
}

// dailyRate is collected in rupees and converted to paise before it's sent.
export function validateDailyRate(rupees: number): string | null {
  if (!Number.isFinite(rupees) || rupees < 100 || rupees > 100000) {
    return "Enter a daily rate between ₹100 and ₹1,00,000.";
  }
  return null;
}

export function validateTotalHoursPerDay(hours: number): string | null {
  if (!Number.isFinite(hours) || hours < 4 || hours > 24) {
    return "Enter a shift length between 4 and 24 hours.";
  }
  return null;
}

// Hourly bookings only apply to a single day shorter than the shift, so the
// hourly rate is quoted per hour, in rupees, and converted to paise on save.
export function validateHourlyRate(rupees: number): string | null {
  if (!Number.isFinite(rupees) || rupees < 50 || rupees > 1000000) {
    return "Enter an hourly rate between ₹50 and ₹10,00,000.";
  }
  return null;
}

export function validateMinimumHours(hours: number, shiftHours: number): string | null {
  if (!Number.isInteger(hours) || hours < 1) return "Enter at least 1 hour.";
  if (Number.isFinite(shiftHours) && shiftHours > 0 && hours >= shiftHours) {
    return "Keep this below your shift length, or clients will never see hourly pricing.";
  }
  return null;
}

// Blank means "not offered". Amounts are a per-day add-on, in rupees.
export function validateVehicleAddOn(text: string): string | null {
  if (!text.trim()) return null;
  const rupees = Number(text);
  if (!Number.isFinite(rupees) || rupees < 0 || rupees > 500000) {
    return "Enter an amount between ₹0 and ₹5,00,000, or leave it blank.";
  }
  return null;
}

export function validateLicenceNumber(text: string): string | null {
  if (text.length > 50) return "Keep the licence number under 50 characters.";
  return null;
}
