---
applyTo: "**/*"
description: "FR-017: Review & Rating - Farm/product ratings (1-5 stars), verified purchase badge, moderation, farmer responses, helpfulness voting, review reminders"
---

# FR-017: REVIEW & RATING

**Share Your Farm Experience**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-017
Priority: P1 - High
Effort: 21 story points (≈ 1 week)
Value: 90/100
Dependencies: FR-016 (Order Tracking)
```

---

## 🎯 KEY REQUIREMENTS

### Farm Ratings

```yaml
Aggregate Rating:
  - Overall: 4.7 stars (based on 24 reviews)
  - Breakdown:
      - 5 stars: 18 reviews (75%)
      - 4 stars: 4 reviews (17%)
      - 3 stars: 2 reviews (8%)
      - 2 stars: 0
      - 1 star: 0

Display Location:
  - Farm profile page: Prominent near top
  - Search results: Star rating on card
  - Product pages: Farm rating shown
```

### Product Reviews

```yaml
Review Form:
  - Star rating: 1-5 stars (required)
  - Review text: 500 chars max (optional)
  - Photo upload: Optional product photo
  - Verified purchase: Badge auto-added

Review Display:
  - Reviewer: Name (first name + last initial)
  - Date: "2 weeks ago"
  - Verified: "Verified Purchase" badge
  - Rating: 5 stars
  - Text: Review content
  - Helpful votes: "12 people found this helpful"
  - Farmer response: Optional reply from farmer
```

### Moderation

```yaml
Auto-Moderation:
  - Profanity filter: Flag inappropriate language
  - Spam detection: Block obvious spam/bots
  - Duplicate detection: Prevent multiple reviews same order

Manual Review:
  - Flagging: Users can report inappropriate reviews
  - Admin review: Platform reviews flagged content
  - Actions: Approve, edit, remove
  - Appeals: Users notified of removals with reason
```

### Farmer Responses

```yaml
Response Capability:
  - Farmers can: Reply publicly to reviews
  - Character limit: 500 chars
  - Tone guidelines: Professional, appreciative
  - Display: Below review, labeled "Response from Farmer"

Example: "Thank you Sarah! We're so glad you enjoyed our tomatoes.
  Come visit us at the Downtown Market this Saturday!"
```

### Helpfulness Voting

- **Thumbs up/down**: Users vote on review helpfulness
- **Sort by helpful**: Most helpful reviews shown first
- **Gamification**: Reviewers see "12 found this helpful"

### Review Reminders

```yaml
Timing:
  - Email reminder: 3 days after order fulfilled
  - Subject: "How was your order from Sunny Valley Farm?"
  - Content: Quick link to review form

Incentive (Optional):
  - Discount: "Leave a review, get 5% off next order"
  - Badge: "Trusted Reviewer" badge after 10 reviews
```

---

## 📊 SUCCESS METRICS

| Metric               | Target                      |
| -------------------- | --------------------------- |
| Review rate          | >30% customers leave review |
| Average rating       | >4.5 stars overall          |
| Farmer response rate | >60% respond to reviews     |
| Moderation flags     | <2% reviews flagged         |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
