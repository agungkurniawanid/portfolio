import { test, expect } from '@playwright/test';

test.describe('Portfolio Full E2E Test', () => {
  
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    // Memastikan hero section muncul (sesuai messages/id.json)
    await expect(page).toHaveTitle(/Agung Kurniawan/i);
    await expect(page.getByText('Saya Agung Kurniawan')).toBeVisible();
    await expect(page.getByText('Backend Engineer')).toBeVisible();
  });

  test('Navigate to About page', async ({ page }) => {
    await page.goto('/about');
    // Cek heading "Tentang Saya"
    await expect(page.getByRole('heading', { name: /Tentang Saya/i })).toBeVisible();
    // Cek konten edukasi
    await expect(page.getByText('Background Edukasi Saya')).toBeVisible();
  });

  test('Navigate to Skills page', async ({ page }) => {
    await page.goto('/skills');
    // Cek heading Keahlian
    await expect(page.getByRole('heading', { name: /Keahlian/i })).toBeVisible();
    // Cek kategori skill
    await expect(page.getByText('Backend')).toBeVisible();
    await expect(page.getByText('Frontend')).toBeVisible();
  });

  test('Navigate to Projects page', async ({ page }) => {
    await page.goto('/projects');
    // Cek heading Project
    await expect(page.getByRole('heading', { name: /Project/i })).toBeVisible();
    // Cek tab filter
    await expect(page.getByText('Semua Project')).toBeVisible();
  });

  test('Navigate to Blog page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /Blog/i })).toBeVisible();
    // Cek search bar
    await expect(page.getByPlaceholder(/Cari artikel/i)).toBeVisible();
  });

  test('Navigate to Guestbook page', async ({ page }) => {
    await page.goto('/guestbook');
    await expect(page.getByRole('heading', { name: /Buku Tamu/i })).toBeVisible();
    // Cek tombol isi buku tamu
    await expect(page.getByText('Isi Daftar Tamu')).toBeVisible();
  });

  test('Navigate to Gallery page', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: /Gallery/i })).toBeVisible();
    // Cek tab gallery
    await expect(page.getByText('Gallery Agung')).toBeVisible();
  });

  test('Navigate to Contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /Hubungi Saya/i })).toBeVisible();
    // Cek form input
    await expect(page.getByPlaceholder(/Nama Lengkap/i)).toBeVisible();
  });

  test('Check Dev Reset page (Development only)', async ({ page }) => {
    await page.goto('/dev-reset');
    await expect(page.getByRole('heading', { name: 'Dev Reset Utility' })).toBeVisible();
    // Cek input secret
    await expect(page.getByPlaceholder(/DEV_RESET_SECRET/i)).toBeVisible();
  });

});
