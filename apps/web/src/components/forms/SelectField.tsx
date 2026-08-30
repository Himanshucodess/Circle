import { useController, Control } from "react-hook-form";
import { SchemaField } from "@marketplace/shared";
import { Select } from "../ui/Select";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function SelectField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ?? "",
  });

  return (
    <Select
      id={field.key}
      label={field.label}
      hint={field.helpText}
      error={fieldState.error?.message as string | undefined}
      value={rhf.value as string}
      onChange={rhf.onChange}
      onBlur={rhf.onBlur}
      name={rhf.name}
    >
      <option value="">{field.placeholder ?? "Select..."}</option>
      {(field.options ?? []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
