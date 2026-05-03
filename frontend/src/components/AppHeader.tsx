import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearToken, isAuthed } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export function AppHeader() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthed());
  }, []);

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-card)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-foreground">East Point</div>
            <div className="text-xs text-muted-foreground">Lost & Found</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {authed ? (
            <>
              <Link to="/dashboard" className="hidden text-sm font-medium text-foreground/80 hover:text-primary sm:block">
                Dashboard
              </Link>
              <Link to="/browse" className="hidden text-sm font-medium text-foreground/80 hover:text-primary sm:block">
                Browse
              </Link>
              <Link to="/matches" className="hidden text-sm font-medium text-foreground/80 hover:text-primary sm:block">
                Matches
              </Link>
              <Link to="/search" className="hidden text-sm font-medium text-foreground/80 hover:text-primary sm:block">
                Search
              </Link>
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-card)]">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
