import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ShareButton } from './ShareButton';

vi.mock('../../contexts/BlueprintContext', () => ({
  useBlueprint: () => ({
    currentProjectId: null,
    settings: { mode: 'solo', enabledTools: ['notes'] },
    getCurrentProject: vi.fn(() => null),
  }),
}));

describe("ShareButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("copies link with LLM source instruction", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <ShareButton artifactId="abc" type="notes" />
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.click(getByText("Share"));
    });

    const writeText = (navigator.clipboard.writeText as unknown as ReturnType<typeof vi.fn>);
    expect(writeText).toHaveBeenCalled();
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain("Here is the link I want you to reference");
    expect(copied).toContain("blueprint-llm");
  });
});
