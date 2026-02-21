
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "./SettingsPage";
import { loadDbConfig, saveDbConfig, initializeStorageAdapter } from '../lib/storage';
import { SidebarProvider } from '../components/ui/sidebar';
import { MemoryRouter } from "react-router-dom";

// Mock the storage module
vi.mock('../lib/storage', async () => {
    const actual = await vi.importActual('../lib/storage');
    return {
        ...actual,
        loadDbConfig: vi.fn(),
        saveDbConfig: vi.fn(),
        initializeStorageAdapter: vi.fn(),
        getStorageAdapter: vi.fn(() => ({
            listArtifacts: vi.fn().mockResolvedValue([]),
            getSettings: vi.fn().mockResolvedValue({}),
        })),
    };
});

// Mock the context
vi.mock('../contexts/BlueprintContext', () => ({
    useBlueprint: () => ({
        enabledTools: ["whiteboard"],
        toggleTool: vi.fn(),
        loading: false,
        getCurrentProject: vi.fn(() => ({ id: '00000000-0000-4000-8000-000000000000', name: 'Default', slug: 'default' })),
    }),
    useBlueprintState: () => ({
        enabledTools: ["whiteboard"],
        loading: false,
        storage: {
            listArtifacts: vi.fn().mockResolvedValue([]),
            getSettings: vi.fn().mockResolvedValue({}),
            saveSettings: vi.fn(),
        },
        projects: [{ id: 'default', name: 'Default', slug: 'default' }],
        currentProjectId: 'default',
        settings: { enabledTools: ['canvas', 'diagram', 'board', 'notes', 'calendar'] }
    }),
    useBlueprintActions: () => ({
        toggleTool: vi.fn(),
        getCurrentProject: vi.fn(() => ({ id: 'default', name: 'Default', slug: 'default' })),
        updateProject: vi.fn(),
    }),
}));

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
});

describe("SettingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <MemoryRouter>
                <SidebarProvider>
                    {ui}
                </SidebarProvider>
            </MemoryRouter>
        );
    };

    it("renders correctly", () => {
        (loadDbConfig as any).mockReturnValue({ provider: "local" });
        renderWithProviders(<SettingsPage />);
        expect(screen.getByText("Database Connection")).toBeInTheDocument();
    });

    it("masks the App ID by default", () => {
        (loadDbConfig as any).mockReturnValue({
            provider: "instantdb",
            instantAppId: "b7f9d8e2-1234-5678-9abc-def012345678"
        });

        renderWithProviders(<SettingsPage />);

        const input = screen.getByPlaceholderText("app_...");
        expect(input).toHaveValue("••••••••-••••-••••-••••-••••5678");
    });

    it("reveals App ID on focus", () => {
        (loadDbConfig as any).mockReturnValue({
            provider: "instantdb",
            instantAppId: "testing-id-123"
        });

        renderWithProviders(<SettingsPage />);
        const input = screen.getByPlaceholderText("app_...");

        fireEvent.focus(input);
        expect(input).toHaveValue("testing-id-123");

        fireEvent.blur(input);
        expect(input.getAttribute('value')).not.toBe("testing-id-123");
    });

    it("clears cache and saves new config when App ID changes", async () => {
        (loadDbConfig as any).mockReturnValue({
            provider: "instantdb",
            instantAppId: "old-id"
        });

        renderWithProviders(<SettingsPage />);

        // Simulate changing the ID
        const input = screen.getByPlaceholderText("app_...");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "new-id" } });

        // Check save button enabled?
        const saveBtn = screen.getByText("Save & Connect");
        await waitFor(() => {
            expect(saveBtn).not.toBeDisabled();
        });

        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(saveDbConfig).toHaveBeenCalledWith({
                provider: "instantdb",
                instantAppId: "new-id",
            });
        });
        expect(initializeStorageAdapter).toHaveBeenCalled();

        // Check reload called
        await waitFor(() => {
            expect(mockReload).toHaveBeenCalled();
        });
    });
});
