# Documentation

## Admin User Guide

The main documentation for administrators is in [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md).

## Generating Screenshots

The documentation includes image placeholders. To generate actual screenshots:

### Prerequisites

1. Install Puppeteer:
   ```bash
   npm install puppeteer --save-dev
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Capture Screenshots

In a separate terminal, run:

```bash
npm run docs:screenshots
```

This will:
- Launch a headless browser
- Log in as admin
- Navigate to each admin page
- Capture screenshots
- Save them to `docs/images/admin/`

### Configuration

Edit `scripts/capture-admin-screenshots.js` to:
- Change admin credentials (if different)
- Add/remove pages to capture
- Adjust viewport size
- Modify screenshot options

### Output

Screenshots are saved to:
```
docs/images/admin/
├── 01-login-page.png
├── 02-admin-dashboard.png
├── 02a-dashboard-stats.png
├── 02b-dashboard-charts.png
├── 03-analytics-dashboard.png
├── 03a-analytics-metrics.png
├── 03b-analytics-charts.png
├── 04-students-management.png
├── 04a-students-filters.png
├── 05-assessments-management.png
├── 06-reports-page.png
└── 07-observations-page.png
```

### Troubleshooting

**Browser won't launch:**
- Ensure Puppeteer is installed: `npm install puppeteer --save-dev`

**Login fails:**
- Check credentials in the script config
- Verify the login form selectors match your app

**Screenshots are blank:**
- Increase wait times in the script
- Check if the dev server is running

**Pages not loading:**
- Ensure the dev server is running on port 3000
- Check for JavaScript errors in the browser console
