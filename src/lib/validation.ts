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

import { z } from "zod";

export const ArtistFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters."),
  artist_name: z.string().min(2, "Artist stage name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  genre: z.string().optional(),
  bio: z.string().optional(),
  phone_number: z.string().optional(),
  gender: z.string().optional(),
});

export const ReleaseFormSchema = z.object({
  title: z.string().min(1, "Release title is required."),
  artist_name: z.string().min(1, "Artist name is required."),
  release_date: z.string().min(1, "Release date is required."),
  genre: z.string().optional(),
  type: z.enum(["Single", "EP", "Album"]).default("Single"),
});

export type ArtistFormValues = z.infer<typeof ArtistFormSchema>;
export type ReleaseFormValues = z.infer<typeof ReleaseFormSchema>;
