import { test, expect } from '@playwright/test';

test('Full Quiz Flow', async ({ page }) => {
    // 1. Navigate to Home
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Master Product Management');

    // Wait for categories to load
    await page.waitForSelector('.card');

    // 2. Select a Category
    const cards = page.locator('.card');
    const count = await cards.count();
    console.log(`Found ${count} category cards`);

    if (count === 0) {
        throw new Error('No category cards found!');
    }

    const categoryCard = cards.first();
    const categoryName = await categoryCard.locator('h3').textContent();
    console.log(`Clicking category: ${categoryName}`);

    // Force click if needed, but standard click should work.
    // We expect navigation.
    await categoryCard.click();

    // 3. Verify Subcategory Page
    // We expect the URL to change to /category/[id]
    await page.waitForURL(/\/category\/\d+/);

    await expect(page.locator('h1')).toBeVisible();

    // Go to Subcategory
    // Assuming the Category page also lists Subcategories as .card
    await page.waitForSelector('.card');
    const subCards = page.locator('.card');
    const subCount = await subCards.count();
    console.log(`Found ${subCount} subcategory cards`);

    // Click first subcategory or its Start button
    // In Category page (which we haven't seen code for, but assuming standard list), 
    // let's click the first one.
    const firstSub = subCards.first();
    await firstSub.click();

    // This should take us to /subcategory/[id]
    await page.waitForURL(/\/subcategory\/\d+/);
    await expect(page.locator('h1')).toBeVisible();

    // 4. Start Stage 1
    // Find "Start" button for Stage 1
    console.log("Looking for Stage 1...");
    // Use a more specific locator if possible.
    // The stages list is in a flex column.
    // Stage 1 is likely the first one.
    // Text "Stage 1" inside h3.
    const stage1Card = page.locator('.card', { hasText: 'Stage 1' });
    await expect(stage1Card).toBeVisible();

    const startButton = stage1Card.locator('button');
    await expect(startButton).toBeVisible();

    const btnText = await startButton.textContent();
    console.log(`Stage 1 button text: ${btnText}`);

    await startButton.click();

    // 5. Quiz Page
    await page.waitForURL(/\/test\//);

    // Verify Question Text
    await expect(page.locator('h2')).toBeVisible();
    const questionText = await page.locator('h2').textContent();
    console.log(`Question: ${questionText}`);

    // Answer a question
    const optionA = page.locator('button').filter({ hasText: /^A\./ });
    await expect(optionA).toBeVisible();
    await optionA.click({ force: true });

    // Verify Feedback
    const nextButton = page.locator('button').filter({ hasText: /Next Question|Finish Stage/ });
    await expect(nextButton).toBeVisible();

    // Click Next
    await nextButton.click();
});
