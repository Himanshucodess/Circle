import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Type, AlignLeft, Hash, List, CircleDot, CheckSquare, ListChecks, Calendar, Trash2, Plus } from "lucide-react"

export interface OptionItem {
  label: string
  value: string
}

export interface FieldFormState {
  label: string
  key: string
  type: string
  description: string
  config: {
    required: boolean
    placeholder: string
    helpText: string
    min: string
    max: string
    minLength: string
    maxLength: string
    step: string
    unit: string
    options: OptionItem[]
  }
}

export const emptyFieldForm = (type = "TEXT"): FieldFormState => ({
  label: "",
  key: "",
  type,
  description: "",
  config: {
    required: false,
    placeholder: "",
    helpText: "",
    min: "",
    max: "",
    minLength: "",
    maxLength: "",
    step: "",
    unit: "",
    options: [],
  },
})

const hasOptions = (type: string) => ["SELECT", "RADIO", "MULTI_SELECT"].includes(type as any)

const TYPE_META: Record<string, { label: string; desc: string; icon: any }> = {
  TEXT: { label: "Text", desc: "Single line", icon: Type },
  TEXTAREA: { label: "Long text", desc: "Multi-line", icon: AlignLeft },
  NUMBER: { label: "Number", desc: "Numeric + unit", icon: Hash },
  SELECT: { label: "Dropdown", desc: "Single choice", icon: List },
  RADIO: { label: "Radio", desc: "Single choice visible", icon: CircleDot },
  CHECKBOX: { label: "Checkbox", desc: "Yes / No", icon: CheckSquare },
  MULTI_SELECT: { label: "Multi-select", desc: "Multiple choices", icon: ListChecks },
  DATE: { label: "Date", desc: "Calendar picker", icon: Calendar },
}

export function FieldConfigEditor({
  form,
  onChange,
}: {
  form: FieldFormState
  onChange: (updated: FieldFormState) => void
}) {
  const setField = (patch: Partial<FieldFormState>) => onChange({ ...form, ...patch })
  const setConfig = (patch: Partial<FieldFormState["config"]>) => setField({ config: { ...form.config, ...patch } })

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label>Label *</Label>
          <Input
            value={form.label}
            placeholder="e.g. Battery Health"
            onChange={(e) => {
              const label = e.target.value
              // auto key if empty or matches previous label slug
              setField({ label })
            }}
          />
          <p className="text-xs text-muted-foreground">Human-readable name shown to sellers.</p>
        </div>

        <div className="space-y-1.5">
          <Label>Key *</Label>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-xl border bg-muted px-3 text-xs text-muted-foreground">attributes.</span>
            <Input
              value={form.key}
              placeholder="battery_health"
              onChange={(e) => setField({ key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
              className="flex-1 font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">Lowercase, underscores only. Used in API & JSONB.</p>
        </div>

        <div className="space-y-2">
          <Label>Field type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(TYPE_META).map(([t, meta]) => {
              const active = form.type === t
              const Icon = meta.icon
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField({ type: t })}
                  className={`rounded-xl border p-3 text-left hover:border-primary/50 transition-colors ${active ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card"}`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${active ? "text-white" : "text-muted-foreground"}`} />
                  <div className={`text-xs font-semibold ${active ? "text-white" : ""}`}>{meta.label}</div>
                  <div className={`text-[11px] ${active ? "text-white/70" : "text-muted-foreground"}`}>{meta.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            placeholder="Help text — e.g. 'Enter the battery health percentage (0-100)'"
            onChange={(e) => setField({ description: e.target.value })}
            rows={2}
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-accent">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={form.config.required}
            onChange={(e) => setConfig({ required: e.target.checked })}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Required field</div>
            <div className="text-xs text-muted-foreground">Sellers must fill this before publishing</div>
          </div>
          {form.config.required && <Badge variant="red" className="ml-auto">Required</Badge>}
        </label>

        <div className="space-y-1.5">
          <Label>Placeholder</Label>
          <Input value={form.config.placeholder} placeholder="e.g. 85%" onChange={(e) => setConfig({ placeholder: e.target.value })} />
        </div>
      </div>

      {form.type === "NUMBER" && (
        <Card className="p-4 bg-muted/30">
          <div className="text-sm font-medium mb-3">Number settings</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Min</Label>
              <Input type="number" value={form.config.min} onChange={(e) => setConfig({ min: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Max</Label>
              <Input type="number" value={form.config.max} onChange={(e) => setConfig({ max: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input value={form.config.unit} placeholder="% · km · kg" onChange={(e) => setConfig({ unit: e.target.value })} />
            </div>
          </div>
        </Card>
      )}

      {(form.type === "TEXT" || form.type === "TEXTAREA") && (
        <Card className="p-4 bg-muted/30">
          <div className="text-sm font-medium mb-3">Text constraints</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Min length</Label>
              <Input type="number" value={form.config.minLength} onChange={(e) => setConfig({ minLength: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Max length</Label>
              <Input type="number" value={form.config.maxLength} onChange={(e) => setConfig({ maxLength: e.target.value })} />
            </div>
          </div>
        </Card>
      )}

      {hasOptions(form.type) && (
        <OptionsEditor options={form.config.options} onChange={(options) => setConfig({ options })} />
      )}
    </div>
  )
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: OptionItem[]
  onChange: (o: OptionItem[]) => void
}) {
  const setOption = (i: number, patch: Partial<OptionItem>) => {
    const next = options.slice()
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Options</span>
        <Badge variant="secondary">{options.length} items</Badge>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Label — e.g. 64GB" value={opt.label} onChange={(e) => setOption(i, { label: e.target.value })} className="flex-1" />
            <Input placeholder="Value — e.g. 64" value={opt.value} onChange={(e) => setOption(i, { value: e.target.value })} className="flex-1 font-mono" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onChange(options.filter((_, x) => x !== i))}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" className="w-full rounded-full mt-2" onClick={() => onChange([...options, { label: "", value: "" }])}>
          <Plus className="w-4 h-4" /> Add option
        </Button>
        <p className="text-xs text-muted-foreground">Label is shown to users; value is stored. Both required.</p>
      </div>
    </Card>
  )
}

export function buildFieldPayload(form: FieldFormState) {
  const c = form.config
  const config: Record<string, unknown> = {
    required: c.required,
    ...(c.placeholder ? { placeholder: c.placeholder } : {}),
    ...(c.helpText ? { helpText: c.helpText } : {}),
    ...(c.min !== "" ? { min: Number(c.min) } : {}),
    ...(c.max !== "" ? { max: Number(c.max) } : {}),
    ...(c.minLength !== "" ? { minLength: Number(c.minLength) } : {}),
    ...(c.maxLength !== "" ? { maxLength: Number(c.maxLength) } : {}),
    ...(c.unit ? { unit: c.unit } : {}),
  }

  if (hasOptions(form.type)) {
    config.options = c.options
      .filter((o) => o.label.trim() !== "" && o.value.trim() !== "")
      .map((o) => ({ label: o.label.trim(), value: o.value.trim() }))
  }

  return {
    label: form.label,
    key: form.key,
    type: form.type,
    description: form.description || null,
    config,
  }
}
