"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
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
import { cn } from "@/lib/utils"
import type { ApplicationStepDefinition, ApplicationStepState, ApplicationStepId } from "@/app/models/application"
import { stepIdToPath } from "@/app/(routes)/application/stepPaths"

const stepDefinitions: ApplicationStepDefinition[] = [
  { id: 'client-info', title: 'Client Information', description: 'Personal details', estimatedTime: '2 min', fields: [] },
  { id: 'employment', title: 'Employment', description: 'Employment', estimatedTime: '5 min', fields: [] },
  { id: 'income', title: 'Income', description: 'Financial info', estimatedTime: '4 min', fields: [] },
  { id: 'assets', title: 'Assets', description: 'Assets Owned', estimatedTime: '6 min', fields: [] },
  { id: 'real-estate', title: 'Real Estate Owned', description: 'Properties', estimatedTime: '4 min', fields: [] },
  { id: 'documents', title: 'Documentation', description: 'Required documents', estimatedTime: '10 min', fields: [] },
  { id: 'dictate', title: 'Voice Dictation', description: 'Fill by voice', estimatedTime: '5 min', fields: [] },
  { id: 'review', title: 'Review & Submit', description: 'Review all information', estimatedTime: '3 min', fields: [] },
]

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
  const searchParams = useSearchParams()

  const currentStepId = useMemo(() => {
    const match = Object.entries(stepIdToPath).find(([, path]) => pathname.startsWith(path))
    return (match?.[0] as ApplicationStepId) ?? 'client-info'
  }, [pathname])

  const appId = searchParams.get('appId')

  const getStepStatus = (stepId: ApplicationStepId) => {
    const state = stepStates.find(s => s.id === stepId)
    if (!state) return 'pending'
    
    if (state.completionPercentage === 100) return 'completed'
    if (state.completionPercentage > 0) return 'in-progress'
    if (state.errorCount > 0) return 'error'
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
    const basePath = stepIdToPath[stepId]
    return appId ? `${basePath}?appId=${appId}` : basePath
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
                      <Link href={getStepUrl(step.id)} className="flex items-center gap-4 w-full">
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
            {stepDefinitions
              .slice(stepDefinitions.findIndex(s => s.id === currentStepId))
              .reduce((acc, step) => {
                const timeMatch = step.estimatedTime.match(/(\d+)/)
                return acc + (timeMatch ? parseInt(timeMatch[1], 10) : 0)
              }, 0)} min
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
