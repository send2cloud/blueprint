import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstantDbAdapter } from './instantDb';
import { init } from '@instantdb/react';
import { Artifact } from './types';

// Mock InstantDB init
vi.mock('@instantdb/react', () => ({
    init: vi.fn(),
    tx: {
        settings: {
            [expect.any(String)]: { update: vi.fn() }
        }
    }
}));

describe('InstantDbAdapter', () => {
    let adapter: InstantDbAdapter;
    const mockDb = {
        queryOnce: vi.fn(),
        transact: vi.fn(),
        tx: {
            blueprint_notes: {
                "note-1": { update: vi.fn(), delete: vi.fn() }
            },
            blueprint_diagrams: {
                "dia-1": { update: vi.fn(), delete: vi.fn() }
            }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (init as any).mockReturnValue(mockDb);
        // We can't easily deep mock the dynamic tx building in the test setup without making it complex,
        // so we'll mock the specific chains we expect in the tests.

        // Improve tx mock to handle dynamic property access
        const txHandler = {
            get: function (target: any, prop: string) {
                return new Proxy({}, {
                    get: function (target, id) {
                        return {
                            update: vi.fn().mockReturnValue({ op: 'update', table: prop, id }),
                            delete: vi.fn().mockReturnValue({ op: 'delete', table: prop, id }),
                        };
                    }
                });
            }
        };
        mockDb.tx = new Proxy({}, txHandler);

        adapter = new InstantDbAdapter('test-app-id');
    });

    it('routes artifacts to specialized tables', async () => {
        const noteArtifact: Artifact = {
            id: 'note-1',
            type: 'notes',
            name: 'My Note',
            data: { content: 'Hello' },
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            schemaVersion: 1,
            favorite: false,
            pinned: false
        };

        // Initialize cache for this test so we don't hit "loadCache" issues
        // The adapter relies on localStorage for cache, which uses "window"
        // JSDOM should handle window.localStorage.

        await adapter.saveArtifact(noteArtifact);

        expect(mockDb.transact).toHaveBeenCalled();
        const callArgs = mockDb.transact.mock.calls[0][0];
        // Based on our proxy mock, callArgs should contain info about the table
        expect(callArgs).toEqual(expect.objectContaining({
            op: 'update',
            table: 'blueprint_notes', // IMPORTANT: checking it went to notes table
            id: 'note-1'
        }));
    });

    it('aggregates artifacts from all tables on list', async () => {
        mockDb.queryOnce.mockResolvedValue({
            data: {
                blueprint_notes: [{ id: 'n1', type: 'notes', name: 'Note 1' }],
                blueprint_diagrams: [{ id: 'd1', type: 'diagram', name: 'Dia 1' }],
                blueprint_canvases: [],
                blueprint_boards: []
            }
        });

        const results = await adapter.listArtifacts();

        expect(results).toHaveLength(2);
        expect(results.find(a => a.id === 'n1')).toBeDefined();
        expect(results.find(a => a.id === 'd1')).toBeDefined();
    });
});
