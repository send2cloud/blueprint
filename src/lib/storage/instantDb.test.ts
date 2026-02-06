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
        tx: {}
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (init as any).mockReturnValue(mockDb);

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

    it('saves artifacts to single blueprint_artifacts table', async () => {
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

        await adapter.saveArtifact(noteArtifact);

        expect(mockDb.transact).toHaveBeenCalled();
        const callArgs = mockDb.transact.mock.calls[0][0];
        expect(callArgs).toEqual(expect.objectContaining({
            op: 'update',
            table: 'blueprint_artifacts', // Single table for all artifacts
            id: 'note-1'
        }));
    });

    it('lists all artifacts from single table', async () => {
        mockDb.queryOnce.mockResolvedValue({
            data: {
                blueprint_artifacts: [
                    { id: 'n1', type: 'notes', name: 'Note 1', createdAt: '2026-01-01', updatedAt: '2026-01-01', schemaVersion: 1, favorite: false, pinned: false, data: {} },
                    { id: 'd1', type: 'diagram', name: 'Dia 1', createdAt: '2026-01-01', updatedAt: '2026-01-01', schemaVersion: 1, favorite: false, pinned: false, data: {} }
                ]
            }
        });

        const results = await adapter.listArtifacts();

        expect(results).toHaveLength(2);
        expect(results.find(a => a.id === 'n1')).toBeDefined();
        expect(results.find(a => a.id === 'd1')).toBeDefined();
    });

    it('filters artifacts by type using where clause', async () => {
        mockDb.queryOnce.mockResolvedValue({
            data: {
                blueprint_artifacts: [
                    { id: 'n1', type: 'notes', name: 'Note 1', createdAt: '2026-01-01', updatedAt: '2026-01-01', schemaVersion: 1, favorite: false, pinned: false, data: {} }
                ]
            }
        });

        const results = await adapter.listArtifacts('notes');

        expect(results).toHaveLength(1);
        expect(results[0].type).toBe('notes');
    });
});
