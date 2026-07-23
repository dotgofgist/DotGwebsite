import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type RecentContentItem = {
  title: string;
  description?: string;
  href: string;
};

type RecentContentListProps = {
  title: string;
  items: RecentContentItem[];
};

export function RecentContentList({ title, items }: RecentContentListProps) {
  return (
    <Card className="bg-surface">
      <CardContent className="space-y-4 p-5">
        <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                className="block rounded-md border border-border bg-background p-3 hover:border-primary focus-visible:border-primary"
                href={item.href}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    {item.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
