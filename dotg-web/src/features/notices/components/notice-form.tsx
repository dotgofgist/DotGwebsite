import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Notice } from "../types";

type NoticeFormProps = {
  initialNotice?: Notice;
};

export function NoticeForm({ initialNotice }: NoticeFormProps) {
  return (
    <form className="grid gap-6 rounded-lg border border-border bg-surface p-6">
      {/* TODO: 공지사항 저장 Server Action 연결 */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="notice-title" label="공지 제목" required>
          <Input id="notice-title" name="title" required defaultValue={initialNotice?.title} />
        </FormField>
        <FormField htmlFor="notice-slug" label="slug" required>
          <Input id="notice-slug" name="slug" required defaultValue={initialNotice?.slug} />
        </FormField>
      </div>
      <FormField htmlFor="notice-summary" label="요약" required>
        <Textarea id="notice-summary" name="summary" required defaultValue={initialNotice?.summary} />
      </FormField>
      <FormField htmlFor="notice-content" label="본문" required description="plain text로 입력합니다. 빈 줄은 문단 구분으로 사용됩니다.">
        <Textarea id="notice-content" name="content" required defaultValue={initialNotice?.content} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField htmlFor="notice-published-at" label="발행일">
          <Input id="notice-published-at" name="publishedAt" type="date" defaultValue={initialNotice?.publishedAt} />
        </FormField>
        <div className="flex items-center gap-3 pt-7">
          <Checkbox id="notice-pinned" name="pinned" defaultChecked={initialNotice?.pinned} />
          <label className="text-sm font-medium" htmlFor="notice-pinned">
            고정 공지로 표시
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled type="submit">저장 준비 중</Button>
        <p className="text-sm leading-6 text-neutral-400">
          저장 기능은 Supabase 연결 후 활성화됩니다.
        </p>
      </div>
    </form>
  );
}
