"use client";

import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Sparkles, LogOut } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Animalession</span>
        </Link>
        <div className="flex items-center gap-2">
          {session?.user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {session.user.name || session.user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {session?.user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
