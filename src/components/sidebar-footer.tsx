import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export function SidebarFooter() {
  return (
    <div className="border-muted text-muted-foreground mt-auto flex w-full flex-col items-center justify-center border-t px-4 pt-4 pb-6 text-sm">
      <div className="text-muted-foreground mt-1 flex items-center gap-3">
        <Link
          href="https://github.com/AvneetKapoor28"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-white"
        >
          <Github size={18} />
        </Link>

        <Link
          href="https://www.linkedin.com/in/avneet-singh-kapoor-9a6168248"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-white"
        >
          <Linkedin size={18} />
        </Link>

        <Link
          href="mailto:avneet.kapoor28@gmail.com"
          className="transition-colors hover:text-white"
        >
          <Mail size={18} />
        </Link>
      </div>
      <div className="text-muted-foreground mt-3 text-xs font-medium">
        Made by Avneet Singh Kapoor
      </div>
    </div>
  );
}
