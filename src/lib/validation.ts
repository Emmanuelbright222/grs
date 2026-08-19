/**
 * Centralized Form & File Validation Utility
 */

export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): string | null {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } = options;

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return `Invalid file type. Allowed formats: ${allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ')}`;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size exceeds maximum limit of ${maxSizeMB}MB.`;
  }

  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number." };
  }
  return { isValid: true };
}
