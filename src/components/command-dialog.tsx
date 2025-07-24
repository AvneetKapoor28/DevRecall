"use client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import useProject from "@/hooks/use-project";

import { Plus , MessageCircleQuestionMark, NotebookPen, LayoutDashboard} from "lucide-react";
import { useRouter } from "next/navigation";

import React from "react";

export function CommandMenu() {
  const { projects, setProjectId } = useProject();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const SuggestionsList = [
    {
      title: "Create New Project",
      linkto: "/create",
      icon: Plus,
      matchValue: " create new project add ",
    },
    {
      title: "Ask Questions",
      linkto: "/qa",
      icon: MessageCircleQuestionMark,
      matchValue: " ask questions doubt query",
    },
    {
      title: "Summarize Meeting",
      linkto: "/meetings",
      icon: NotebookPen,
      matchValue: "summarize meeting audio recording summarise meetings ",
    },
    {
      title: "View Project",
      linkto: "/dashboard",
      icon: LayoutDashboard,
      matchValue: "dashboard view project main home ",
    }
  ];

  const filteredProjects = query
    ? projects?.filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase())
      )
    : projects?.slice(0, 3);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="scrollbar-hidden">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {SuggestionsList.map((item) => (
            <CommandItem
              value={item.matchValue}
              key={item.linkto}
              onSelect={() => {
                router.push(item.linkto);
                setOpen(false);
              }}
            >
            <item.icon />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          {filteredProjects?.map((project) => (
            <CommandItem
              key={project.id}
              onSelect={() => {
                setProjectId(project.id);
                router.push(`/dashboard`);
                setOpen(false);
              }}
            >
              {project.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
