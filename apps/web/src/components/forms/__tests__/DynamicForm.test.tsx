import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DynamicForm } from "../DynamicForm";
import { CategorySchema } from "@marketplace/shared";

function makeSchema(fields: any[]): CategorySchema {
  return {
    category: { id: "c1", name: "Test", slug: "test", icon: "🧪" },
    schemaVersionId: "v1",
    version: 1,
    fields,
  };
}

describe("DynamicForm", () => {
  it("renders text field", async () => {
    const schema = makeSchema([
      { id: "f1", key: "brand", label: "Brand", type: "TEXT", required: true, validation: {}, placeholder: "e.g. Apple" },
    ]);
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    expect(screen.getByLabelText("Brand")).toBeInTheDocument();
  });

  it("renders select", async () => {
    const schema = makeSchema([
      {
        id: "f2",
        key: "storage",
        label: "Storage",
        type: "SELECT",
        required: true,
        validation: {},
        options: [
          { label: "128GB", value: "128gb" },
          { label: "256GB", value: "256gb" },
        ],
      },
    ]);
    render(<DynamicForm schema={schema} onSubmit={() => {}} />);
    expect(screen.getByLabelText("Storage")).toBeInTheDocument();
    expect(screen.getByText("128GB")).toBeInTheDocument();
  });

  it("renders number with validation", async () => {
    const schema = makeSchema([
      { id: "f3", key: "batteryHealth", label: "Battery Health", type: "NUMBER", required: true, validation: { min: 0, max: 100 } },
    ]);
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/Battery Health/i);
    await userEvent.type(input, "150");
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(await screen.findByText(/at most 100/i)).toBeInTheDocument();
  });

  it("shows required validation", async () => {
    const schema = makeSchema([
      { id: "f1", key: "brand", label: "Brand", type: "TEXT", required: true, validation: {} },
    ]);
    render(<DynamicForm schema={schema} onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(await screen.findByText(/Brand is required/i)).toBeInTheDocument();
  });

  it("handles conditional field visibility", async () => {
    const schema = makeSchema([
      {
        id: "f1",
        key: "underWarranty",
        label: "Under Warranty",
        type: "RADIO",
        required: true,
        validation: {},
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
      {
        id: "f2",
        key: "warrantyExpiry",
        label: "Warranty Expiry",
        type: "DATE",
        required: true,
        validation: {},
        conditionalRule: { field: "underWarranty", operator: "equals", value: "true" },
      },
    ]);
    render(<DynamicForm schema={schema} onSubmit={() => {}} />);
    // Initially no warrantyExpiry (hidden)
    expect(screen.queryByLabelText("Warranty Expiry")).not.toBeInTheDocument();
    // Select Yes -> should appear
    const yes = screen.getByLabelText("Yes");
    await userEvent.click(yes);
    expect(await screen.findByLabelText("Warranty Expiry")).toBeInTheDocument();
    // Select No -> should hide again
    const no = screen.getByLabelText("No");
    await userEvent.click(no);
    await waitFor(() => expect(screen.queryByLabelText("Warranty Expiry")).not.toBeInTheDocument());
  });

  it("bicycle extensibility — renders new category fields without code change", async () => {
    const schema = makeSchema([
      { id: "1", key: "brand", label: "Brand", type: "TEXT", required: true, validation: {} },
      { id: "2", key: "frame_size", label: "Frame Size", type: "SELECT", required: true, validation: {}, options: [{ label: "Small", value: "small" }, { label: "Medium", value: "medium" }] },
      { id: "3", key: "wheel_size", label: "Wheel Size", type: "SELECT", required: true, validation: {}, options: [{ label: "29 inch", value: "29" }] },
      { id: "4", key: "gear_count", label: "Gear Count", type: "NUMBER", required: true, validation: { min: 1, max: 30 } },
      { id: "5", key: "frame_material", label: "Frame Material", type: "SELECT", required: true, validation: {}, options: [{ label: "Carbon", value: "carbon" }] },
    ]);
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    expect(screen.getByLabelText("Brand")).toBeInTheDocument();
    expect(screen.getByLabelText("Frame Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Wheel Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Gear Count")).toBeInTheDocument();
    expect(screen.getByLabelText("Frame Material")).toBeInTheDocument();
    // Fill and submit
    await userEvent.type(screen.getByLabelText("Brand"), "Trek");
    await userEvent.selectOptions(screen.getByLabelText("Frame Size"), "medium");
    await userEvent.selectOptions(screen.getByLabelText("Wheel Size"), "29");
    await userEvent.type(screen.getByLabelText("Gear Count"), "21");
    await userEvent.selectOptions(screen.getByLabelText("Frame Material"), "carbon");
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
