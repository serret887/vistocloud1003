import { test, expect } from "@playwright/test"
import { defaultStepId } from "@/lib/applicationSteps"

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080"
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "vistocloud"

type FirestoreNumberField = {
  integerValue?: string
  doubleValue?: number
}

const readNumberField = (field?: FirestoreNumberField): number => {
  if (!field) return 0
  if (typeof field.integerValue === "string") {
    return Number(field.integerValue)
  }
  if (typeof field.doubleValue === "number") {
    return Number(field.doubleValue)
  }
  return 0
}

const fetchApplicationDocument = async (appId: string) => {
  const endpoint = `http://${FIRESTORE_HOST}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/applications/${appId}`
  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error(`Failed to fetch Firestore doc for ${appId}: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

test("user can create an application and persisted document matches expectations", async ({ page }) => {
  const ownerId = `e2e-owner-${Date.now()}`
  const ownerWorkspace = `e2e-workspace-${Date.now()}`

  await page.goto(`/?ownerId=${ownerId}&ownerWorkspace=${ownerWorkspace}`)

  await page.getByRole("button", { name: /create application/i }).click()
  await page.waitForURL(/\/application\/[^/]+\/client-info/)

  const url = page.url()
  const match = url.match(/application\/([^/]+)\//)
  expect(match, "appId should be present in URL").not.toBeNull()
  const appId = match![1]

  await expect(page.locator("h1")).toHaveText(/client information/i)

  const firestoreDoc = await fetchApplicationDocument(appId)
  const fields = firestoreDoc.fields ?? {}

  expect(fields.applicationNumber?.stringValue).toBe(appId)
  expect(fields.ownerId?.stringValue).toBe(ownerId)
  expect(fields.ownerWorkspace?.stringValue).toBe(ownerWorkspace)
  expect(fields.status?.stringValue).toBe("draft")
  expect(fields.currentStepId?.stringValue).toBe(defaultStepId)
  expect(readNumberField(fields.overallProgress)).toBe(0)
})



