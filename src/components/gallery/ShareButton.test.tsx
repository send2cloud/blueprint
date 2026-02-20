import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { ShareButton } from './ShareButton';

describe("ShareButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("copies link with LLM source instruction", async () => {
    const { getByText } = render(<ShareButton artifactId="abc" type="notes" />);
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
