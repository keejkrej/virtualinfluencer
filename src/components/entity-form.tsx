import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const fields: {
  name: string;
  label: string;
  description?: string;
  textarea?: boolean;
  rows?: number;
}[] = [
  { name: "name", label: "Name" },
  { name: "bio", label: "Bio", textarea: true, rows: 3 },
  {
    name: "personality",
    label: "Personality / voice",
    textarea: true,
    rows: 3,
    description: "How they speak. This becomes caption tone.",
  },
  {
    name: "canonicalDescription",
    label: "Canonical visual description",
    textarea: true,
    rows: 4,
    description: "Always-on identity lock for image prompts.",
  },
  { name: "faceNotes", label: "Face notes", textarea: true, rows: 3 },
  { name: "bodyNotes", label: "Body notes", textarea: true, rows: 3 },
  { name: "wardrobePalette", label: "Wardrobe palette", textarea: true, rows: 2 },
  { name: "styleDo", label: "Do", textarea: true, rows: 2 },
  { name: "styleDont", label: "Don't", textarea: true, rows: 2 },
  { name: "locale", label: "Locale" },
  { name: "timezone", label: "Timezone" },
  {
    name: "languages",
    label: "Languages",
    description: "Comma-separated, e.g. en, pt",
  },
];

export function EntityForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: Record<string, string>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl">
      <FieldGroup>
        {fields.map((field) => (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
            {field.textarea ? (
              <Textarea
                id={field.name}
                name={field.name}
                rows={field.rows}
                defaultValue={defaults?.[field.name] ?? ""}
                required={field.name === "name"}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                defaultValue={defaults?.[field.name] ?? ""}
                required={field.name === "name"}
              />
            )}
            {field.description ? (
              <FieldDescription>{field.description}</FieldDescription>
            ) : null}
          </Field>
        ))}
        <Button type="submit">{submitLabel}</Button>
      </FieldGroup>
    </form>
  );
}
