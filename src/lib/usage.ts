type UsageEntry = {
  clientId: string
  service: string
  operation?: string
  units?: number
  metadata?: Record<string, unknown>
}

export async function logUsage(entry: UsageEntry): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[usage]", entry)
  }
}

