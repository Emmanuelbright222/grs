import { describe, it, expect } from "vitest";
import { 
  validateImageFile, 
  validateEmail, 
  validatePassword,
  ArtistFormSchema,
  ReleaseFormSchema
} from "./validation";

describe("Validation Utility Suite", () => {
  describe("ArtistFormSchema", () => {
    it("validates valid artist payload", () => {
      const result = ArtistFormSchema.safeParse({
        full_name: "John Doe",
        artist_name: "Johnny Rhythms",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid artist payload with short name or bad email", () => {
      const result = ArtistFormSchema.safeParse({
        full_name: "J",
        artist_name: "JR",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ReleaseFormSchema", () => {
    it("validates valid release payload", () => {
      const result = ReleaseFormSchema.safeParse({
        title: "Summer Vibes",
        artist_name: "Johnny Rhythms",
        release_date: "2026-09-01",
        type: "Single",
      });
      expect(result.success).toBe(true);
    });
  });
  describe("validateImageFile", () => {
    it("returns null for valid jpeg image under size limit", () => {
      const file = new File(["test image content"], "avatar.jpg", { type: "image/jpeg" });
      expect(validateImageFile(file)).toBeNull();
    });

    it("returns error for unsupported file type", () => {
      const file = new File(["pdf content"], "document.pdf", { type: "application/pdf" });
      expect(validateImageFile(file)).toContain("Invalid file type");
    });

    it("returns error when file size exceeds limit", () => {
      const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], "huge.png", { type: "image/png" });
      expect(validateImageFile(file, { maxSizeMB: 5 })).toContain("exceeds maximum limit");
    });
  });

  describe("validateEmail", () => {
    it("validates standard email address formats", () => {
      expect(validateEmail("artist@grs.com")).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
    });

    it("rejects invalid email address formats", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("missing@domain")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("accepts passwords satisfying strength requirements", () => {
      const result = validatePassword("StrongPass123!");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("enforces minimum length rule", () => {
      const result = validatePassword("Short1!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("at least 8 characters");
    });

    it("enforces uppercase requirement", () => {
      const result = validatePassword("lowercase123!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("uppercase letter");
    });

    it("enforces number requirement", () => {
      const result = validatePassword("NoNumberPass!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("at least one number");
    });
  });
});
