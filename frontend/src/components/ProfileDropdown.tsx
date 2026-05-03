import { Link, useNavigate } from "@tanstack/react-router";
import { clearToken, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export function ProfileDropdown() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearToken();
    navigate({ to: "/" });
  };

  return (
    <div className="flex items-center gap-2">
      <Link to="/profile">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{user?.name}</span>
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
