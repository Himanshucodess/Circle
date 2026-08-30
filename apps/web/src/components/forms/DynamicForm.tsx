import { useForm, FormProvider } from "react-hook-form"
import { CategorySchema } from "@marketplace/shared"
import { FieldRenderer } from "./FieldRenderer"
import { createResolver, getActiveFields } from "@/utils/formValidation"
import { Button } from "@/components/ui/Button"
import { AlertCircle } from "lucide-react"

interface DynamicFormProps {
  schema: CategorySchema
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void
  submitLabel?: string
  submitLoading?: boolean
  compact?: boolean
}

export function DynamicForm({
  schema,
  defaultValues,
  onSubmit,
  submitLabel = "Continue",
  submitLoading,
  compact,
}: DynamicFormProps) {
  const fields = schema.fields ?? []

  const methods = useForm({
    mode: "onTouched",
    shouldUnregister: true,
    defaultValues: defaultValues ?? {},
    resolver: createResolver(fields),
  })

  const { control, formState, watch, handleSubmit } = methods

  const values = watch()
  const activeFields = getActiveFields(fields, values)

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((v) => onSubmit(v as Record<string, unknown>))}
        className={compact ? "space-y-4" : "space-y-5"}
        noValidate
      >
        {activeFields.map((field) => (
          <div key={field.key} className="animate-in fade-in">
            <FieldRenderer field={field} control={control} />
          </div>
        ))}
        {activeFields.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed bg-muted/30">
            This category has no additional fields. You can publish directly.
          </div>
        )}

        {!compact && activeFields.length > 0 && (
          <div className="pt-3">
            <Button type="submit" className="w-full rounded-full h-11 text-[15px]" loading={submitLoading}>
              {submitLoading ? "Saving..." : submitLabel}
            </Button>
            {Object.keys(formState.errors).length > 0 && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4" /> Please fix the highlighted fields and try again.
              </p>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  )
}
