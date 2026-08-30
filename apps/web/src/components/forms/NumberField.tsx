import { useController, Control } from "react-hook-form";
import { SchemaField } from "@marketplace/shared";
import { Input } from "../ui/Input";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function NumberField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ?? "",
  });

  const label = field.unit && !field.unit.startsWith(" ") ? `${field.label} (${field.unit})` : field.label;

  return (
    <Input
      id={field.key}
      type="number"
      label={label}
      placeholder={field.placeholder ?? "0"}
      hint={field.helpText}
      error={fieldState.error?.message as string | undefined}
      value={(rhf.value as any) ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        rhf.onChange(v === "" ? "" : Number(v));
      }}
      onBlur={rhf.onBlur}
      name={rhf.name}
    />
  );
}
