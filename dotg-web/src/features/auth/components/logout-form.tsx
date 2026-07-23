import { Button } from "@/components/ui/button";
import { logoutAction } from "../actions";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <Button size="sm" type="submit" variant="secondary">
        로그아웃
      </Button>
    </form>
  );
}
