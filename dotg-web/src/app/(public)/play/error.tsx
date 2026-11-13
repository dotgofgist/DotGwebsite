"use client";
export default function PlayError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-xl px-6 py-16"><h1 className="mb-4 text-2xl font-bold">라운지에 연결하지 못했어요</h1><p className="mb-6">잠시 후 다시 시도해 주세요.</p><button onClick={reset} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">다시 시도</button></section>;
}
