
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventModal } from "./EventModal";
import { CalendarEvent } from "./types";

// Mock UI components
vi.mock("@/components/ui/dialog", () => ({
    Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <h2>{children}</h2>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/switch", () => ({
    Switch: ({ checked, onCheckedChange }: any) => (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
        >
            Toggle
        </button>
    ),
}));

vi.mock("@/components/ui/popover", () => ({
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children }: any) => <div>{children}</div>,
    PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
    Calendar: () => <div>Calendar</div>,
}));

vi.mock("@/components/ui/button", () => ({
    Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
}));

vi.mock("@/components/ui/input", () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
    Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
    Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

// Mock TagInput as it might be complex
vi.mock("@/components/tags/TagInput", () => ({
    TagInput: () => <div>TagInput</div>,
}));

describe("EventModal", () => {
    const mockOnSave = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnOpenChange = vi.fn();

    const defaultProps = {
        event: null,
        open: true,
        onOpenChange: mockOnOpenChange,
        onSave: mockOnSave,
        onDelete: mockOnDelete,
        isNew: true,
    };

    it("renders correctly for new event", () => {
        render(<EventModal {...defaultProps} />);
        expect(screen.getByText("New Event")).toBeInTheDocument();

        // Label mocking might change how we query, but text should be there
        expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("toggles all-day switch and shows time inputs", () => {
        render(<EventModal {...defaultProps} />);

        // Default is all day checked
        // We mocked Label, so we search by text
        expect(screen.queryByText("Start Time")).not.toBeInTheDocument();

        // Click switch
        const switchEl = screen.getByRole("switch");
        fireEvent.click(switchEl);

        // Now time inputs should appear
        expect(screen.getByText("Start Time")).toBeInTheDocument();
        expect(screen.getByText("End Time")).toBeInTheDocument();
    });

    it("combines date and time correctly on save", () => {
        render(<EventModal {...defaultProps} />);

        // Fill title
        // Input is mocked as simple input. We need to find it.
        // The Title input is the first input usually, or we can find by Label if we had IDs.
        // In EventModal.tsx: <Label>Title</Label><Input ... />
        // We can use placeholders if present.
        const inputs = screen.getAllByRole("textbox");
        // Wait, <Input> renders <input type="text"> by default which is textbox role.
        // But we mocked Input as <input {...props} />.

        // EventModal has:
        // 1. Title Input (placeholder "Event title")
        // 2. Textarea (role textbox)

        const titleInput = screen.getByPlaceholderText("Event title");
        fireEvent.change(titleInput, { target: { value: "Meeting" } });

        // Turn off all day
        fireEvent.click(screen.getByRole("switch"));

        // Set times
        // Start Time and End Time inputs appear. They are type="time".
        // We can query by type or surrounding label.
        // But since we mocked layout flatly, we might just look for inputs with type time.
        // But <Input type="time"> passed props.

        // We can just rely on ordering or unique props if any.
        // In EventModal, start time is first time input.

        // Let's refine the query.
        // <Label>Start Time</Label><Input type="time" ... />
        // But in our mock, they are siblings in a div? No, EventModal structure:
        // <div ...> <Label>...</Label> <div>...<Input></div> </div>

        // We can just query by display value since we set state?
        // "09:00" is default start time in component.

        const timeInputs = document.querySelectorAll('input[type="time"]');
        expect(timeInputs.length).toBe(2);

        fireEvent.change(timeInputs[0], { target: { value: "14:30" } });
        fireEvent.change(timeInputs[1], { target: { value: "15:30" } });

        // Save
        fireEvent.click(screen.getByText("Save"));

        expect(mockOnSave).toHaveBeenCalledTimes(1);
        const savedEvent = mockOnSave.mock.calls[0][0] as CalendarEvent;

        expect(savedEvent.title).toBe("Meeting");
        expect(savedEvent.allDay).toBe(false);

        // Check local time components
        expect(savedEvent.start.getHours()).toBe(14);
        expect(savedEvent.start.getMinutes()).toBe(30);
        expect(savedEvent.end.getHours()).toBe(15);
        expect(savedEvent.end.getMinutes()).toBe(30);
    });
});
