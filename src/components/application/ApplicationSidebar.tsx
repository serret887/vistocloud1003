"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  User,
  Briefcase,
  DollarSign,
  Home,
  FileText,
  Mic,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import type { ApplicationStepState, ApplicationStepId } from "@/app/models/application"
import {
  getStepIdFromPath,
  getStepPath,
  getRemainingEstimatedMinutes,
  stepDefinitions,
} from "@/lib/applicationSteps"

const stepIcons: Record<ApplicationStepId, typeof User> = {
  'client-info': User,
  'employment': Briefcase,
  'income': DollarSign,
  'assets': DollarSign,
  'real-estate': Home,
  'documents': FileText,
  'dictate': Mic,
  'review': CheckCircle2,
}

interface ApplicationSidebarProps {
  stepStates: ApplicationStepState[]
  overallProgress: number
}

export function ApplicationSidebar({ stepStates, overallProgress }: ApplicationSidebarProps) {
  const pathname = usePathname()
  const params = useParams<{ appId?: string }>()

  const currentStepId = useMemo(() => {
    return getStepIdFromPath(pathname)
  }, [pathname])

  const appId = params?.appId ?? null

  const getStepStatus = (stepId: ApplicationStepId) => {
      const state = stepStates.find(s => s.id === stepId)
      if (!state) return 'pending'
      
      if (state.errorCount > 0) return 'error'
      if (state.completionPercentage === 100) return 'completed'
      if (state.completionPercentage > 0) return 'in-progress'
      return 'pending'
  }

  const getStepIcon = (stepId: ApplicationStepId) => {
    const Icon = stepIcons[stepId]
    return <Icon className="h-8 w-8 shrink-0" />
  }

  const getStatusIndicator = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
    }
    if (status === 'error') {
      return <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
    }
    if (status === 'in-progress') {
      return <Circle className="h-6 w-6 text-blue-600 fill-blue-600 shrink-0" />
    }
  return null
  }

  const getStepUrl = (stepId: ApplicationStepId) => {
    if (!appId) return "#"
    return getStepPath(appId, stepId)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Application Progress</h2>
            <p className="text-base text-muted-foreground mt-2">{overallProgress}% Complete</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-sidebar-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-sidebar-primary transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-3 py-2">Steps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {stepDefinitions.map((step) => {
                const status = getStepStatus(step.id)
                const isActive = currentStepId === step.id
                const state = stepStates.find(s => s.id === step.id)
                const completion = state?.completionPercentage ?? 0

                return (
                  <SidebarMenuItem key={step.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="lg"
                      className="gap-4 py-4"
                    >
                      <Link
                        href={getStepUrl(step.id)}
                        className="flex items-center gap-4 w-full"
                        aria-disabled={!appId}
                        onClick={(event) => {
                          if (!appId) {
                            event.preventDefault()
                            event.stopPropagation()
                          }
                        }}
                      >
                        {/* Step icon on the left - always visible */}
                        {getStepIcon(step.id)}
                        {/* Text content in the middle */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-lg font-semibold leading-tight">{step.title}</span>
                            {completion > 0 && (
                              <span className="text-base text-muted-foreground shrink-0 font-semibold">
                                {completion}%
                              </span>
                            )}
                          </div>
                          <p className="text-base text-muted-foreground truncate leading-tight">
                            {step.description}
                          </p>
                        </div>
                        {/* Status indicator on the right */}
                        <div className="shrink-0">
                          {getStatusIndicator(status)}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-6">
        <div className="text-base text-muted-foreground">
          <p className="font-medium">Estimated time remaining</p>
          <p className="font-bold mt-2 text-lg">
            {getRemainingEstimatedMinutes(currentStepId)} min
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
