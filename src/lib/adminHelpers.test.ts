import { describe, it, expect, vi } from "vitest";
import { deleteArtistProfile } from "./adminHelpers";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

describe("Admin Helpers Suite", () => {
  it("returns success true when RPC deletion succeeds", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const result = await deleteArtistProfile("test-user-id");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns error message when deletion fails", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: "Permission denied", details: "", hint: "", code: "403" },
      count: null,
      status: 403,
      statusText: "Forbidden",
    });

    vi.mocked(supabase.from).mockReturnValueOnce({
      delete: () => ({
        eq: vi.fn().mockResolvedValueOnce({
          data: null,
          error: { message: "Direct delete failed", details: "", hint: "", code: "403" },
        }),
      }),
    } as any);

    const result = await deleteArtistProfile("test-user-id");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Direct delete failed");
  });
});
