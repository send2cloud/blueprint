import * as React from "react"
import { useState, useMemo } from "react"
import { ChevronsUpDown, Plus, Check, Search } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

import {
    DropdownMenu,
    DropdownMenuContent,
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
import { getProjectColor } from "../../lib/projectColors"

export function ProjectSwitcher() {
    const { isMobile, state } = useSidebar()
    const { projects, currentProjectId, setCurrentProject, createProject, getCurrentProject } = useBlueprint()
    const navigate = useNavigate()
    const location = useLocation()
    const basePath = useBasePath()
    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)

    const activeProject = getCurrentProject() || projects[0]
    const collapsed = state === 'collapsed'

    const filteredProjects = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return projects
        return projects.filter(p =>
            p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
        )
    }, [projects, search])

    const handleSwitchProject = (project: typeof projects[0]) => {
        setCurrentProject(project.id)
        const currentSlug = activeProject?.slug
        let subPath = ''
        if (currentSlug) {
            const prefix = `${basePath}/${currentSlug}`
            if (location.pathname.startsWith(prefix)) {
                subPath = location.pathname.slice(prefix.length)
            }
        }
        navigate(`${basePath}/${project.slug}${subPath}`)
        setOpen(false)
        setSearch("")
    }

    const handleCreateProject = async () => {
        const name = window.prompt('Enter new project name:', 'New Project');
        if (name && name.trim()) {
            const newProj = await createProject(name.trim());
            setCurrentProject(newProj.id);
            navigate(`${basePath}/${newProj.slug}`)
            setOpen(false)
            setSearch("")
        }
    }

    if (!activeProject) return null;

    // Get first letter and warm color for avatar
    const initial = activeProject.name.charAt(0).toUpperCase()
    const activeColor = getProjectColor(activeProject)
    const hasLogo = !!activeProject.logo

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch("") }}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {hasLogo ? (
                                <img src={activeProject.logo} alt="" className="size-8 rounded-lg object-cover" />
                            ) : (
                                <div
                                    className="flex aspect-square size-8 items-center justify-center rounded-lg text-sm font-bold"
                                    style={{ backgroundColor: `hsl(${activeColor.bg})`, color: `hsl(${activeColor.fg})` }}
                                >
                                    {initial}
                                </div>
                            )}
                            {!collapsed && (
                                <>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {activeProject.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">/{activeProject.slug}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                                </>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg bg-popover border border-border shadow-lg z-50 p-0"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        {/* Search */}
                        <div className="p-2 border-b border-border">
                            <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
                                <Search className="size-3.5 text-muted-foreground shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search projects…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Project list */}
                        <div className="max-h-64 overflow-y-auto p-1">
                            {filteredProjects.length === 0 ? (
                                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    No projects found
                                </div>
                            ) : (
                                filteredProjects.map((project) => {
                                    const isActive = project.id === currentProjectId
                                    const projectInitial = project.name.charAt(0).toUpperCase()
                                    const projColor = getProjectColor(project.id)
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => handleSwitchProject(project)}
                                            className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${isActive ? 'bg-accent/50' : ''}`}
                                        >
                                            <div
                                                className="flex size-7 items-center justify-center rounded-md text-xs font-bold shrink-0"
                                                style={{ backgroundColor: `hsl(${projColor.bg})`, color: `hsl(${projColor.fg})` }}
                                            >
                                                {projectInitial}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="truncate font-medium">{project.name}</div>
                                                <div className="truncate text-xs text-muted-foreground">/{project.slug}</div>
                                            </div>
                                            {isActive && (
                                                <Check className="size-4 text-primary shrink-0" />
                                            )}
                                        </button>
                                    )
                                })
                            )}
                        </div>

                        {/* Add project */}
                        <div className="border-t border-border p-1">
                            <button
                                onClick={handleCreateProject}
                                className="w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <div className="flex size-7 items-center justify-center rounded-md border border-dashed border-muted-foreground/40">
                                    <Plus className="size-3.5" />
                                </div>
                                <span className="font-medium">New project</span>
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
