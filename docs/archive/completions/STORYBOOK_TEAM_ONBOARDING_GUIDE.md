# 🌱 Farmers Market Storybook - Team Onboarding Guide

**Welcome to the Agricultural Design System!** 🌾
**Version:** 1.0.0
**Last Updated:** October 16, 2025
**Storybook URL:** <<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>

---

## 👋 Welcome

This guide will help you get started with our component library, whether you're a **designer**, **developer**, **QA tester**, or **stakeholder**. Our Storybook contains **200+ stories** across **14 component categories** with full agricultural theming.

---

## 🎯 Quick Start by Role

### 🎨 For Designers
### What you'll use Storybook for
- Browse all 50+ UI components
- Test component interactions
- Review agricultural theming
- Provide design feedback
- Approve visual changes

**Start here:** [Designer Onboarding](#-designer-onboarding)

---

### 👨‍💻 For Developers
### What you'll use Storybook for
- View component APIs
- Copy code examples
- Test edge cases
- Write new stories
- Debug component issues

**Start here:** [Developer Onboarding](#-developer-onboarding)

---

### 🧪 For QA Testers
### What you'll use Storybook for
- Test all component states
- Verify accessibility
- Report visual bugs
- Review visual regressions
- Test responsive behavior

**Start here:** [QA Onboarding](#-qa-tester-onboarding)

---

### 📊 For Stakeholders
### What you'll use Storybook for
- Review project progress
- Preview features
- Provide feedback
- Approve designs
- Track visual changes

**Start here:** [Stakeholder Onboarding](#-stakeholder-onboarding)

---

## 🎨 DESIGNER ONBOARDING

### Step 1: Access Storybook
### Live Storybook URL
<<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>

No login required! Just click and explore.

---

### Step 2: Navigate the Interface

#### **Left Sidebar - Component Categories**

```text
📁 Introduction                    ← Start here!
📁 Design Tokens                   ← Colors, typography, spacing
📁 Agricultural Theme              ← Our unique green/earth palette
📁 Usage Patterns                  ← Best practices
📁 Accessibility                   ← WCAG guidelines

📦 Components
  ├─ 🔘 Button (25 stories)       ← All button variants
  ├─ ✏️ Input (20 stories)        ← Form inputs
  ├─ 🃏 Card (30 stories)         ← Card layouts
  ├─ 🪟 Modal (20 stories)        ← Dialogs & alerts
  ├─ 🔔 Toast (15 stories)        ← Notifications
  ├─ 📊 Dashboard (55 stories)    ← Dashboard components
  ├─ 📈 Charts (40 stories)       ← Data visualizations
  └─ 🌾 Metrics (20 stories)      ← Agricultural metric cards
```

#### **Main Canvas - Component Preview**

- **Interactive component** renders in real-time
- **Zoom controls** (top-right) for detail inspection
- **Viewport switcher** for responsive testing

#### **Bottom Panel - Controls & Documentation**

- **Controls:** Adjust props interactively
- **Actions:** See event logs (clicks, changes)
- **Docs:** Read component documentation
- **Code:** View implementation

---

### Step 3: Explore Component Categories

#### **Start with Core UI Components**

1. **Click "Button" in sidebar**
2. **Try these stories:**
   - `Button/Default` - Standard button
   - `Button/Agricultural` - Green primary button
   - `Button/Harvest` - Amber completion button
   - `Button/With Icon` - Buttons with icons
   - `Button/Loading` - Loading states

3. **Use Controls panel:**
   - Change `variant` to see all styles
   - Toggle `disabled` to see disabled state
   - Adjust `size` (sm, md, lg, xl)
   - Try `loading` state

#### **Explore Agricultural Theme**

1. **Click "Agricultural Theme" in sidebar**
2. **Review our color palette:**
   - Primary green (`#2D5016`)
   - Harvest amber (`#D4A574`)
   - Earth tones (browns, warm creams)
   - Seasonal variations

3. **Check typography:**
   - Headings: Playfair Display (serif)
   - Body: Inter (sans-serif)
   - Monospace: Source Code Pro

#### **Test Interactive Components**

1. **Modal component:**
   - Click "Modal/Default"
   - Click "Open Modal" button
   - Test close behavior
   - Try different sizes

2. **Toast notifications:**
   - Click "Toast/Success"
   - Click "Show Toast" button
   - Watch auto-dismiss
   - Try different positions

---

### Step 4: Test Responsive Behavior

#### **Switch Viewports**

1. **Click viewport icon** (📱 top toolbar)
2. **Select viewports:**
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1200px

3. **Test component behavior:**
   - Dashboard collapses on mobile
   - Cards stack vertically
   - Buttons go full-width

---

### Step 5: Provide Design Feedback

#### **Option A: Direct Comments (Chromatic)**

1. **Sign up for Chromatic account** (free)
2. **Navigate to build review**
3. **Click component snapshot**
4. **Add comment** with specific feedback
5. **Tag team members** (@developer)

#### **Option B: GitHub Issues**

1. **Go to repository issues**
2. **Create new issue** with label `design-system`
3. **Include:**
   - Component name
   - Storybook URL
   - Screenshot
   - Detailed feedback
   - Suggested changes

#### **Option C: Slack Channel**

Post in `#design-system` with:

```text
Component: Button (Agricultural variant)
Issue: Green color too dark on hover
Suggestion: Lighten by 10% (#3A6C1F)
Storybook: [link to story]
Screenshot: [attached]
```

---

### Step 6: Review Visual Changes

#### **Chromatic Visual Testing Workflow**

1. **Receive notification:** "Visual changes detected in PR #123"
2. **Click Chromatic link** in notification
3. **Review side-by-side comparison:**
   - Baseline (approved) on left
   - New version (pending) on right
4. **Approve or Reject:**
   - ✅ **Approve:** Changes look good, merge PR
   - 🚫 **Reject:** Request fixes from developer

---

### Designer Quick Reference

#### **Common Tasks**

| Task             | How to Do It                    |
| ---------------- | ------------------------------- |
| Find a component | Search in left sidebar          |
| Test interaction | Click component, use controls   |
| Check colors     | View "Design Tokens" page       |
| Test mobile      | Switch viewport (top toolbar)   |
| Copy color code  | Right-click color swatch → Copy |
| Report bug       | Create GitHub issue or Slack    |
| Approve changes  | Chromatic build review          |

#### **Keyboard Shortcuts**

- `Cmd/Ctrl + K` - Search components
- `F` - Toggle fullscreen
- `A` - Toggle addons panel
- `D` - Toggle dark mode
- `T` - Toggle toolbar

---

## 👨‍💻 DEVELOPER ONBOARDING

### Step 1: Local Setup

#### **Install Dependencies**

```bash
cd v:\Projects\Farmers-Market\farmers-market
npm install
```

#### **Run Storybook Locally**

```bash
npm run storybook
```

Opens at: `http://localhost:6006`

---

### Step 2: Explore Component Code

#### **Browse Story Files**

Story files are located in:

```text
farmers-market/src/
├─ components/
│  ├─ ui/
│  │  ├─ Button.tsx
│  │  ├─ Button.stories.tsx         ← Button stories
│  │  ├─ Input.tsx
│  │  ├─ Input.stories.tsx          ← Input stories
│  │  └─ ...
│  ├─ dashboard/
│  │  ├─ DashboardShell.tsx
│  │  ├─ DashboardShell.stories.tsx ← Dashboard stories
│  │  └─ ...
│  └─ charts/
     ├─ GrowthTimeline.tsx
     ├─ GrowthTimeline.stories.tsx  ← Chart stories
     └─ ...
```

---

### Step 3: Understand Story Structure

#### **Component Story Format (CSF 3.0)**

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

// Component metadata
const meta: Meta<typeof Button> = {
  title: "Components/Button", // Sidebar location
  component: Button,
  tags: ["autodocs"], // Auto-generate docs
  argTypes: {
    // Control types
    variant: {
      control: "select",
      options: ["default", "agricultural", "harvest"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default story
export const Default: Story = {
  args: {
    children: "Click Me",
    variant: "default",
  },
};

// Agricultural variant
export const Agricultural: Story = {
  args: {
    children: "Plant Crop",
    variant: "agricultural",
  },
};

// With loading state
export const Loading: Story = {
  args: {
    children: "Processing...",
    loading: true,
  },
};
```

---

### Step 4: Write Your First Story

#### **Example: Add New Button Variant**
### 1. Create the story
```typescript
// Button.stories.tsx
export const Premium: Story = {
  args: {
    children: "Premium Feature",
    variant: "premium",
    size: "lg",
    icon: <StarIcon />,
  },
};
```
### 2. Run Storybook
```bash
npm run storybook
```
### 3. View your story
- Navigate to `Components/Button`
- See "Premium" in story list
- Test with controls

---

### Step 5: Test Component Props

#### **Use Controls Panel**

```typescript
// Add argTypes for better controls
const meta: Meta<typeof Button> = {
  // ...
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "agricultural", "harvest", "premium"],
      description: "Button style variant",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg", "xl"],
      description: "Button size",
    },
    disabled: {
      control: "boolean",
      description: "Disable button",
    },
    loading: {
      control: "boolean",
      description: "Show loading state",
    },
  },
};
```

---

### Step 6: Add Interactive Actions

#### **Log Events**

```typescript
import { action } from "@storybook/addon-actions";

export const WithActions: Story = {
  args: {
    children: "Click Me",
    onClick: action("button-clicked"),
    onMouseEnter: action("button-hovered"),
    onFocus: action("button-focused"),
  },
};
```

**View logs in Actions panel** (bottom)

---

### Step 7: Document Components

#### **Add MDX Documentation**

Create `Button.mdx`:

```mdx
import { Meta, Canvas, Story } from "@storybook/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />

# Button Component

The Button component is used for all interactive actions in the application.

## Usage

<Canvas of={ButtonStories.Default} />

## Agricultural Variant

Use this for primary agricultural actions like planting, adding to cart, etc.

<Canvas of={ButtonStories.Agricultural} />

## Props

- **variant:** Button style (`default` | `agricultural` | `harvest`)
- **size:** Button size (`sm` | `md` | `lg` | `xl`)
- **loading:** Show loading spinner
- **disabled:** Disable button interaction

## Best Practices

- Use `agricultural` variant for primary actions
- Use `harvest` variant for completion actions
- Always provide accessible labels for icon-only buttons
```

---

### Step 8: Build & Deploy

#### **Build Static Storybook**

```bash
npm run build-storybook
```

Outputs to: `farmers-market/storybook-static/`

#### **Deploy to Chromatic**

```bash
npm run chromatic
```

This will:

- Build Storybook
- Upload to Chromatic
- Run visual regression tests
- Generate shareable URL

---

### Developer Quick Reference

#### **Common Commands**

```bash
# Run Storybook locally
npm run storybook

# Build static Storybook
npm run build-storybook

# Deploy to Chromatic
npm run chromatic

# Run tests
npm run test

# Type checking
npm run type-check
```

#### **File Structure**

```text
Component.tsx          ← Component implementation
Component.stories.tsx  ← Storybook stories (CSF 3.0)
Component.test.tsx     ← Jest tests
Component.mdx          ← MDX documentation (optional)
```

#### **Helpful Resources**

- **Storybook Docs:** <<https://storybook.js.org/docs/reac>t>
- **CSF 3.0 Format:** <<https://storybook.js.org/docs/react/api/cs>f>
- **Chromatic Docs:** <<https://www.chromatic.com/doc>s>
- **Component Guide:** `STORYBOOK_COMPONENT_USAGE_GUIDE.md`

---

## 🧪 QA TESTER ONBOARDING

### Step 1: Access Storybook
### Production Storybook
<<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>

**Local Storybook** (for testing PRs):

```bash
cd v:\Projects\Farmers-Market\farmers-market
npm run storybook
```

---

### Step 2: Test Component States

#### **Systematic Testing Approach**

For each component, test:

1. **Default State**
2. **Hover State**
3. **Focus State**
4. **Active/Pressed State**
5. **Disabled State**
6. **Loading State** (if applicable)
7. **Error State** (if applicable)
8. **Success State** (if applicable)

---

### Step 3: Accessibility Testing

#### **Keyboard Navigation**

- **Tab:** Move through interactive elements
- **Enter/Space:** Activate buttons/links
- **Escape:** Close modals/dialogs
- **Arrow Keys:** Navigate lists/menus

#### **Screen Reader Testing** (Optional)

Tools:

- **Windows:** NVDA (free)
- **Mac:** VoiceOver (built-in)
- **Chrome:** ChromeVox extension

#### **Color Contrast**

- Text: 4.5:1 minimum
- UI: 3:1 minimum
- Use browser DevTools → Lighthouse → Accessibility

---

### Step 4: Responsive Testing

#### **Test All Breakpoints**

1. **Mobile:** 375px (iPhone SE)
2. **Tablet:** 768px (iPad)
3. **Desktop:** 1200px (standard)
4. **Large:** 1920px (wide screen)

#### **Check for Issues**

- Text overflow
- Broken layouts
- Hidden buttons
- Overlapping content
- Image scaling

---

### Step 5: Visual Regression Testing

#### **Chromatic Workflow**

1. **Receive notification:** "New PR ready for review"
2. **Open Chromatic link**
3. **Review visual diffs:**
   - Red = Removed pixels
   - Green = Added pixels
   - Yellow = Changed pixels
4. **Check for unintended changes:**
   - Layout shifts
   - Color changes
   - Spacing issues
   - Font changes
5. **Approve or Reject:**
   - ✅ **Approve:** Changes are intentional
   - 🚫 **Reject:** Report issues

---

### Step 6: Report Bugs

#### **Bug Report Template**

```markdown
**Component:** Button (Agricultural variant)
**Story:** Button/Agricultural
**Environment:** Chrome 118, Windows 11
**Storybook URL:** [link]
### Issue
Hover state doesn't change color on agricultural variant buttons
### Steps to Reproduce
1. Open Button/Agricultural story
2. Hover over button
3. Observe no color change
### Expected
Button should darken by 10% on hover
### Actual
No visible change

**Screenshot:** [attached]
**Priority:** Medium
**Labels:** bug, ui, button
```

---

### Step 7: Edge Case Testing

#### **Test Edge Cases**

| Component  | Edge Cases to Test                      |
| ---------- | --------------------------------------- |
| **Button** | Very long text, empty text, icon-only   |
| **Input**  | Max length, special characters, paste   |
| **Card**   | No image, very long text, empty content |
| **Modal**  | Small screen, long content, scrolling   |
| **Toast**  | Multiple toasts, very long message      |

---

### QA Quick Reference

#### **Testing Checklist**

- [ ] All states tested (default, hover, focus, disabled)
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Touch targets ≥ 44x44px
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors
- [ ] Visual regressions reviewed in Chromatic
- [ ] Edge cases tested

#### **Browser Testing**

Test in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 📊 STAKEHOLDER ONBOARDING

### Step 1: View the Component Library
### Storybook URL
<<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>
### What you'll see
- 200+ component examples
- Interactive demos
- Agricultural theming
- Real-time updates

---

### Step 2: Understand the Structure

#### **Design System Overview**

```text
✅ 5 Core UI Components
   - Button, Input, Card, Modal, Toast
   - Foundation for all interfaces

✅ 21 Dashboard Components
   - Header, Sidebar, Navigation
   - Complete dashboard system

✅ 4 Chart Components
   - Growth, Yield, Weather, Seasonal
   - Data visualization library

✅ 4 Agricultural Metric Cards
   - Crop Health, Weather, Soil, Harvest
   - Real-time farm monitoring
```

---

### Step 3: Review Key Features

#### **Interactive Demos**

1. **Click "Dashboard" in sidebar**
2. **View complete dashboard example**
3. **Test interactive features:**
   - Collapsible sidebar
   - Search functionality
   - User profile menu
   - Responsive behavior

#### **Agricultural Theming**

1. **Click "Agricultural Theme"**
2. **Review color palette:**
   - Primary green: `#2D5016`
   - Harvest amber: `#D4A574`
   - Earth tones throughout
3. **See theme in action:**
   - Navigate to any component
   - Notice consistent green accents

---

### Step 4: Provide Feedback

#### **What to Look For**

- **Brand Consistency:** Does it match our agricultural identity?
- **User Experience:** Is navigation intuitive?
- **Visual Appeal:** Does it look professional?
- **Functionality:** Do features work as expected?
- **Content:** Are labels and copy clear?

#### **How to Provide Feedback**

**Option 1: Email** (best for detailed feedback)

```text
To: dev-team@farmersmarket.com
Subject: Storybook Feedback - Dashboard Review

Hi team,

I reviewed the dashboard components in Storybook. Overall looks great!

Feedback:
1. Dashboard header logo could be 20% larger
2. Sidebar icons are perfect - very clear
3. Agricultural green is spot-on for our brand
4. Consider adding farm statistics to homepage

Questions:
- Can we add a "Recent Orders" widget?
- Is mobile version ready for review?

Thanks!
[Your Name]
```

**Option 2: Slack** (for quick feedback)

Post in `#design-system`:

```text
Reviewed the Button component - looks fantastic!
The agricultural green variant is perfect for our brand.
One suggestion: Add a "Premium" variant for paid features.
```

**Option 3: Meeting** (for strategic discussions)

Schedule a 30-min review session with the team.

---

### Step 5: Approve Designs

#### **Approval Workflow**

1. **Receive notification:** "New feature ready for review"
2. **Review in Storybook:**
   - Test functionality
   - Check branding
   - Verify copy/content
3. **Provide decision:**
   - ✅ **Approve:** Ready to build into production
   - 🔄 **Request changes:** Specific feedback needed
   - 🚫 **Reject:** Major concerns, need redesign

---

### Stakeholder Quick Reference

#### **Key Pages to Review**

| Page                   | What to Check                  |
| ---------------------- | ------------------------------ |
| **Introduction**       | Overview and getting started   |
| **Agricultural Theme** | Brand colors and styling       |
| **Button**             | Primary call-to-action styling |
| **Dashboard**          | Admin interface layout         |
| **Charts**             | Data visualization approach    |
| **Metric Cards**       | Farm monitoring displays       |

#### **Common Questions**

**Q: Can I edit components in Storybook?**
A: No, Storybook is read-only. Request changes via email/Slack.

**Q: How do I see new features?**
A: Check Storybook weekly or subscribe to notifications.

**Q: Can I share Storybook with others?**
A: Yes! Share the URL: <<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>

**Q: How do I know when to approve?**
A: Team will send email/Slack notification with Chromatic link.

---

## 🔗 ADDITIONAL RESOURCES

### Documentation

- **Component Usage Guide:** `STORYBOOK_COMPONENT_USAGE_GUIDE.md`
- **Chromatic Acceptance:** `CHROMATIC_BASELINE_ACCEPTANCE_GUIDE.md`
- **Phase 1.6 Report:** `PHASE_1.6_CHROMATIC_DEPLOYMENT_COMPLETE.md`
- **Agricultural Theme:** See Storybook "Agricultural Theme" page

### Communication Channels

- **Slack:** `#design-system` (general discussion)
- **Slack:** `#design-system-feedback` (bug reports)
- **Slack:** `#chromatic-notifications` (automated updates)
- **Email:** <dev-team@farmersmarket.com>
- **GitHub:** Repository issues with `design-system` label

### Tools & Links

- **Production Storybook:** <<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>
- **Chromatic Dashboard:** <<https://www.chromatic.com/builds?appId=68f10cd1bcfc5fb270e8f48>9>
- **Local Storybook:** `npm run storybook` (developers only)
- **GitHub Repository:** [Your repo URL]

---

## ❓ FAQ

### General Questions

**Q: What is Storybook?**
A: An interactive component library showcasing all UI components with examples.

**Q: What is Chromatic?**
A: A visual testing tool that detects UI changes automatically.

**Q: Do I need to install anything?**
A: No! Just access the URL in your browser.

**Q: Can I use Storybook on mobile?**
A: Yes! Works on all devices, but desktop is recommended for full experience.

---

### Role-Specific Questions
### Designers
**Q: How do I request a new component?**
A: Create a GitHub issue with `component-request` label and mockups.

**Q: Can I test my designs in Storybook?**
A: Yes! Ask a developer to create a story from your mockups.
### Developers
**Q: How do I add a new story?**
A: See [Developer Onboarding](#-developer-onboarding) Step 4.

**Q: How do I run Storybook locally?**
A: `npm run storybook` in the project directory.
### QA
**Q: How do I report visual bugs?**
A: Use the bug report template in [QA Onboarding](#-qa-tester-onboarding) Step 6.

**Q: What browsers should I test?**
A: Chrome, Firefox, Safari, Edge (all latest versions).
### Stakeholders
**Q: How often should I review Storybook?**
A: Weekly or when notified of new features.

**Q: Who do I contact with questions?**
A: Email <dev-team@farmersmarket.com> or post in `#design-system` Slack.

---

## 🎉 You're Ready

You now have everything you need to work with our Farmers Market component library!

### Next Steps by Role

**Designers:** Explore components, provide feedback, review Chromatic changes
**Developers:** Write stories, test locally, deploy to Chromatic
**QA:** Test all states, check accessibility, report bugs
**Stakeholders:** Review features, provide feedback, approve designs

---

**Questions?** Reach out in `#design-system` or email <dev-team@farmersmarket.com>

**Happy Storybooking!** 🌱📚✨

---

**Guide Version:** 1.0.0
**Last Updated:** October 16, 2025
**Author:** Farmers Market Dev Team
