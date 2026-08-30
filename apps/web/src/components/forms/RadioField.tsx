import { useController, Control } from "react-hook-form";
import { SchemaField } from "@marketplace/shared";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function RadioField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ?? "",
  });

  const value = rhf.value;
  const selected = value === undefined || value === null ? "" : String(value);

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="space-y-2">
        {(field.options ?? []).map((opt) => {
          const isChecked = selected === String(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors ${
                isChecked ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                className="accent-brand-600"
                name={rhf.name}
                value={opt.value}
                checked={isChecked}
                onChange={() => rhf.onChange(opt.value)}
                onBlur={rhf.onBlur}
              />
              <span className="text-sm text-gray-800">{opt.label}</span>
            </label>
          );
        })}
      </div>
      {fieldState.error && (
        <p className="mt-1 text-xs text-red-500">{fieldState.error.message as string}</p>
      )}
    </div>
  );
}
