// Test helper functions
import { expect, type Page } from '@playwright/test';

export async function fillClientInfo(page: Page, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ssn?: string;
  dob?: string;
  citizenship?: string;
  maritalStatus?: string;
}) {
  if (data.firstName) {
    await page.getByLabel(/first name/i).fill(data.firstName);
  }
  if (data.lastName) {
    await page.getByLabel(/last name/i).fill(data.lastName);
  }
  if (data.email) {
    await page.getByLabel(/email/i).fill(data.email);
  }
  if (data.phone) {
    await page.getByLabel(/phone/i).fill(data.phone);
  }
  if (data.ssn) {
    await page.getByLabel(/ssn/i).fill(data.ssn);
  }
  if (data.dob) {
    await page.getByLabel(/date of birth/i).fill(data.dob);
  }
  if (data.citizenship) {
    await page.getByRole('combobox', { name: /citizenship status/i }).click();
    await page.getByRole('option', { name: new RegExp(data.citizenship, 'i') }).click();
  }
  if (data.maritalStatus) {
    await page.getByRole('combobox', { name: /marital status/i }).click();
    await page.getByRole('option', { name: new RegExp(data.maritalStatus, 'i') }).click();
  }
}

export async function fillAddress(page: Page, data: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  moveInDate?: string;
}) {
  if (data.street) {
    await page.getByLabel(/street address/i).fill(data.street);
  }
  if (data.city) {
    await page.getByLabel(/city/i).fill(data.city);
  }
  if (data.state) {
    await page.getByLabel(/state/i).fill(data.state);
  }
  if (data.zip) {
    await page.getByLabel(/zip code/i).fill(data.zip);
  }
  if (data.moveInDate) {
    await page.getByLabel(/move-in date/i).fill(data.moveInDate);
  }
}

export async function navigateToStep(page: Page, stepName: string) {
  await page.getByRole('button', { name: new RegExp(stepName, 'i') }).click();
  await page.waitForTimeout(500);
}

export async function createApplication(page: Page): Promise<string> {
  await page.goto('/');
  await page.getByRole('button', { name: /new application/i }).click();
  await page.waitForURL(/\/application\/[a-zA-Z0-9-]+\/client-info/);
  
  const url = page.url();
  const appId = url.match(/\/application\/([a-zA-Z0-9-]+)/)?.[1] || '';
  expect(appId).toBeTruthy();
  return appId;
}

export async function waitForAutoSave(page: Page) {
  await page.waitForTimeout(2000); // Wait for auto-save
}


