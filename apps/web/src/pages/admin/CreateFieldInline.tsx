import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { emptyFieldForm, FieldConfigEditor, buildFieldPayload, FieldFormState } from "./FieldConfigEditor"
import { createField } from "@/services/adminApi"
import { Sparkles, AlertTriangle } from "lucide-react"

export function CreateFieldInline({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (fieldId: string) => void
}) {
  const [form, setForm] = useState<FieldFormState>(emptyFieldForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (!form.label.trim() || !form.key.trim()) {
      setErr("Label and key are required.")
      return
    }
    if (["SELECT","RADIO","MULTI_SELECT"].includes(form.type) && form.config.options.filter(o=>o.label && o.value).length === 0) {
      setErr("Add at least one option for this type.")
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const field = await createField(buildFieldPayload(form))
      onCreated(field.id)
    } catch (e: any) {
      setErr(e.message || "Failed to create field.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto" onClose={onCancel}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Create New Field</DialogTitle>
          <DialogDescription>Define a reusable field that can be attached to any category. Keys must be unique.</DialogDescription>
        </DialogHeader>
        {err && <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {err}</div>}
        <FieldConfigEditor form={form} onChange={setForm} />
        <div className="flex justify-end gap-2 mt-6 sticky bottom-0 bg-card pt-4 border-t -mx-6 px-6">
          <Button variant="outline" className="rounded-full" onClick={onCancel}>Cancel</Button>
          <Button onClick={submit} loading={saving} className="rounded-full">Create Field</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
