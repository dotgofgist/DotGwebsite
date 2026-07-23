import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";

export function SiteSettingsForm() {
  return (
    <form className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      {/* TODO: 사이트 설정 저장 Server Action 연결 */}
      <h2 className="text-xl font-semibold tracking-normal">사이트 기본 정보</h2>
      <FormField htmlFor="site-name" label="사이트 이름">
        <Input id="site-name" name="name" defaultValue={siteConfig.name} />
      </FormField>
      <FormField htmlFor="site-title" label="사이트 제목">
        <Input id="site-title" name="title" defaultValue={siteConfig.title} />
      </FormField>
      <FormField htmlFor="site-description" label="사이트 설명">
        <Textarea id="site-description" name="description" defaultValue={siteConfig.description} />
      </FormField>
      <FormField htmlFor="site-short-description" label="짧은 소개">
        <Textarea id="site-short-description" name="shortDescription" defaultValue={siteConfig.shortDescription} />
      </FormField>
      <Button disabled type="submit">저장 준비 중</Button>
    </form>
  );
}
