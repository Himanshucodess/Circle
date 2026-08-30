import { Control } from "react-hook-form";
import type { SchemaField } from "@marketplace/shared";
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";
import { RadioField } from "./RadioField";
import { CheckboxField } from "./CheckboxField";
import { MultiSelectField } from "./MultiSelectField";
import { DateField } from "./DateField";

interface FieldRendererProps {
  field: SchemaField;
  control: Control<any>;
}

export function FieldRenderer({ field, control }: FieldRendererProps) {
  switch (field.type) {
    case "TEXT":
      return <TextField field={field} control={control} />;
    case "TEXTAREA":
      return <TextareaField field={field} control={control} />;
    case "NUMBER":
      return <NumberField field={field} control={control} />;
    case "SELECT":
      return <SelectField field={field} control={control} />;
    case "RADIO":
      return <RadioField field={field} control={control} />;
    case "CHECKBOX":
      return <CheckboxField field={field} control={control} />;
    case "MULTI_SELECT":
      return <MultiSelectField field={field} control={control} />;
    case "DATE":
      return <DateField field={field} control={control} />;
    default:
      return null;
  }
}
