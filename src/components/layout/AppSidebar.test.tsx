import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppSidebar } from './AppSidebar';
import { SidebarProvider } from '../ui/sidebar';

vi.mock('../../hooks/useArtifacts', () => ({
  useAllArtifacts: () => ({
    artifacts: [
      { id: "1", type: "notes", favorite: false },
      { id: "2", type: "notes", favorite: true },
      { id: "3", type: "diagram", favorite: false },
    ],
  }),
}));

vi.mock('../../contexts/BlueprintContext', () => ({
  useBlueprint: () => ({
    isToolEnabled: () => true,
    loading: false,
    settings: { enabledTools: ['canvas', 'diagram', 'board', 'notes', 'calendar'] },
    projects: [],
    currentProjectId: null,
    getCurrentProject: () => undefined,
  }),
}));

describe("AppSidebar", () => {
  it("shows counts next to tool names and favorites", () => {
    render(
      <MemoryRouter>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>
    );
    const docs = screen.getByText("Docs").parentElement;
    expect(docs).toBeTruthy();
    expect(within(docs as HTMLElement).getByText("2")).toBeTruthy();

    const flow = screen.getByText("Flow").parentElement;
    expect(flow).toBeTruthy();
    expect(within(flow as HTMLElement).getByText("1")).toBeTruthy();

    const favorites = screen.getByText("Favorites").parentElement;
    expect(favorites).toBeTruthy();
    expect(within(favorites as HTMLElement).getByText("1")).toBeTruthy();
  });
});
