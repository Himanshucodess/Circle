import { useController, Control } from "react-hook-form";
import { SchemaField, Option } from "@marketplace/shared";

interface FieldProps {
  field: SchemaField;
  control: Control<any>;
}

export function MultiSelectField({ field, control }: FieldProps) {
  const { field: rhf, fieldState } = useController({
    name: field.key,
    control,
    defaultValue: field.defaultValue ?? [],
  });

  const values: string[] = Array.isArray(rhf.value) ? rhf.value : [];

  const toggle = (opt: Option) => {
    if (values.includes(opt.value)) {
      rhf.onChange(values.filter((v) => v !== opt.value));
    } else {
      rhf.onChange([...values, opt.value]);
    }
  };

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {field.helpText && <p className="text-xs text-gray-400 mb-2">{field.helpText}</p>}
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((opt) => {
          const isChecked = values.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => toggle(opt)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isChecked
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-brand-400"
              }`}
            >
              {isChecked && <span>✓</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
      {fieldState.error && (
        <p className="mt-1 text-xs text-red-500">{fieldState.error.message as string}</p>
      )}
    </div>
  );
}
