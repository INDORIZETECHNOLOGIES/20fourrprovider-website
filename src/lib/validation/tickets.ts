export function validateTicketSubject(subject: string): string | null {
  const length = subject.trim().length;
  if (length < 5 || length > 100) return "Subject must be 5-100 characters.";
  return null;
}

export function validateTicketDescription(description: string): string | null {
  const length = description.trim().length;
  if (length < 10 || length > 1000) return "Description must be 10-1000 characters.";
  return null;
}

export function validateTicketMessage(message: string): string | null {
  if (!message.trim()) return "Write a message first.";
  if (message.length > 1000) return "Keep messages under 1000 characters.";
  return null;
}
