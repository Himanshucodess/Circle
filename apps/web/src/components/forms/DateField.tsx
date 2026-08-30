import { useController, Control } from "react-hook-form";
import { SchemaField } from "@marketplace/shared";
import { Input } from "../ui/Input";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function DateField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ? String(field.defaultValue).slice(0, 10) : "",
  });

  return (
    <Input
      id={field.key}
      type="date"
      label={field.label}
      hint={field.helpText}
      error={fieldState.error?.message as string | undefined}
      value={rhf.value as string}
      onChange={rhf.onChange}
      onBlur={rhf.onBlur}
      name={rhf.name}
    />
  );
}
