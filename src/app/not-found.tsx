import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <AppShell title="Not found">
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Missing page</EmptyTitle>
          <EmptyDescription>That entity or route does not exist.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Back to entities</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </AppShell>
  );
}
