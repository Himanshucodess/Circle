import { useController, Control } from "react-hook-form";
import { SchemaField } from "@marketplace/shared";
import { Textarea } from "../ui/Textarea";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function TextareaField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ?? "",
  });

  return (
    <Textarea
      id={field.key}
      label={field.label}
      placeholder={field.placeholder}
      hint={field.helpText}
      error={fieldState.error?.message as string | undefined}
      value={rhf.value as string}
      onChange={rhf.onChange}
      onBlur={rhf.onBlur}
      name={rhf.name}
    />
  );
}
