import { redirect } from "next/navigation"
import { getStepPath, defaultStepId, isStepSlug } from "@/lib/applicationSteps"

interface ApplicationInstancePageProps {
  params: Promise<{ appId: string }>
}

export default async function ApplicationInstancePage({
  params,
}: ApplicationInstancePageProps) {
  const { appId } = await params
  if (isStepSlug(appId)) {
    redirect("/")
  }
  redirect(getStepPath(appId, defaultStepId))
}

