import type {
  ApplicationStepDefinition,
  ApplicationStepId,
} from "$lib/types/application"

export const stepDefinitions: ApplicationStepDefinition[] = [
  { id: "client-info", title: "Client Information", description: "Personal details", estimatedTime: "2 min", fields: [] },
  { id: "employment", title: "Employment", description: "Employment", estimatedTime: "5 min", fields: [] },
  { id: "income", title: "Income", description: "Financial info", estimatedTime: "4 min", fields: [] },
  { id: "assets", title: "Assets", description: "Assets Owned", estimatedTime: "6 min", fields: [] },
  { id: "real-estate", title: "Real Estate Owned", description: "Properties", estimatedTime: "4 min", fields: [] },
  { id: "loan-info", title: "Loan Information", description: "Loan details", estimatedTime: "3 min", fields: [] },
  { id: "documents", title: "Documentation", description: "Required documents", estimatedTime: "10 min", fields: [] },
  { id: "dictate", title: "Voice Dictation", description: "Fill by voice", estimatedTime: "5 min", fields: [] },
  { id: "review", title: "Review & Submit", description: "Review all information", estimatedTime: "3 min", fields: [] },
]

export const stepIdToSlug: Record<ApplicationStepId, string> = {
  "client-info": "client-info",
  employment: "employment",
  income: "income",
  "real-estate": "real-estate",
  assets: "assets",
  "loan-info": "loan-info",
  documents: "documents",
  dictate: "dictate",
  review: "review",
}

export const defaultStepId: ApplicationStepId = "client-info"

export const getStepPath = (
  appId: string,
  stepId: ApplicationStepId = defaultStepId,
) => `/application/${appId}/${stepIdToSlug[stepId]}`

const slugToStepId = Object.entries(stepIdToSlug).reduce<
  Record<string, ApplicationStepId>
>((acc, [stepId, slug]) => {
  acc[slug] = stepId as ApplicationStepId
  return acc
}, {})

export const stepSlugs = Object.values(stepIdToSlug)

export const isStepSlug = (value: string): boolean => stepSlugs.includes(value)

export const getStepIdFromPath = (pathname: string): ApplicationStepId => {
  const normalizedPath = pathname.split("?")[0]?.split("#")[0] ?? pathname
  const segments = normalizedPath.split("/").filter(Boolean)
  const slug = segments[segments.length - 1] ?? ""
  return slugToStepId[slug] ?? defaultStepId
}

const timeRegex = /(\d+)/

export const estimatedMinutesByStep = stepDefinitions.reduce<
  Record<ApplicationStepId, number>
>((acc, step) => {
  const match = step.estimatedTime.match(timeRegex)
  acc[step.id] = match ? Number(match[1]) : 0
  return acc
}, {} as Record<ApplicationStepId, number>)

export const getRemainingEstimatedMinutes = (
  currentStepId: ApplicationStepId,
): number => {
  const currentIndex = stepDefinitions.findIndex((step) => step.id === currentStepId)
  const stepsToCount =
    currentIndex < 0 ? stepDefinitions : stepDefinitions.slice(currentIndex)
  return stepsToCount.reduce(
    (total, step) => total + (estimatedMinutesByStep[step.id] ?? 0),
    0,
  )
}

