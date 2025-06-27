# Testing Guide for Triumph Tracker

This document outlines testing procedures to ensure the quality, performance, and accessibility of the Triumph Tracker application.

## 1. Functional Testing (Manual)

Verify that all core features work as expected.

### Dashboard View (`/`)
- **Timer Logic:**
  - [ ] **Start Timer:** Click "Start Timer". Verify the timer begins counting up from 0.
  - [ ] **Persistence:** Refresh the page. The timer should continue from where it left off.
  - [ ] **Stop/Record Setback:** Click "Record a Setback".
  - [ ] **Setback Modal:** Verify the dialog appears.
  - [ ] **Input Validation:** Try to submit without a reason or type. Verify error toasts appear.
  - [ ] **Record Setback:** Enter a reason, select a type (e.g., "Stress"), and click "Confirm Setback".
  - [ ] **State Reset:** Verify the timer stops and resets, and the dialog closes.
  - [ ] **New Type Creation:** In the setback modal, type a new category (e.g., "Boredom") into the combobox and select the "Create" option. Verify the new type is added and selected.
- **History Log:**
  - [ ] **New Entry:** After recording a setback, verify a new card appears in the "Streak History" log.
  - [ ] **Data Correctness:** Check that the new entry displays the correct reason, type, duration, start time, and end time.
  - [ ] **Delete Entry:** Click the trash icon on a history entry. Verify it is removed from the list.
  - [ ] **Clear All:** Click "Clear All". In the confirmation dialog, click "Continue". Verify all history entries are deleted.
- **AI Motivational Message:**
  - [ ] Verify the "AI Coach" card displays a message.
  - [ ] The sentiment icon (Sparkles, Shield, Party Popper) should change based on progress.

### Reports View (`/reports`)
- [ ] **Navigation:** Click the "Reports" link in the header. Verify the reports page loads.
- [ ] **Filtering:** Use the year and month dropdowns to filter the data.
- [ ] **Chart:** Verify the "Setbacks by Type" bar chart updates correctly based on the filter.
- [ ] **Detailed Log:** Verify the table below the chart shows the correct, filtered entries.
- [ ] **Empty State:** Filter to a date range with no data. Verify the "No setbacks recorded" message appears.

### General
- [ ] **Theme Toggle:** Click the new theme toggle in the header. Verify the UI switches between Light and Dark modes correctly.
- [ ] **PWA Installation:** In a supported browser (e.g., Chrome), check for an "Install" icon in the address bar. Verify the app can be installed locally.
- [ ] **Offline Support:** Disconnect from the network (using browser DevTools). Refresh the page. Verify the app loads from the cache.

## 2. Performance Testing (Browser DevTools)

Use your browser's developer tools to identify and fix performance bottlenecks.

- **Lighthouse Audit:**
  1. Open DevTools > `Lighthouse`.
  2. Select "Navigation" mode and check all categories (Performance, Accessibility, Best Practices, SEO, PWA).
  3. Click "Analyze page load".
  4. Review the report. Aim for scores above 90 in all categories. Address any issues identified.

- **Rendering Performance:**
  1. Open DevTools > `Performance`.
  2. Click the "Record" button.
  3. Perform key actions: start the timer, open the setback dialog, record a setback, switch to the reports page.
  4. Stop recording.
  5. Analyze the timeline for "Long Tasks" (red-flagged tasks) that block the main thread. Look for ways to optimize them.

- **Memory Usage:**
  1. Open DevTools > `Memory`.
  2. Select "Heap snapshot" and take a snapshot of the initial state.
  3. Add 50-100 history entries programmatically or manually.
  4. Take a second snapshot.
  5. Clear all history entries.
  6. Take a third snapshot.
  7. Compare the snapshots. The memory usage in the third snapshot should be close to the first one. If it's significantly higher, it may indicate a memory leak.

- **Network Transfer:**
  1. Open DevTools > `Network`.
  2. Enable "Disable cache".
  3. Refresh the page.
  4. Check the total size of transferred resources. Look for unoptimized images or large JavaScript bundles that could be code-split or optimized further.
  5. Use the "Throttling" dropdown to simulate "Slow 3G" and test the user experience on slow connections.

## 3. Accessibility Testing

- **Automated:** Use the Lighthouse audit for an initial accessibility check.
- **Manual:**
  - **Keyboard Navigation:** Can you navigate and operate the entire app using only the Tab, Shift+Tab, Enter, and Space keys? All interactive elements (buttons, links, inputs) should be focusable and operable.
  - **Screen Reader:** Use a screen reader (e.g., NVDA, VoiceOver) to navigate the app. Are all elements announced clearly? Do images have `alt` text (or `aria-hidden` if decorative)?
  - **Color Contrast:** Use a color contrast checker tool to ensure all text has sufficient contrast against its background, especially in both light and dark modes.
