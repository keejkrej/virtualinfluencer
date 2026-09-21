"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AssetUploadForm({ entityId }: { entityId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("entityId", entityId);
    setPending(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Upload failed");
      }
      toast.success("Asset saved");
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-4 md:items-end">
      <div className="grid gap-1">
        <Label htmlFor="file">File</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" name="tags" placeholder="scene, outfit, emotion" />
      </div>
      <label className="flex h-8 items-center gap-2 text-xs">
        <input type="checkbox" name="canonical" />
        Canonical reference
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
