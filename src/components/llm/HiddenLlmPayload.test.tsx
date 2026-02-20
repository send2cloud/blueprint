import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HiddenLlmPayload } from './HiddenLlmPayload';
import type { Artifact } from '../../lib/storage';
import { CURRENT_SCHEMA_VERSION } from '../../lib/storage/schema';

describe("HiddenLlmPayload", () => {
  it("renders a hidden JSON script with artifact metadata", () => {
    const artifact: Artifact = {
      id: "a1",
      type: "notes",
      name: "Doc",
      data: { blocks: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      pinned: false,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };

    const { container } = render(<HiddenLlmPayload artifact={artifact} />);
    const script = container.querySelector("#blueprint-llm");
    expect(script).toBeTruthy();
    expect(script?.textContent).toContain("\"artifact\"");
    expect(script?.textContent).toContain("\"notes\"");
  });
});
