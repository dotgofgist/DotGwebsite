import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  href?: string;
};

export function DashboardStatCard({
  label,
  value,
  description,
  href,
}: DashboardStatCardProps) {
  const content = (
    <Card className="h-full bg-surface">
      <CardContent className="space-y-3 p-5">
        <p className="text-sm text-neutral-400">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
        {description ? (
          <p className="text-sm leading-6 text-neutral-400">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link className="block rounded-lg focus-visible:outline-primary" href={href}>
        {content}
      </Link>
    );
  }

  return content;
}
