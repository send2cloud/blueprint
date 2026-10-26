
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
        projects: [{ id: '00000000-0000-4000-8000-000000000000', name: 'Default', slug: 'default' }],
        currentProjectId: '00000000-0000-4000-8000-000000000000',
        settings: { enabledTools: ['canvas', 'diagram', 'board', 'notes', 'calendar'] }
    }),
    useBlueprintActions: () => ({
        toggleTool: vi.fn(),
        getCurrentProject: vi.fn(() => ({ id: '00000000-0000-4000-8000-000000000000', name: 'Default', slug: 'default' })),
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
    };

    it("renders the backend picker", () => {
        (loadDbConfig as any).mockReturnValue(null);
        renderWithProviders(<SettingsPage />);
        expect(screen.getByText("Backend")).toBeInTheDocument();
        expect(screen.getByText("Browser only")).toBeInTheDocument();
    });

    it("shows InstantDB App ID field when saved config is InstantDB", () => {
        (loadDbConfig as any).mockReturnValue({ provider: 'instantdb', instantAppId: 'app_1', source: 'localStorage' });
        renderWithProviders(<SettingsPage />);
        expect(screen.getByLabelText("App ID")).toHaveValue('app_1');
    });

    it("hides the picker when config comes from the build", () => {
        (loadDbConfig as any).mockReturnValue({ provider: 'cloudflare', url: 'https://x.workers.dev', source: 'env' });
        renderWithProviders(<SettingsPage />);
        expect(screen.queryByText("Save & Connect")).not.toBeInTheDocument();
    });
});
