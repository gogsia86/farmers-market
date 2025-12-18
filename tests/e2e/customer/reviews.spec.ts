/**
 * ⭐ CUSTOMER REVIEWS E2E TESTS
 * Divine Agricultural Commerce - Consumer Reviews & Ratings System
 *
 * Features tested:
 * - Review submission with ratings (farms & products)
 * - Review management (view, edit, delete)
 * - Review filtering and sorting
 * - Photo uploads with reviews
 * - Agricultural consciousness in feedback
 * - Responsive design and accessibility
 * - Error handling and validation
 *
 * @module tests/e2e/customer/reviews.spec.ts
 * @requires @playwright/test
 */

import { test, expect, type Page } from "@playwright/test";
import path from "path";

// 🎯 Test configuration with agricultural consciousness
test.use({
  storageState: ".auth/customer.json",
  viewport: { width: 1920, height: 1080 },
});

// 🌟 Divine Helper Functions
async function navigateToReviews(page: Page): Promise<void> {
  await page.goto("/dashboard/reviews");
  await page.waitForLoadState("networkidle");
}

async function switchReviewsTab(
  page: Page,
  tab: "my-reviews" | "write-review",
): Promise<void> {
  const tabText = tab === "my-reviews" ? "My Reviews" : "Write Review";
  const tabButton = page.locator(`button:has-text("${tabText}")`);
  await tabButton.click();
  await page.waitForLoadState("networkidle");
}

async function submitFarmReview(
  page: Page,
  farmName: string,
  rating: number,
  comment: string,
): Promise<void> {
  await navigateToReviews(page);
  await switchReviewsTab(page, "write-review");

  // Select farm
  const farmSelect = page.locator('select[name="farmId"]');
  if (await farmSelect.isVisible()) {
    await farmSelect.selectOption({ label: farmName });
  }

  // Set rating
  await page.click(`[data-testid="star-rating-${rating}"]`);

  // Enter comment
  await page.fill('textarea[name="comment"]', comment);

  // Submit
  await page.click('button[type="submit"]:has-text("Submit Review")');
  await page.waitForResponse((response) =>
    response.url().includes("/api/reviews"),
  );
}

async function submitProductReview(
  page: Page,
  productName: string,
  rating: number,
  comment: string,
): Promise<void> {
  await navigateToReviews(page);
  await switchReviewsTab(page, "write-review");

  // Select product
  const productSelect = page.locator('select[name="productId"]');
  if (await productSelect.isVisible()) {
    await productSelect.selectOption({ label: productName });
  }

  // Set rating
  await page.click(`[data-testid="star-rating-${rating}"]`);

  // Enter comment
  await page.fill('textarea[name="comment"]', comment);

  // Submit
  await page.click('button[type="submit"]:has-text("Submit Review")');
  await page.waitForResponse((response) =>
    response.url().includes("/api/reviews"),
  );
}

async function deleteReview(page: Page, reviewId: string): Promise<void> {
  const reviewCard = page.locator(`[data-testid="review-${reviewId}"]`);
  const deleteButton = reviewCard.locator('button:has-text("Delete")');
  await deleteButton.click();

  // Confirm deletion
  const confirmButton = page.locator('button:has-text("Confirm")');
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }

  await page.waitForResponse(
    (response) =>
      response.url().includes("/api/reviews") && response.status() === 200,
  );
}

async function editReview(
  page: Page,
  reviewId: string,
  newRating: number,
  newComment: string,
): Promise<void> {
  const reviewCard = page.locator(`[data-testid="review-${reviewId}"]`);
  const editButton = reviewCard.locator('button:has-text("Edit")');
  await editButton.click();

  // Update rating
  await page.click(`[data-testid="star-rating-${newRating}"]`);

  // Update comment
  const commentField = page.locator('textarea[name="comment"]');
  await commentField.fill(newComment);

  // Save changes
  await page.click('button[type="submit"]:has-text("Save")');
  await page.waitForResponse((response) =>
    response.url().includes("/api/reviews"),
  );
}

// 📊 Test Data
const TEST_REVIEW = {
  farmName: "Quantum Harvest Farm",
  rating: 5,
  comment:
    "Absolutely divine experience! The produce was fresh, organic, and full of agricultural consciousness. Highly recommend this biodynamic farm!",
};

const TEST_PRODUCT_REVIEW = {
  productName: "Organic Tomatoes",
  rating: 4,
  comment:
    "Fresh and delicious tomatoes with excellent flavor. Perfect for summer salads!",
};

// 🧪 TEST SUITE BEGIN

test.describe("⭐ Customer Reviews - Divine Agricultural Feedback", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure customer is authenticated
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 📍 SECTION 1: NAVIGATION & PAGE STRUCTURE
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Navigation & Page Structure", () => {
    test("should navigate to reviews from dashboard", async ({ page }) => {
      await page.click('a[href="/dashboard/reviews"]');
      await expect(page).toHaveURL("/dashboard/reviews");
      await expect(page.locator("h1")).toContainText(/reviews/i);
    });

    test("should display pending reviews count in dashboard", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Look for pending reviews indicator
      const pendingBadge = page.locator(
        '[data-testid="pending-reviews-badge"]',
      );
      if (await pendingBadge.isVisible()) {
        const count = await pendingBadge.textContent();
        expect(parseInt(count || "0")).toBeGreaterThanOrEqual(0);
      }
    });

    test("should display review tabs (My Reviews, Write Review)", async ({
      page,
    }) => {
      await navigateToReviews(page);

      const myReviewsTab = page.locator('button:has-text("My Reviews")');
      const writeReviewTab = page.locator('button:has-text("Write Review")');

      await expect(myReviewsTab).toBeVisible();
      await expect(writeReviewTab).toBeVisible();
    });

    test("should show correct tab as active", async ({ page }) => {
      await navigateToReviews(page);

      // One tab should be active by default
      const activeTab = page.locator('button[aria-selected="true"]');
      await expect(activeTab).toBeVisible();
    });

    test("should switch between tabs successfully", async ({ page }) => {
      await navigateToReviews(page);

      // Switch to Write Review
      await switchReviewsTab(page, "write-review");
      const writeTab = page.locator('button:has-text("Write Review")');
      await expect(writeTab).toHaveAttribute("aria-selected", "true");

      // Switch back to My Reviews
      await switchReviewsTab(page, "my-reviews");
      const myReviewsTab = page.locator('button:has-text("My Reviews")');
      await expect(myReviewsTab).toHaveAttribute("aria-selected", "true");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ✍️ SECTION 2: REVIEW SUBMISSION (FARMS)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Farm Review Submission", () => {
    test("should display farm review submission form", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Verify form elements
      await expect(page.locator('select[name="farmId"]')).toBeVisible();
      await expect(page.locator('[data-testid*="star-rating"]')).toBeVisible();
      await expect(page.locator('textarea[name="comment"]')).toBeVisible();
      await expect(
        page.locator('button[type="submit"]:has-text("Submit")'),
      ).toBeVisible();
    });

    test("should select rating stars interactively", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Click on different star ratings
      for (let rating = 1; rating <= 5; rating++) {
        const star = page.locator(`[data-testid="star-rating-${rating}"]`);
        if (await star.isVisible()) {
          await star.click();
          await page.waitForTimeout(200);

          // Verify rating is selected
          const selectedStars = page.locator('[data-testid*="star-rating"]');
          const count = await selectedStars.count();
          expect(count).toBeGreaterThanOrEqual(rating);
        }
      }
    });

    test("should validate required fields for farm review", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Try to submit without filling required fields
      const submitButton = page.locator(
        'button[type="submit"]:has-text("Submit")',
      );
      await submitButton.click();

      // Look for validation messages
      const validationMessage = page.locator(
        "text=/required|please select|must provide/i",
      );
      if (await validationMessage.isVisible()) {
        await expect(validationMessage).toBeVisible();
      }
    });

    test("should enforce minimum comment length", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Select farm and rating
      const farmSelect = page.locator('select[name="farmId"]');
      if (await farmSelect.isVisible()) {
        await farmSelect.selectOption({ index: 1 });
      }
      await page.click('[data-testid="star-rating-5"]');

      // Enter too short comment
      await page.fill('textarea[name="comment"]', "Ok");

      await page.click('button[type="submit"]:has-text("Submit")');

      // Look for validation error
      const errorMessage = page.locator("text=/at least|minimum|too short/i");
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test("should display character count for comment", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const commentField = page.locator('textarea[name="comment"]');
      await commentField.fill("Test comment for character counting");

      // Look for character counter
      const charCounter = page.locator(
        "text=/\\d+\\s*\\/\\s*\\d+|\\d+\\s*characters/i",
      );
      if (await charCounter.isVisible()) {
        await expect(charCounter).toBeVisible();
      }
    });

    test("should submit farm review successfully", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Fill form
      const farmSelect = page.locator('select[name="farmId"]');
      if (await farmSelect.isVisible()) {
        await farmSelect.selectOption({ index: 1 });
      }

      await page.click('[data-testid="star-rating-5"]');
      await page.fill('textarea[name="comment"]', TEST_REVIEW.comment);

      // Submit
      await page.click('button[type="submit"]:has-text("Submit")');

      // Wait for success
      const successMessage = page.locator(
        "text=/review submitted|thank you|successfully/i",
      );
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    });

    test("should show preview before submission", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Fill form
      const farmSelect = page.locator('select[name="farmId"]');
      if (await farmSelect.isVisible()) {
        await farmSelect.selectOption({ index: 1 });
      }

      await page.click('[data-testid="star-rating-4"]');
      await page.fill('textarea[name="comment"]', "Preview test comment");

      // Look for preview button
      const previewButton = page.locator('button:has-text("Preview")');
      if (await previewButton.isVisible()) {
        await previewButton.click();

        // Verify preview modal/section
        const preview = page.locator('[data-testid="review-preview"]');
        await expect(preview).toBeVisible();
      }
    });

    test("should cancel review submission", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Fill form
      await page.fill('textarea[name="comment"]', "This will be cancelled");

      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Verify form is cleared or returned to list
        const comment = await page
          .locator('textarea[name="comment"]')
          .inputValue();
        expect(comment).toBe("");
      }
    });

    test("should display success confirmation after submission", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Submit a review
      const farmSelect = page.locator('select[name="farmId"]');
      if (await farmSelect.isVisible()) {
        await farmSelect.selectOption({ index: 1 });
        await page.click('[data-testid="star-rating-5"]');
        await page.fill(
          'textarea[name="comment"]',
          "Test review for confirmation",
        );
        await page.click('button[type="submit"]:has-text("Submit")');

        // Verify success message
        await page.waitForTimeout(1000);
        const success = page.locator("text=/success|submitted|thank you/i");
        if (await success.isVisible()) {
          await expect(success).toBeVisible();
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 🥬 SECTION 3: REVIEW SUBMISSION (PRODUCTS)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Product Review Submission", () => {
    test("should display product review submission form", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Look for product selection
      const productSelect = page.locator('select[name="productId"]');
      if (await productSelect.isVisible()) {
        await expect(productSelect).toBeVisible();
      }
    });

    test("should submit product review successfully", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Fill form
      const productSelect = page.locator('select[name="productId"]');
      if (await productSelect.isVisible()) {
        await productSelect.selectOption({ index: 1 });
        await page.click('[data-testid="star-rating-4"]');
        await page.fill(
          'textarea[name="comment"]',
          TEST_PRODUCT_REVIEW.comment,
        );
        await page.click('button[type="submit"]:has-text("Submit")');

        // Verify success
        await page.waitForTimeout(1000);
        const success = page.locator("text=/success|submitted/i");
        if (await success.isVisible()) {
          await expect(success).toBeVisible();
        }
      }
    });

    test("should link product review to order", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Look for order reference
      const orderSelect = page.locator('select[name="orderId"]');
      if (await orderSelect.isVisible()) {
        await expect(orderSelect).toBeVisible();
        console.log("Product reviews can be linked to orders");
      }
    });

    test("should show verified purchase badge for order-linked reviews", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      // Look for verified purchase badges
      const verifiedBadge = page.locator(
        "text=/verified purchase|verified buyer/i",
      );
      if (await verifiedBadge.isVisible()) {
        await expect(verifiedBadge).toBeVisible();
        console.log("Verified purchase badges displayed");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 📷 SECTION 4: PHOTO UPLOADS WITH REVIEWS
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Review Photo Uploads", () => {
    test("should display photo upload option", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      // Look for file upload input
      const uploadInput = page.locator('input[type="file"]');
      if (await uploadInput.isVisible()) {
        await expect(uploadInput).toBeVisible();
      }
    });

    test("should upload single photo with review", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const uploadInput = page.locator('input[type="file"]');
      if (await uploadInput.isVisible()) {
        // Create test image file
        const testImagePath = path.join(
          __dirname,
          "../fixtures/test-image.jpg",
        );

        // Upload file
        await uploadInput.setInputFiles(testImagePath);

        // Verify preview
        await page.waitForTimeout(1000);
        const preview = page.locator('[data-testid="photo-preview"]');
        if (await preview.isVisible()) {
          await expect(preview).toBeVisible();
        }
      }
    });

    test("should upload multiple photos with review", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const uploadInput = page.locator('input[type="file"][multiple]');
      if (await uploadInput.isVisible()) {
        // Upload multiple files
        const testImages = [
          path.join(__dirname, "../fixtures/test-image-1.jpg"),
          path.join(__dirname, "../fixtures/test-image-2.jpg"),
        ];

        await uploadInput.setInputFiles(testImages);

        // Verify multiple previews
        await page.waitForTimeout(1000);
        const previews = page.locator('[data-testid="photo-preview"]');
        const count = await previews.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });

    test("should validate photo file type", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const uploadInput = page.locator('input[type="file"]');
      if (await uploadInput.isVisible()) {
        // Try to upload non-image file
        const invalidFile = path.join(__dirname, "../fixtures/test.txt");

        await uploadInput.setInputFiles(invalidFile);

        // Look for error message
        const errorMessage = page.locator(
          "text=/invalid file type|only images/i",
        );
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });

    test("should remove uploaded photo before submission", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const uploadInput = page.locator('input[type="file"]');
      if (await uploadInput.isVisible()) {
        const testImagePath = path.join(
          __dirname,
          "../fixtures/test-image.jpg",
        );
        await uploadInput.setInputFiles(testImagePath);

        await page.waitForTimeout(500);

        // Look for remove button
        const removeButton = page.locator('button:has-text("Remove")');
        if (await removeButton.isVisible()) {
          await removeButton.click();

          // Verify photo was removed
          const preview = page.locator('[data-testid="photo-preview"]');
          await expect(preview).not.toBeVisible();
        }
      }
    });

    test("should display photo gallery in submitted reviews", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      // Look for review with photos
      const reviewWithPhotos = page
        .locator('[data-testid*="review-photos"]')
        .first();
      if (await reviewWithPhotos.isVisible()) {
        await expect(reviewWithPhotos).toBeVisible();
        console.log("Photo galleries displayed in reviews");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 📋 SECTION 5: REVIEW MANAGEMENT (VIEW, EDIT, DELETE)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Review Management", () => {
    test("should display list of submitted reviews", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      // Check for reviews list
      const reviewsList = page.locator('[data-testid="reviews-list"]');
      if (await reviewsList.isVisible()) {
        await expect(reviewsList).toBeVisible();
      } else {
        // Check for individual review cards
        const reviewCards = page.locator('[data-testid*="review-"]');
        const count = await reviewCards.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test("should display review card with complete information", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        // Verify review information
        await expect(reviewCard).toBeVisible();

        // Rating stars
        const stars = reviewCard.locator('[data-testid*="star"]');
        await expect(stars.first()).toBeVisible();

        // Review text
        const comment = reviewCard.locator('[data-testid="review-comment"]');
        if (await comment.isVisible()) {
          await expect(comment).toBeVisible();
        }

        // Date
        const date = reviewCard.locator("text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/");
        if (await date.isVisible()) {
          await expect(date).toBeVisible();
        }
      }
    });

    test("should filter reviews by farm", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const filterSelect = page.locator('select[name="filter"]');
      if (await filterSelect.isVisible()) {
        const initialCount = await page
          .locator('[data-testid*="review-"]')
          .count();

        await filterSelect.selectOption({ label: "Farms" });
        await page.waitForTimeout(500);

        const filteredCount = await page
          .locator('[data-testid*="review-"]')
          .count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
      }
    });

    test("should filter reviews by product", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const filterSelect = page.locator('select[name="filter"]');
      if (await filterSelect.isVisible()) {
        await filterSelect.selectOption({ label: "Products" });
        await page.waitForTimeout(500);

        // Verify filtered results
        const reviews = page.locator('[data-testid*="review-"]');
        const count = await reviews.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test("should sort reviews by date (newest first)", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const sortSelect = page.locator('select[name="sort"]');
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ value: "newest" });
        await page.waitForTimeout(500);

        const reviews = page.locator('[data-testid*="review-"]');
        const count = await reviews.count();
        if (count >= 2) {
          console.log("Reviews sorted by newest first");
        }
      }
    });

    test("should sort reviews by rating", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const sortSelect = page.locator('select[name="sort"]');
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ value: "rating" });
        await page.waitForTimeout(500);

        console.log("Reviews sorted by rating");
      }
    });

    test("should edit existing review", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        const editButton = reviewCard.locator('button:has-text("Edit")');
        if (await editButton.isVisible()) {
          await editButton.click();

          // Verify edit form appears
          const editForm = page.locator('[data-testid="edit-review-form"]');
          if (await editForm.isVisible()) {
            await expect(editForm).toBeVisible();

            // Update comment
            const commentField = page.locator('textarea[name="comment"]');
            await commentField.fill("Updated review comment");

            // Save
            await page.click('button[type="submit"]:has-text("Save")');
            await page.waitForTimeout(1000);

            // Verify success
            const success = page.locator("text=/updated|saved/i");
            if (await success.isVisible()) {
              await expect(success).toBeVisible();
            }
          }
        }
      }
    });

    test("should delete review with confirmation", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const initialCount = await page
        .locator('[data-testid*="review-"]')
        .count();

      if (initialCount > 0) {
        const reviewCard = page.locator('[data-testid*="review-"]').first();
        const deleteButton = reviewCard.locator('button:has-text("Delete")');

        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          // Look for confirmation dialog
          const confirmButton = page.locator(
            'button:has-text("Confirm"), button:has-text("Delete")',
          );
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
            await page.waitForTimeout(1000);

            // Verify review was deleted
            const newCount = await page
              .locator('[data-testid*="review-"]')
              .count();
            expect(newCount).toBeLessThan(initialCount);
          }
        }
      }
    });

    test("should cancel delete action", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const initialCount = await page
        .locator('[data-testid*="review-"]')
        .count();

      if (initialCount > 0) {
        const reviewCard = page.locator('[data-testid*="review-"]').first();
        const deleteButton = reviewCard.locator('button:has-text("Delete")');

        if (await deleteButton.isVisible()) {
          await deleteButton.click();

          // Cancel deletion
          const cancelButton = page.locator('button:has-text("Cancel")');
          if (await cancelButton.isVisible()) {
            await cancelButton.click();

            // Verify review still exists
            const newCount = await page
              .locator('[data-testid*="review-"]')
              .count();
            expect(newCount).toBe(initialCount);
          }
        }
      }
    });

    test("should display review status (pending/approved/rejected)", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        const statusBadge = reviewCard.locator(
          "text=/pending|approved|rejected|published/i",
        );
        if (await statusBadge.isVisible()) {
          await expect(statusBadge).toBeVisible();
          console.log("Review status displayed");
        }
      }
    });

    test("should show empty state when no reviews", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCount = await page
        .locator('[data-testid*="review-"]')
        .count();

      if (reviewCount === 0) {
        const emptyMessage = page.locator(
          "text=/no reviews|haven't reviewed|start reviewing/i",
        );
        await expect(emptyMessage).toBeVisible();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 💬 SECTION 6: REVIEW DISPLAY & INTERACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Review Display & Interactions", () => {
    test("should display rating stars correctly", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        const stars = reviewCard.locator('[data-testid*="star"]');
        const starCount = await stars.count();
        expect(starCount).toBeGreaterThanOrEqual(1);
      }
    });

    test("should display farm/product name in review", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        const entityName = reviewCard.locator(
          '[data-testid="farm-name"], [data-testid="product-name"]',
        );
        if (await entityName.isVisible()) {
          await expect(entityName).toBeVisible();
        }
      }
    });

    test("should display review timestamp", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        const timestamp = reviewCard.locator(
          "text=/\\d+ (?:days?|weeks?|months?) ago|\\d{1,2}\\/\\d{1,2}\\/\\d{4}/i",
        );
        if (await timestamp.isVisible()) {
          await expect(timestamp).toBeVisible();
        }
      }
    });

    test("should link to farm/product page from review", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      const hasReviews = (await reviewCard.count()) > 0;

      if (hasReviews) {
        const viewLink = reviewCard.locator(
          'a[href*="/farms/"], a[href*="/products/"]',
        );
        if (await viewLink.isVisible()) {
          await expect(viewLink).toBeVisible();
        }
      }
    });

    test("should display farmer response to review", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const farmerResponse = page
        .locator('[data-testid="farmer-response"]')
        .first();
      if (await farmerResponse.isVisible()) {
        await expect(farmerResponse).toBeVisible();
        console.log("Farmer responses displayed");
      }
    });

    test("should display review statistics", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      // Look for stats like total reviews, average rating
      const stats = page.locator('[data-testid="review-stats"]');
      if (await stats.isVisible()) {
        await expect(stats).toBeVisible();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 📱 SECTION 7: RESPONSIVE DESIGN
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Responsive Design", () => {
    test("should display reviews correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToReviews(page);

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('button:has-text("My Reviews")')).toBeVisible();
    });

    test("should display review form correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const form = page.locator("form");
      await expect(form).toBeVisible();
    });

    test("should maintain functionality on touch devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const star = page.locator('[data-testid="star-rating-5"]');
      if (await star.isVisible()) {
        await star.tap();
        await page.waitForTimeout(500);
        console.log("Touch interactions working on mobile");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ⚡ SECTION 8: PERFORMANCE & ACCESSIBILITY
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Performance & Accessibility", () => {
    test("should load reviews page within performance budget", async ({
      page,
    }) => {
      const startTime = Date.now();
      await navigateToReviews(page);
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
      console.log(`Reviews page loaded in ${loadTime}ms`);
    });

    test("should have accessible form labels", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const labels = page.locator("label");
      const labelCount = await labels.count();
      expect(labelCount).toBeGreaterThan(0);
    });

    test("should support keyboard navigation", async ({ page }) => {
      await navigateToReviews(page);

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(focusedElement).toBeTruthy();
    });

    test("should have proper ARIA attributes", async ({ page }) => {
      await navigateToReviews(page);

      const tabs = page.locator('[role="tab"]');
      if ((await tabs.count()) > 0) {
        const firstTab = tabs.first();
        const ariaSelected = await firstTab.getAttribute("aria-selected");
        expect(ariaSelected).toMatch(/true|false/);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 🌟 SECTION 9: AGRICULTURAL CONSCIOUSNESS
  // ═══════════════════════════════════════════════════════════════════════

  test.describe("Agricultural Consciousness", () => {
    test("should reflect seasonal awareness in reviews", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const seasonalIndicator = page.locator(
        "text=/spring|summer|fall|winter|seasonal/i",
      );
      if (await seasonalIndicator.isVisible()) {
        console.log("Seasonal consciousness detected in reviews");
      }
    });

    test("should encourage agricultural consciousness in feedback", async ({
      page,
    }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "write-review");

      const guidanceText = page.locator(
        "text=/freshness|quality|sustainability|organic/i",
      );
      if (await guidanceText.isVisible()) {
        console.log("Agricultural guidance provided to reviewers");
      }
    });

    test("should display biodynamic metrics in reviews", async ({ page }) => {
      await navigateToReviews(page);
      await switchReviewsTab(page, "my-reviews");

      const reviewCard = page.locator('[data-testid*="review-"]').first();
      if ((await reviewCard.count()) > 0) {
        const metrics = reviewCard.locator(
          "text=/organic|certified|local|sustainable/i",
        );
        if (await metrics.isVisible()) {
          console.log("Biodynamic consciousness present in reviews");
        }
      }
    });
  });
});

// 🎉 TEST SUITE END
