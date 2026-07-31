import { test, expect } from '@playwright/test'

test('home shows the Tune Book with tune cards', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tune Book' })).toBeVisible()
  await expect(page.getByText('PERPETUAL LIGHT')).toBeVisible()
})

test('search filters the tune list', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('Search by title, type, or key').fill('waltz')
  await expect(page.getByText('THE DIAMOND')).toBeVisible()
  await expect(page.getByText('PERPETUAL LIGHT')).toHaveCount(0)
})

test('clicking a tune opens its detail modal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Perpetual Light/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('The Story')).toBeVisible()
})

test('a ?tune= deep link opens the right tune', async ({ page }) => {
  await page.goto('/?tune=the-diamond')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('heading', { name: 'The Diamond' })
  ).toBeVisible()
})

test('a bad ?tune= id shows the not-found notice', async ({ page }) => {
  await page.goto('/?tune=does-not-exist')
  await expect(page.getByRole('alert')).toContainText('does-not-exist')
})

test('albums page lists the discography', async ({ page }) => {
  await page.goto('/albums')
  await expect(page.getByRole('heading', { name: 'Albums' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /Green Fields of America/ })
  ).toBeVisible()
})

test('about page shows the in-app feedback form', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Send feedback/i })
  ).toBeVisible()
})
