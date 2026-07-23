import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}
