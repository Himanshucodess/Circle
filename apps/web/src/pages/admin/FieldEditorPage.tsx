import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminLayout } from "./AdminLayout"
import { emptyFieldForm, FieldConfigEditor, buildFieldPayload, FieldFormState } from "./FieldConfigEditor"
import { fetchField, createField, updateField } from "@/services/adminApi"
import { Button } from "@/components/ui/Button"
import { PageLoader } from "@/components/ui/Spinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react"

export function FieldEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [form, setForm] = useState<FieldFormState | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) {
      setForm(emptyFieldForm())
      return
    }
    let cancelled = false
    fetchField(id!)
      .then((f) => {
        if (cancelled) return
        setForm({
          label: f.label,
          key: f.key,
          type: f.type,
          description: f.description ?? "",
          config: {
            required: f.config?.required ?? false,
            placeholder: f.config?.placeholder ?? "",
            helpText: f.config?.helpText ?? "",
            min: f.config?.min !== undefined ? String(f.config.min) : "",
            max: f.config?.max !== undefined ? String(f.config.max) : "",
            minLength: f.config?.minLength !== undefined ? String(f.config.minLength) : "",
            maxLength: f.config?.maxLength !== undefined ? String(f.config.maxLength) : "",
            step: f.config?.step !== undefined ? String(f.config.step) : "",
            unit: f.config?.unit ?? "",
            options: f.config?.options?.map((o: any) => ({ label: o.label, value: o.value })) ?? [],
          },
        })
      })
      .catch((e: any) => setErr(e.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const save = async () => {
    if (!form) return
    if (!form.label.trim() || !form.key.trim()) {
      setErr("Label and key are required.")
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const payload = buildFieldPayload(form)
      if (isNew) {
        await createField(payload)
      } else {
        await updateField(id!, payload)
      }
      navigate("/admin/fields")
    } catch (e: any) {
      setErr(e.message || "Failed to save field.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-full" onClick={() => navigate("/admin/fields")}>
          <ArrowLeft className="w-4 h-4" /> Back to fields
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">{isNew ? "Create Field" : "Edit Field"}</h1>
            <p className="text-sm text-muted-foreground">Reusable across categories. One definition, many uses.</p>
          </div>
          {form && <Badge variant="secondary" className="ml-auto hidden sm:inline-flex font-mono">{form.type}</Badge>}
        </div>

        {loading && <PageLoader label="Loading field..." />}
        {err && <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {err}</div>}

        {form && !loading && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Field configuration</CardTitle>
                <CardDescription>Label, key and type are the foundation. Add constraints and options below.</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldConfigEditor form={form} onChange={setForm} />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" className="rounded-full" onClick={() => navigate("/admin/fields")}>Cancel</Button>
              <Button onClick={save} loading={saving} className="rounded-full px-6">Save Field</Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
