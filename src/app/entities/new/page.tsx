import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EntityForm } from "@/components/entity-form";
import { createEntity } from "@/app/actions/entities";

async function action(formData: FormData) {
  "use server";
  const id = await createEntity(formData);
  redirect(`/entities/${id}`);
}

export default function NewEntityPage() {
  return (
    <AppShell title="New entity">
      <p className="text-muted-foreground mb-4 max-w-2xl text-sm">
        Lock identity before you generate. The style bible is injected into every
        image prompt and caption draft.
      </p>
      <EntityForm action={action} submitLabel="Create entity" />
    </AppShell>
  );
}
