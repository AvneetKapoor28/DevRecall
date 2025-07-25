"use client";

import { FadeInUp } from "@/components/fade-up";
import { SidebarFooter } from "@/components/sidebar-footer";
import { ModeToggle } from "@/components/theme-toggle-btn";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { cn } from "@/lib/utils";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  LayoutDashboardIcon,
  Plus,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { title } from "process";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  // {
  //   title: "Billing",
  //   url: "/billing",
  //   icon: CreditCard,
  // },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  const router = useRouter();
  // console.log(projects, projectId, "IMPORTED FROM USEPROJECT HOOK")
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" height={50} width={50} />
            {open && (
              <h1 className="text-primary/80 text-xl font-bold">DevRecall</h1>
            )}
          </div>
          {open && <ModeToggle />}
        </div>
        {!open && <ModeToggle />}
      </SidebarHeader>

      <SidebarContent className="scrollbar-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <FadeInUp>
              <SidebarMenu>
                {items.map((item) => {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            {
                              "!bg-primary !text-white":
                                usePathname().startsWith(item.url),
                            },
                            "list-none",
                          )}
                        >
                          <item.icon />
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </FadeInUp>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your projects</SidebarGroupLabel>
          <SidebarMenu className=" max-h-[40vh] overflow-y-auto scrollbar-hidden">
            {projects?.map((project) => {
              return (
                <SidebarMenuItem key={project.name} className="cursor-pointer">
                  <SidebarMenuButton className="pl-1" asChild>
                    <div
                      onClick={() => {
                        setProjectId(project.id);
                        router.push("/dashboard");
                      }}
                    >
                      <div
                        className={cn(
                          "text-primary flex size-6 min-w-[25px] items-center justify-center rounded-sm border bg-white text-sm font-medium",
                          {
                            "bg-primary text-white": project.id === projectId,
                          },
                        )}
                      >
                        {project.name[0]!.toUpperCase()}
                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            
          </SidebarMenu>
          <div className="h-4"></div>
            <SidebarMenu>
              {open && (
              <SidebarMenuItem className="flex items-center justify-center">
                <Link href="/create">
                  <Button variant={"outline"} className="w-fit">
                    <Plus />
                    Create Project
                  </Button>
                </Link>
              </SidebarMenuItem>
            )}
            </SidebarMenu>
        </SidebarGroup>
        <SidebarFooter/>
      </SidebarContent>
    </Sidebar>
  );
}
