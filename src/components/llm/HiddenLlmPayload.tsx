import type { Artifact } from '../../lib/storage';

interface HiddenLlmPayloadProps {
  artifact?: Artifact | null;
}

export function HiddenLlmPayload({ artifact }: HiddenLlmPayloadProps) {
  if (!artifact) return null;

  const payload = {
    llm: {
      instructions:
        'This JSON block is for LLM context. Use it for high-level understanding. If you need full data, ask the user to export.',
      version: 1,
    },
    artifact: {
      id: artifact.id,
      type: artifact.type,
      name: artifact.name,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
      favorite: artifact.favorite,
      schemaVersion: artifact.schemaVersion,
    },
    summary: (artifact as any).llmSummary ?? null,
  };

  return (
    <script
      id="blueprint-llm"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
