import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("circlestore-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = saved ? saved === "dark" : prefersDark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);
  const toggle = () => {
    const enabled = !dark;
    setDark(enabled);
    localStorage.setItem("circlestore-theme", enabled ? "dark" : "light");
    document.documentElement.classList.toggle("dark", enabled);
  };
  return <button type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Use light theme" : "Use dark theme"} className="h-9 w-9 rounded-full border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center">{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>;
}
