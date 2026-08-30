import { SchemaField } from "@marketplace/shared"
import { formatAttributeValue } from "@/utils/formatValue"
import { Badge } from "@/components/ui/Badge"

interface DynamicProductAttributesProps {
  fields: SchemaField[]
  attributes: Record<string, unknown>
}

export function DynamicProductAttributes({ fields, attributes }: DynamicProductAttributesProps) {
  const visible = fields.filter((f) => attributes[f.key] !== undefined && attributes[f.key] !== null && attributes[f.key] !== "")

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">No additional details provided.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {visible.map((field) => (
        <div key={field.key} className="rounded-xl border bg-muted/30 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</span>
            {(field as any).required && <Badge variant="red" className="h-4 px-1 text-[10px]">req</Badge>}
          </div>
          <div className="text-sm font-semibold">{formatAttributeValue(field, attributes[field.key])}</div>
          {field.helpText && <div className="text-xs text-muted-foreground mt-0.5">{field.helpText}</div>}
        </div>
      ))}
    </div>
  )
}
