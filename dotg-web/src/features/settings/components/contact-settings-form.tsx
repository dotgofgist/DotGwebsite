import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactItems } from "@/config/contact";

export function ContactSettingsForm() {
  return (
    <form className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      {/* TODO: 연락처 설정 저장 Server Action 연결 */}
      <h2 className="text-xl font-semibold tracking-normal">연락처 설정</h2>
      {contactItems.map((item, index) => (
        <div className="grid gap-4 rounded-md border border-border bg-background p-4 md:grid-cols-2" key={`${item.label}-${index}`}>
          <FormField htmlFor={`contact-label-${index}`} label="연락처 라벨">
            <Input id={`contact-label-${index}`} name={`contactLabel-${index}`} defaultValue={item.label} />
          </FormField>
          <FormField htmlFor={`contact-value-${index}`} label="표시 값">
            <Input id={`contact-value-${index}`} name={`contactValue-${index}`} defaultValue={item.value} />
          </FormField>
          <FormField htmlFor={`contact-href-${index}`} label="링크">
            <Input id={`contact-href-${index}`} name={`contactHref-${index}`} defaultValue={item.href ?? ""} />
          </FormField>
          <FormField htmlFor={`contact-description-${index}`} label="설명">
            <Textarea id={`contact-description-${index}`} name={`contactDescription-${index}`} defaultValue={item.description ?? ""} />
          </FormField>
        </div>
      ))}
      <Button disabled type="submit">저장 준비 중</Button>
    </form>
  );
}
