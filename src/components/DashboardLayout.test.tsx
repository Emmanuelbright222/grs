import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user", email: "admin@grs.com" } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: "admin" } }),
          single: vi.fn().mockResolvedValue({ data: { full_name: "Admin User", avatar_url: null } }),
        }),
      }),
    }),
  },
}));

describe("DashboardLayout Component", () => {
  it("renders page title and children content", async () => {
    render(
      <BrowserRouter>
        <DashboardLayout title="Overview Portal" subtitle="Manage label statistics">
          <div data-testid="dashboard-content">Dashboard Main View</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    expect(screen.getByText("Overview Portal")).toBeInTheDocument();
    expect(screen.getByText("Manage label statistics")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });
});
