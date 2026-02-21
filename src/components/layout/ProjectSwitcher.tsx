import * as React from "react"
import { ChevronsUpDown, Plus, FolderSync } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

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
import { useBasePath } from "../../lib/basePath"

export function ProjectSwitcher() {
    const { isMobile, state } = useSidebar()
    const { projects, currentProjectId, setCurrentProject, createProject, getCurrentProject } = useBlueprint()
    const navigate = useNavigate()
    const location = useLocation()
    const basePath = useBasePath()

    const activeProject = getCurrentProject() || projects[0]
    const collapsed = state === 'collapsed'

    const handleSwitchProject = (project: typeof projects[0]) => {
        setCurrentProject(project.id)
        // Navigate to the new project's slug, keeping the current sub-path
        const currentSlug = activeProject?.slug
        let subPath = ''
        if (currentSlug) {
            const prefix = `${basePath}/${currentSlug}`
            if (location.pathname.startsWith(prefix)) {
                subPath = location.pathname.slice(prefix.length)
            }
        }
        navigate(`${basePath}/${project.slug}${subPath}`)
    }

    const handleCreateProject = async () => {
        const name = window.prompt('Enter new project name:', 'New Project');
        if (name && name.trim()) {
            const newProj = await createProject(name.trim());
            setCurrentProject(newProj.id);
            navigate(`${basePath}/${newProj.slug}`)
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
                                        <span className="truncate text-xs text-muted-foreground">/{activeProject.slug}</span>
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
                                onClick={() => handleSwitchProject(project)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <FolderSync className="size-4 shrink-0" />
                                </div>
                                <div className="flex flex-col">
                                    <span>{project.name}</span>
                                    <span className="text-xs text-muted-foreground">/{project.slug}</span>
                                </div>
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
