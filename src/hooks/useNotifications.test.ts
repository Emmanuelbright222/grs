import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "./useNotifications";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

describe("useNotifications Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty notifications when userId is undefined", async () => {
    const { result } = renderHook(() => useNotifications(undefined));
    expect(result.current.loading).toBe(false);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("fetches notifications for a given userId", async () => {
    const mockData = [
      { id: "1", user_id: "u1", title: "New Release", message: "Out now", read: false, created_at: "2026-08-19" },
      { id: "2", user_id: "u1", title: "Welcome", message: "Hello", read: true, created_at: "2026-08-18" },
    ];

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: mockData, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useNotifications("u1"));
    
    // Wait for effect to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.notifications.length).toBe(2);
    expect(result.current.unreadCount).toBe(1);
  });
});
