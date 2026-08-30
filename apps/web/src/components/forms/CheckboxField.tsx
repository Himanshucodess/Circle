import { useController, Control } from "react-hook-form";
import { SchemaField } from "@marketplace/shared";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function CheckboxField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ?? false,
  });

  const checked = rhf.value === true || rhf.value === 1 || rhf.value === "true";

  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 px-3.5 py-3 hover:border-gray-300">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-brand-600"
          checked={checked}
          onChange={(e) => rhf.onChange(e.target.checked)}
          onBlur={rhf.onBlur}
          name={rhf.name}
        />
        <span>
          <span className="block text-sm font-medium text-gray-800">{field.label}</span>
          {field.helpText && <span className="block text-xs text-gray-400">{field.helpText}</span>}
        </span>
      </label>
      {fieldState.error && (
        <p className="mt-1 text-xs text-red-500">{fieldState.error.message as string}</p>
      )}
    </div>
  );
}
