import { SchemaField } from "@marketplace/shared";

export function formatAttributeValue(field: SchemaField, rawValue: unknown): string {
  if (rawValue === undefined || rawValue === null || rawValue === "") return "—";

  switch (field.type) {
    case "SELECT":
    case "RADIO": {
      const opt = (field.options ?? []).find(
        (o) => String(o.value) === String(rawValue) || o.label === String(rawValue)
      );
      return opt ? opt.label : String(rawValue);
    }
    case "CHECKBOX": {
      const truthy = rawValue === true || rawValue === 1 || rawValue === "true";
      return truthy ? "Yes" : "No";
    }
    case "MULTI_SELECT": {
      const values = Array.isArray(rawValue) ? rawValue : [];
      return values
        .map((v) => {
          const opt = (field.options ?? []).find((o) => String(o.value) === String(v));
          return opt ? opt.label : String(v);
        })
        .join(", ");
    }
    case "DATE": {
      const d = new Date(String(rawValue));
      if (Number.isNaN(d.getTime())) return String(rawValue);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    }
    case "NUMBER": {
      const num = Number(rawValue);
      if (Number.isNaN(num)) return String(rawValue);
      const unit = field.unit ? ` ${field.unit.trim()}` : "";
      return `${num}${unit}`;
    }
    default:
      return String(rawValue);
  }
}
