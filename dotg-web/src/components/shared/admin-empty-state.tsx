import { Card, CardContent } from "@/components/ui/card";

type AdminEmptyStateProps = {
  title: string;
  description: string;
};

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <Card className="bg-background">
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-400">{description}</p>
      </CardContent>
    </Card>
  );
}
