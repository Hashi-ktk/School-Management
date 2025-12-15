/**
 * Admin Screenshots Capture Script
 *
 * This script automatically captures screenshots of all admin pages
 * for documentation purposes.
 *
 * Prerequisites:
 *   1. Install Puppeteer: npm install puppeteer --save-dev
 *   2. Start the dev server: npm run dev
 *   3. Run this script: npm run docs:screenshots
 *      OR: node scripts/capture-admin-screenshots.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: path.join(__dirname, '../docs/images/admin'),
  viewport: { width: 1440, height: 900 },
  // Admin email for demo login
  adminEmail: 'ali.khan@edu.example.com',
  // Wait time for animations and data loading (3 seconds as requested)
  waitTime: 3000
};

// Pages to capture with their details
const ADMIN_PAGES = [
  {
    name: 'login',
    path: '/',
    filename: '01-login-page.png',
    description: 'Login page with role selection',
    waitFor: 2000
  },
  {
    name: 'dashboard',
    path: '/dashboard/admin',
    filename: '02-admin-dashboard.png',
    description: 'Admin Dashboard - Full overview',
    waitFor: CONFIG.waitTime,
    fullPage: true
  },
  {
    name: 'dashboard-stats',
    path: '/dashboard/admin',
    filename: '02a-dashboard-stats.png',
    description: 'Dashboard - Statistics cards section',
    waitFor: CONFIG.waitTime,
    clip: { x: 0, y: 0, width: 1440, height: 700 }
  },
  {
    name: 'dashboard-charts',
    path: '/dashboard/admin',
    filename: '02b-dashboard-charts.png',
    description: 'Dashboard - Performance charts section',
    waitFor: CONFIG.waitTime,
    scrollTo: 600,
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  },
  {
    name: 'analytics',
    path: '/dashboard/admin/analytics',
    filename: '03-analytics-dashboard.png',
    description: 'Analytics Dashboard - Full view',
    waitFor: CONFIG.waitTime,
    fullPage: true
  },
  {
    name: 'analytics-top',
    path: '/dashboard/admin/analytics',
    filename: '03a-analytics-metrics.png',
    description: 'Analytics - Key metrics with sparklines',
    waitFor: CONFIG.waitTime,
    clip: { x: 0, y: 0, width: 1440, height: 800 }
  },
  {
    name: 'analytics-charts',
    path: '/dashboard/admin/analytics',
    filename: '03b-analytics-charts.png',
    description: 'Analytics - Advanced charts section',
    waitFor: CONFIG.waitTime,
    scrollTo: 700,
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  },
  {
    name: 'students',
    path: '/dashboard/admin/students',
    filename: '04-students-management.png',
    description: 'Student Management page',
    waitFor: CONFIG.waitTime,
    fullPage: true
  },
  {
    name: 'students-filters',
    path: '/dashboard/admin/students',
    filename: '04a-students-filters.png',
    description: 'Students - Search and filter options',
    waitFor: CONFIG.waitTime,
    clip: { x: 0, y: 0, width: 1440, height: 500 }
  },
  {
    name: 'assessments',
    path: '/dashboard/admin/assessments',
    filename: '05-assessments-management.png',
    description: 'Assessment Management page',
    waitFor: CONFIG.waitTime,
    fullPage: true
  },
  {
    name: 'reports',
    path: '/dashboard/admin/reports',
    filename: '06-reports-page.png',
    description: 'Reports & Data Export page',
    waitFor: CONFIG.waitTime,
    fullPage: true
  },
  {
    name: 'observations',
    path: '/dashboard/admin/observations',
    filename: '07-observations-page.png',
    description: 'Classroom Observations page',
    waitFor: CONFIG.waitTime,
    fullPage: true
  }
];

// Ensure output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Wait helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Wait for page to be fully loaded (no loading indicators)
async function waitForPageLoad(page, timeout = 10000) {
  try {
    // Wait for any loading text to disappear
    await page.waitForFunction(
      () => {
        const body = document.body.textContent || '';
        return !body.includes('Loading...');
      },
      { timeout }
    );
  } catch (e) {
    // Continue even if timeout - page might not have loading indicator
  }
}

// Main capture function
async function captureScreenshots() {
  console.log('\n========================================');
  console.log('  Admin Screenshots Capture Script');
  console.log('========================================\n');
  console.log(`Wait time per page: ${CONFIG.waitTime}ms`);
  console.log(`Output directory: ${CONFIG.outputDir}\n`);

  // Ensure output directory exists
  ensureDirectoryExists(CONFIG.outputDir);

  // Launch browser
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);

  // Disable CSS animations for cleaner screenshots
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.001s !important;
        transition-duration: 0.001s !important;
      }
    `;
    document.head.appendChild(style);
  });

  try {
    // Step 1: Navigate to login page
    console.log('\n[1/4] Navigating to login page...');
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);

    // Step 2: Click on Admin demo account button to fill email
    console.log('[2/4] Selecting Admin demo account...');

    // Find and click the Admin button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminButton = buttons.find(btn => {
        const text = btn.textContent || '';
        return text.includes('Admin') && text.includes('ali.khan');
      });
      if (adminButton) {
        adminButton.click();
      }
    });
    await delay(500);

    // Capture login page with Admin selected
    await page.screenshot({
      path: path.join(CONFIG.outputDir, '01-login-page.png'),
      fullPage: false
    });
    console.log('  ✓ Login page captured: 01-login-page.png');

    // Step 3: Submit login form
    console.log('[3/4] Logging in as admin...');

    // Click the Continue/Sign In button
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    // Wait for navigation to admin dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    console.log('  ✓ Login successful - redirected to admin dashboard');

    // Step 4: Capture all admin pages
    console.log('\n[4/4] Capturing admin pages...\n');

    let capturedCount = 0;
    let failedCount = 0;

    for (const pageConfig of ADMIN_PAGES) {
      // Skip login page (already captured)
      if (pageConfig.name === 'login') continue;

      try {
        console.log(`  Capturing: ${pageConfig.description}...`);

        // Check if we need to navigate (skip if same path as previous)
        const currentUrl = page.url();
        const targetUrl = `${CONFIG.baseUrl}${pageConfig.path}`;

        if (!currentUrl.includes(pageConfig.path)) {
          await page.goto(targetUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
          });
        }

        // Wait for data to load
        await delay(pageConfig.waitFor || CONFIG.waitTime);
        await waitForPageLoad(page);

        // Additional wait for charts/animations to render
        await delay(1000);

        // Scroll if needed
        if (pageConfig.scrollTo) {
          await page.evaluate((scrollY) => {
            window.scrollTo({ top: scrollY, behavior: 'instant' });
          }, pageConfig.scrollTo);
          await delay(500);
        } else {
          // Reset scroll to top
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await delay(300);
        }

        // Take screenshot
        const screenshotOptions = {
          path: path.join(CONFIG.outputDir, pageConfig.filename)
        };

        if (pageConfig.fullPage) {
          screenshotOptions.fullPage = true;
        } else if (pageConfig.clip) {
          screenshotOptions.clip = pageConfig.clip;
        }

        await page.screenshot(screenshotOptions);
        console.log(`    ✓ Saved: ${pageConfig.filename}`);
        capturedCount++;

      } catch (err) {
        console.log(`    ✗ Failed: ${pageConfig.filename} - ${err.message}`);
        failedCount++;
      }
    }

    console.log('\n========================================');
    console.log('  Screenshot capture complete!');
    console.log('========================================\n');
    console.log(`Results: ${capturedCount} captured, ${failedCount} failed`);
    console.log(`Output directory: ${CONFIG.outputDir}\n`);

    // List captured files
    const files = fs.readdirSync(CONFIG.outputDir).filter(f => f.endsWith('.png'));
    console.log(`Screenshots in output directory (${files.length} files):`);
    files.sort().forEach(file => {
      const stats = fs.statSync(path.join(CONFIG.outputDir, file));
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`  - ${file} (${sizeKB} KB)`);
    });

  } catch (error) {
    console.error('\nError during capture:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\nBrowser closed.');
  }
}

// Run the script
captureScreenshots().catch(console.error);
