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

test('clicking a tune opens its detail page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Perpetual Light/i }).click()
  await expect(page).toHaveURL(/\/tunes\/perpetual-light$/)
  await expect(
    page.getByRole('heading', { name: 'Perpetual Light', level: 1 })
  ).toBeVisible()
  await expect(page.getByText('The Story')).toBeVisible()
})

test('a legacy ?tune= deep link redirects to the tune page', async ({
  page,
}) => {
  await page.goto('/?tune=the-diamond')
  await expect(page).toHaveURL(/\/tunes\/the-diamond$/)
  await expect(
    page.getByRole('heading', { name: 'The Diamond', level: 1 })
  ).toBeVisible()
})

test('a bad tune id shows the not-found page', async ({ page }) => {
  await page.goto('/tunes/does-not-exist')
  await expect(
    page.getByRole('heading', { name: 'Tune not found' })
  ).toBeVisible()
})

test('the media viewer opens via ?image= and Back closes it', async ({
  page,
}) => {
  await page.goto('/tunes/perpetual-light')
  await page
    .getByRole('button', { name: /View .* full screen/i })
    .first()
    .click()
  await expect(page).toHaveURL(/\?image=\d+/)
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/tunes\/perpetual-light$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
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
