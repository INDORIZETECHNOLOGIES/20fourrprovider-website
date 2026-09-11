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
