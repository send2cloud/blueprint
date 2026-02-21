import * as React from "react"
import { ChevronsUpDown, Plus, FolderSync } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "../ui/sidebar"
import { useBlueprint } from "../../contexts/BlueprintContext"

export function ProjectSwitcher() {
    const { isMobile, state } = useSidebar()
    const { projects, currentProjectId, setCurrentProject, createProject } = useBlueprint()

    const activeProject = projects.find(p => p.id === currentProjectId) || projects[0]
    const collapsed = state === 'collapsed'

    const handleCreateProject = async () => {
        const name = window.prompt('Enter new project name:', 'New Project');
        if (name && name.trim()) {
            const newProj = await createProject(name.trim());
            setCurrentProject(newProj.id);
        }
    }

    if (!activeProject) return null;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <FolderSync className="size-4" />
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {activeProject.name}
                                        </span>
                                        <span className="truncate text-xs">Workspace</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Projects
                        </DropdownMenuLabel>
                        {projects.map((project) => (
                            <DropdownMenuItem
                                key={project.id}
                                onClick={() => setCurrentProject(project.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <FolderSync className="size-4 shrink-0" />
                                </div>
                                {project.name}
                                {project.id === currentProjectId && (
                                    <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" onClick={handleCreateProject}>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Add project</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
