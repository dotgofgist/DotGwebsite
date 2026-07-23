import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicContactItems } from "@/features/settings/public-queries";

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export async function ContactCard() {
  const contactItems = await getPublicContactItems();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {contactItems.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-lg">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {item.href ? (
              <a
                className="inline-flex max-w-full rounded-md text-sm font-semibold text-primary break-words hover:text-foreground focus-visible:text-foreground"
                href={item.href}
                rel={isExternalHref(item.href) ? "noreferrer noopener" : undefined}
                target={isExternalHref(item.href) ? "_blank" : undefined}
              >
                {item.value}
                {isExternalHref(item.href) ? " 새 탭에서 열기" : ""}
              </a>
            ) : (
              <p className="text-sm font-semibold text-foreground break-words">
                {item.value}
              </p>
            )}
            {item.description ? (
              <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {item.description}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
