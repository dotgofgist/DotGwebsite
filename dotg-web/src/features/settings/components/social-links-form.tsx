import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { socialLinks } from "@/config/social";

export function SocialLinksForm() {
  return (
    <form className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      {/* TODO: SNS 설정 저장 Server Action 연결 */}
      <h2 className="text-xl font-semibold tracking-normal">SNS 링크 설정</h2>
      {socialLinks.map((link, index) => (
        <div className="grid gap-4 rounded-md border border-border bg-background p-4 md:grid-cols-2" key={link.name}>
          <FormField htmlFor={`social-name-${index}`} label="서비스 이름">
            <Input id={`social-name-${index}`} name={`socialName-${index}`} readOnly defaultValue={link.name} />
          </FormField>
          <FormField htmlFor={`social-label-${index}`} label="표시 라벨">
            <Input id={`social-label-${index}`} name={`socialLabel-${index}`} defaultValue={link.label} />
          </FormField>
          <FormField htmlFor={`social-href-${index}`} label="URL" description="실제 URL이 없으면 비워 둡니다.">
            <Input id={`social-href-${index}`} name={`socialHref-${index}`} defaultValue={link.href === "#" ? "" : link.href} />
          </FormField>
          <FormField htmlFor={`social-description-${index}`} label="설명">
            <Textarea id={`social-description-${index}`} name={`socialDescription-${index}`} defaultValue={link.description ?? ""} />
          </FormField>
        </div>
      ))}
      <Button disabled type="submit">저장 준비 중</Button>
    </form>
  );
}
