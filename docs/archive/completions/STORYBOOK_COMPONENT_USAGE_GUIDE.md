# 🌱 Farmers Market Component Usage Guide

**Version:** 1.0.0
**Last Updated:** October 16, 2025
**Total Components:** 50+ components across 14 categories
**Storybook:** <<https://68f10cd1bcfc5fb270e8f489-dhablktkwp.chromatic.com>/>

---

## 📚 Table of Contents

1. [Core UI Components](#core-ui-components) (5 categories)
2. [Dashboard Components](#dashboard-components) (3 categories)
3. [Data Visualization](#data-visualization) (4 categories)
4. [Metric Cards](#metric-cards) (4 categories)
5. [Best Practices](#best-practices)
6. [Agricultural Theming](#agricultural-theming)
7. [Accessibility Guidelines](#accessibility-guidelines)

---

## 🎨 CORE UI COMPONENTS

### 1. Button Component

**Location:** `src/components/ui/Button.tsx`
**Stories:** 25+ variants
**Tests:** 38 comprehensive tests

#### **Variants**

```typescript
type ButtonVariant =
  | "default"
  | "secondary"
  | "agricultural"
  | "harvest"
  | "outline"
  | "ghost"
  | "link";
type ButtonSize = "sm" | "md" | "lg" | "xl";
```

#### **Basic Usage**

```tsx
import { Button } from '@/components/ui/Button';

// Default button
<Button>Click Me</Button>

// Agricultural variant (primary green)
<Button variant="agricultural">Plant Crop</Button>

// Harvest variant (warm amber)
<Button variant="harvest">Harvest Now</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

#### **Advanced Features**

```tsx
// With loading state
<Button loading>Processing...</Button>

// With icon (left/right)
<Button iconLeft={<SeedlingIcon />}>Plant</Button>
<Button iconRight={<ArrowRightIcon />}>Next</Button>

// Full width
<Button fullWidth>Submit Order</Button>

// Disabled state
<Button disabled>Out of Stock</Button>

// Icon-only button
<Button iconOnly aria-label="Settings">
  <SettingsIcon />
</Button>
```

#### **Agricultural Theming**

```tsx
// Primary agricultural action (green)
<Button variant="agricultural">Add to Market</Button>

// Harvest/completion action (amber)
<Button variant="harvest">Complete Harvest</Button>

// Secondary farm action
<Button variant="secondary">View Farm Details</Button>
```

#### **When to Use**

- ✅ **Agricultural:** Primary actions (plant, add to cart, checkout)
- ✅ **Harvest:** Completion actions (harvest, fulfill order, mark complete)
- ✅ **Secondary:** Non-primary actions (cancel, go back, view more)
- ✅ **Outline/Ghost:** Tertiary actions (filters, preferences)

#### **Accessibility**

```tsx
// Always provide accessible label for icon-only buttons
<Button iconOnly aria-label="Add to favorites">
  <HeartIcon />
</Button>

// Use loading state with aria-busy
<Button loading aria-busy="true">
  Submitting Order
</Button>

// Minimum touch target: 44x44px (automatically applied)
```

---

### 2. Input Component

**Location:** `src/components/ui/Input.tsx`
**Stories:** 20+ variants
**Tests:** 36 comprehensive tests

#### **Basic Usage**

```tsx
import { Input } from '@/components/ui/Input';

// Simple text input
<Input
  label="Farm Name"
  placeholder="Enter your farm name"
/>

// With helper text
<Input
  label="Email"
  helperText="We'll never share your email"
  type="email"
/>

// With error state
<Input
  label="Crop Quantity"
  error="Must be a positive number"
  value={quantity}
  onChange={handleChange}
/>
```

#### **Input Types**

```tsx
// Text input
<Input type="text" label="Product Name" />

// Number input
<Input type="number" label="Quantity" min={1} max={1000} />

// Email input with validation
<Input type="email" label="Email" required />

// Password input
<Input type="password" label="Password" />

// Date input for planting dates
<Input type="date" label="Planting Date" />

// Textarea for descriptions
<Input
  as="textarea"
  label="Farm Description"
  rows={4}
/>
```

#### **Icons & Visual Enhancements**

```tsx
// Icon on left
<Input
  label="Search Products"
  leftIcon={<SearchIcon />}
  placeholder="Search organic vegetables..."
/>

// Icon on right
<Input
  label="Farm Location"
  rightIcon={<LocationIcon />}
/>

// Clearable input
<Input
  label="Filter by Name"
  value={searchTerm}
  onClear={() => setSearchTerm('')}
  clearable
/>
```

#### **Validation States**

```tsx
// Success state
<Input
  label="Username"
  success="Available!"
  value={username}
/>

// Warning state
<Input
  label="Crop Count"
  warning="High inventory levels"
  value={count}
/>

// Error state
<Input
  label="Price"
  error="Must be greater than $0"
  value={price}
/>
```

#### **Agricultural Patterns**

```tsx
// Crop quantity with unit
<Input
  label="Harvest Weight"
  type="number"
  rightIcon={<span className="text-sm">lbs</span>}
  min={0}
  step={0.1}
/>

// Price input with currency
<Input
  label="Price per Unit"
  type="number"
  leftIcon={<span className="text-sm">$</span>}
  min={0}
  step={0.01}
/>

// Farm acreage
<Input
  label="Farm Size"
  type="number"
  rightIcon={<span className="text-sm">acres</span>}
  placeholder="0.0"
/>
```

#### **Form Integration**

```tsx
// With React Hook Form
import { useForm } from "react-hook-form";

const {
  register,
  formState: { errors },
} = useForm();

<Input
  label="Farm Name"
  {...register("farmName", { required: "Farm name is required" })}
  error={errors.farmName?.message}
/>;
```

---

### 3. Card Component

**Location:** `src/components/ui/Card.tsx`
**Stories:** 30+ variants
**Tests:** 42 comprehensive tests

#### **Variants**

```typescript
type CardVariant =
  | "default"
  | "elevated"
  | "agricultural"
  | "dashboard"
  | "crop";
```

#### **Basic Usage**

```tsx
import { Card } from '@/components/ui/Card';

// Default card
<Card>
  <Card.Header title="Farm Details" />
  <Card.Content>
    <p>Your farm information goes here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Update</Button>
  </Card.Footer>
</Card>

// Elevated card (shadow)
<Card variant="elevated">
  <Card.Content>
    Premium content with elevated styling
  </Card.Content>
</Card>
```

#### **Agricultural Variant**

```tsx
// Green-themed agricultural card
<Card variant="agricultural">
  <Card.Header title="Organic Vegetables" icon={<LeafIcon />} />
  <Card.Content>
    <p>Fresh from our local farms</p>
  </Card.Content>
</Card>
```

#### **Dashboard Variant**

```tsx
// Clean dashboard card with metrics
<Card variant="dashboard">
  <Card.Header title="Today's Sales" />
  <Card.Content>
    <div className="text-4xl font-bold">$2,450</div>
    <div className="text-sm text-muted">+15% from yesterday</div>
  </Card.Content>
</Card>
```

#### **Crop Card Variant**

```tsx
// Specialized for crop displays
<Card variant="crop">
  <Card.Image src="/images/tomatoes.jpg" alt="Organic Tomatoes" />
  <Card.Header title="Heirloom Tomatoes" />
  <Card.Content>
    <div className="flex justify-between">
      <span>$4.99/lb</span>
      <span className="text-green-600">In Stock</span>
    </div>
  </Card.Content>
  <Card.Footer>
    <Button variant="agricultural" fullWidth>
      Add to Cart
    </Button>
  </Card.Footer>
</Card>
```

#### **Interactive Cards**

```tsx
// Clickable card
<Card
  interactive
  onClick={() => navigate('/farm/123')}
  className="cursor-pointer hover:shadow-lg"
>
  <Card.Content>
    Click to view farm details
  </Card.Content>
</Card>

// Selectable card (checkbox)
<Card
  selectable
  selected={isSelected}
  onSelect={() => toggleSelection()}
>
  <Card.Content>
    Select this farm
  </Card.Content>
</Card>
```

#### **Card with Image**

```tsx
// Product card with image
<Card variant="crop">
  <Card.Image
    src="/products/carrots.jpg"
    alt="Organic Carrots"
    aspectRatio="4:3"
  />
  <Card.Header title="Organic Carrots" subtitle="Sunny Acres Farm" />
  <Card.Content>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-2xl font-bold">$3.49</span>
        <span className="text-sm text-muted">per bunch</span>
      </div>
      <div className="text-sm text-green-600">✓ Certified Organic</div>
    </div>
  </Card.Content>
  <Card.Footer>
    <Button variant="agricultural" fullWidth>
      Add to Cart
    </Button>
  </Card.Footer>
</Card>
```

#### **Loading State**

```tsx
// Skeleton loading
<Card loading>
  <Card.Header title="Loading..." />
  <Card.Content>
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </Card.Content>
</Card>
```

---

### 4. Modal Component

**Location:** `src/components/ui/Modal.tsx`
**Stories:** 20+ variants
**Tests:** 37 comprehensive tests

#### **Basic Usage**

```tsx
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

  <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Farm Details">
    <Modal.Content>
      <p>Modal content goes here</p>
    </Modal.Content>
    <Modal.Footer>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </Modal.Footer>
  </Modal>
</>;
```

#### **Modal Sizes**

```tsx
// Small modal (400px)
<Modal size="sm" open={isOpen} onClose={onClose}>
  {/* Compact content */}
</Modal>

// Medium modal (600px - default)
<Modal size="md" open={isOpen} onClose={onClose}>
  {/* Standard content */}
</Modal>

// Large modal (800px)
<Modal size="lg" open={isOpen} onClose={onClose}>
  {/* Detailed forms */}
</Modal>

// Extra large modal (1000px)
<Modal size="xl" open={isOpen} onClose={onClose}>
  {/* Complex interfaces */}
</Modal>

// Full screen modal
<Modal fullScreen open={isOpen} onClose={onClose}>
  {/* Maximum space */}
</Modal>
```

#### **Alert Modals**

```tsx
// Success alert
<Modal
  variant="alert-success"
  open={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Order Placed!"
  icon={<CheckCircleIcon />}
>
  <Modal.Content>
    Your order has been successfully placed.
  </Modal.Content>
  <Modal.Footer>
    <Button variant="agricultural">View Order</Button>
  </Modal.Footer>
</Modal>

// Error alert
<Modal
  variant="alert-error"
  open={showError}
  onClose={() => setShowError(false)}
  title="Payment Failed"
  icon={<AlertCircleIcon />}
>
  <Modal.Content>
    We couldn't process your payment. Please try again.
  </Modal.Content>
  <Modal.Footer>
    <Button>Retry Payment</Button>
  </Modal.Footer>
</Modal>
```

#### **Confirmation Modals**

```tsx
// Delete confirmation
<Modal
  variant="agricultural"
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete Crop?"
>
  <Modal.Content>
    Are you sure you want to delete this crop? This action cannot be undone.
  </Modal.Content>
  <Modal.Footer>
    <Button variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button variant="harvest" onClick={onConfirm}>
      Delete Crop
    </Button>
  </Modal.Footer>
</Modal>
```

#### **Form Modals**

```tsx
// Add product modal
<Modal
  open={showAddProduct}
  onClose={onClose}
  title="Add New Product"
  size="lg"
>
  <Modal.Content>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Product Name" required />
      <Input label="Price" type="number" required />
      <Input as="textarea" label="Description" rows={4} />
    </form>
  </Modal.Content>
  <Modal.Footer>
    <Button variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="agricultural" type="submit">
      Add Product
    </Button>
  </Modal.Footer>
</Modal>
```

---

### 5. Toast Component

**Location:** `src/components/ui/Toast.tsx`
**Stories:** 15+ variants
**Tests:** 30 comprehensive tests

#### **Basic Usage**

```tsx
import { toast } from "@/components/ui/Toast";

// Success toast
toast.success("Crop added successfully!");

// Error toast
toast.error("Failed to place order");

// Warning toast
toast.warning("Low inventory levels detected");

// Info toast
toast.info("New products available");
```

#### **Advanced Options**

```tsx
// Custom duration (ms)
toast.success("Order placed!", { duration: 5000 });

// Custom position
toast.info("Welcome back!", { position: "top-center" });

// With action button
toast.success("Product added to cart", {
  action: {
    label: "View Cart",
    onClick: () => navigate("/cart"),
  },
});

// Persistent (manual dismiss)
toast.error("Critical error occurred", {
  duration: Infinity,
});
```

#### **Agricultural Patterns**

```tsx
// Harvest completion
toast.success("🌾 Harvest completed!", {
  icon: <CheckCircleIcon className="text-harvest" />,
});

// Planting notification
toast.info("🌱 Planting season begins next week", {
  duration: 10000,
  action: {
    label: "Plan Crops",
    onClick: () => navigate("/plan"),
  },
});

// Weather alert
toast.warning("⚠️ Heavy rain expected tomorrow", {
  icon: <CloudRainIcon />,
});
```

#### **Toast Positions**

```tsx
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// Examples
toast.success("Top left", { position: "top-left" });
toast.info("Bottom center", { position: "bottom-center" });
```

---

## 📊 DASHBOARD COMPONENTS

### 6. Dashboard Shell

**Location:** `src/components/dashboard/DashboardShell.tsx`
**Stories:** 20+ layouts
**Components:** 6 layout components

#### **Basic Usage**

```tsx
import {
  DashboardLayout,
  DashboardHeader,
  DashboardSidebar,
  DashboardMain,
  DashboardMetrics,
  DashboardAlerts,
} from "@/components/dashboard";

<DashboardLayout>
  <DashboardHeader />
  <div className="flex">
    <DashboardSidebar />
    <main className="flex-1">
      <DashboardMetrics />
      <DashboardAlerts />
      <DashboardMain>{/* Your dashboard content */}</DashboardMain>
    </main>
  </div>
</DashboardLayout>;
```

#### **Responsive Layout**

```tsx
// Collapsible sidebar on mobile
<DashboardSidebar
  collapsible
  defaultCollapsed={isMobile}
/>

// Mobile-friendly metrics
<DashboardMetrics
  columns={3}  // Desktop
  mobileColumns={1}  // Mobile
/>
```

---

### 7. Dashboard Header

**Location:** `src/components/dashboard/DashboardHeader.tsx`
**Stories:** 15+ variants
**Components:** 6 header components

#### **Components Included**

- `DashboardHeaderContainer` - Main header wrapper
- `DashboardHeaderLogo` - Logo and branding
- `DashboardHeaderSearch` - Global search
- `DashboardHeaderActions` - Action buttons
- `DashboardHeaderUser` - User profile dropdown
- `DashboardHeaderNotifications` - Notification bell

#### **Full Header Example**

```tsx
<DashboardHeaderContainer>
  <DashboardHeaderLogo src="/logo.svg" farmName="Sunny Acres Farm" />

  <DashboardHeaderSearch
    placeholder="Search products, orders, farmers..."
    onSearch={handleSearch}
  />

  <DashboardHeaderActions>
    <Button variant="agricultural">Add Product</Button>
  </DashboardHeaderActions>

  <DashboardHeaderNotifications count={5} notifications={notificationList} />

  <DashboardHeaderUser
    name="John Farmer"
    email="john@sunnyacres.com"
    avatar="/avatars/john.jpg"
    role="Vendor"
  />
</DashboardHeaderContainer>
```

---

### 8. Dashboard Sidebar

**Location:** `src/components/dashboard/DashboardSidebar.tsx`
**Stories:** 20+ navigation patterns
**Components:** 9 sidebar components

#### **Navigation Structure**

```tsx
import {
  SidebarContainer,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavItem,
  SidebarNavLink,
  SidebarCollapse,
} from "@/components/dashboard/sidebar";

<SidebarContainer>
  <SidebarNav>
    {/* Main navigation */}
    <SidebarNavGroup title="Main">
      <SidebarNavItem
        icon={<DashboardIcon />}
        label="Dashboard"
        href="/dashboard"
        active
      />
      <SidebarNavItem
        icon={<PackageIcon />}
        label="Products"
        href="/products"
        badge={12}
      />
    </SidebarNavGroup>

    {/* Agricultural section */}
    <SidebarNavGroup title="Farm Management">
      <SidebarNavItem icon={<SeedlingIcon />} label="Crops" href="/crops" />
      <SidebarNavItem
        icon={<TractorIcon />}
        label="Equipment"
        href="/equipment"
      />
    </SidebarNavGroup>

    {/* Collapsible section */}
    <SidebarCollapse title="Reports" icon={<ChartIcon />}>
      <SidebarNavLink href="/reports/sales">Sales</SidebarNavLink>
      <SidebarNavLink href="/reports/inventory">Inventory</SidebarNavLink>
    </SidebarCollapse>
  </SidebarNav>
</SidebarContainer>;
```

---

## 📈 DATA VISUALIZATION

### 9. GrowthTimeline Chart

**Location:** `src/components/charts/GrowthTimeline.tsx`
**Type:** Line chart with trend predictions
**Stories:** 10+ data scenarios

#### **Basic Usage**

```tsx
import { GrowthTimeline } from "@/components/charts";

const growthData = [
  { date: "2025-01-01", growth: 0 },
  { date: "2025-01-15", growth: 15 },
  { date: "2025-02-01", growth: 35 },
  { date: "2025-02-15", growth: 60 },
  // ... more data
];

<GrowthTimeline
  data={growthData}
  title="Tomato Growth Progress"
  xAxisKey="date"
  yAxisKey="growth"
  unit="%"
/>;
```

#### **Advanced Features**

```tsx
<GrowthTimeline
  data={growthData}
  title="Crop Growth Timeline"
  showPrediction // Show future trend line
  predictionData={predictedGrowth}
  targetLine={100} // Target growth percentage
  showGrid
  showLegend
  responsive
  colors={{
    actual: "#2D5016", // Agricultural green
    prediction: "#D4A574", // Harvest amber
  }}
/>
```

---

### 10. YieldComparison Chart

**Location:** `src/components/charts/YieldComparison.tsx`
**Type:** Bar chart for comparing yields
**Stories:** 10+ comparison scenarios

#### **Basic Usage**

```tsx
import { YieldComparison } from "@/components/charts";

const yieldData = [
  { crop: "Tomatoes", current: 450, previous: 380, target: 500 },
  { crop: "Lettuce", current: 320, previous: 300, target: 350 },
  { crop: "Carrots", current: 280, previous: 250, target: 300 },
];

<YieldComparison
  data={yieldData}
  title="Yield Comparison - Current vs Previous Season"
/>;
```

#### **Advanced Features**

```tsx
<YieldComparison
  data={yieldData}
  title="Annual Yield Analysis"
  showTarget // Show target bars
  showPercentageChange // Show +/-% labels
  grouping="stacked" // or "grouped"
  colors={{
    current: "#2D5016",
    previous: "#7BA05B",
    target: "#D4A574",
  }}
  unit="lbs"
/>
```

---

### 11. WeatherImpact Chart

**Location:** `src/components/charts/WeatherImpact.tsx`
**Type:** Scatter plot showing weather effects
**Stories:** 10+ weather patterns

#### **Basic Usage**

```tsx
import { WeatherImpact } from "@/components/charts";

const weatherData = [
  { temperature: 72, rainfall: 1.2, yield: 450 },
  { temperature: 68, rainfall: 2.1, yield: 480 },
  // ... more data
];

<WeatherImpact
  data={weatherData}
  title="Weather Impact on Yield"
  xAxisKey="temperature"
  yAxisKey="rainfall"
  sizeKey="yield"
/>;
```

---

### 12. SeasonalRadar Chart

**Location:** `src/components/charts/SeasonalRadar.tsx`
**Type:** Radar/spider chart for seasonal metrics
**Stories:** 10+ seasonal patterns

#### **Basic Usage**

```tsx
import { SeasonalRadar } from "@/components/charts";

const seasonalData = [
  { metric: "Growth", spring: 95, summer: 100, fall: 60, winter: 20 },
  { metric: "Harvest", spring: 40, summer: 85, fall: 100, winter: 10 },
  // ... more metrics
];

<SeasonalRadar data={seasonalData} title="Seasonal Performance Metrics" />;
```

---

## 🌾 METRIC CARDS

### 13. CropHealthCard

**Location:** `src/components/metrics/CropHealthCard.tsx`
**Stories:** 5+ health scenarios

```tsx
import { CropHealthCard } from "@/components/metrics";

<CropHealthCard
  cropName="Organic Tomatoes"
  healthScore={92}
  status="healthy" // healthy | warning | critical
  growthStage="Flowering"
  daysToHarvest={21}
  image="/crops/tomatoes.jpg"
/>;
```

---

### 14. WeatherCard

**Location:** `src/components/metrics/WeatherCard.tsx`
**Stories:** 5+ weather conditions

```tsx
import { WeatherCard } from "@/components/metrics";

<WeatherCard
  temperature={72}
  condition="Partly Cloudy"
  humidity={65}
  windSpeed={8}
  forecast={next7Days}
  alerts={weatherAlerts}
/>;
```

---

### 15. SoilMoistureCard

**Location:** `src/components/metrics/SoilMoistureCard.tsx`
**Stories:** 5+ moisture levels

```tsx
import { SoilMoistureCard } from "@/components/metrics";

<SoilMoistureCard
  moistureLevel={68}
  status="optimal" // dry | optimal | wet
  lastWatered="2 hours ago"
  nextWatering="Tomorrow at 6:00 AM"
  fieldZones={[
    { zone: "A", moisture: 72 },
    { zone: "B", moisture: 65 },
  ]}
/>;
```

---

### 16. HarvestForecastCard

**Location:** `src/components/metrics/HarvestForecastCard.tsx`
**Stories:** 5+ forecast scenarios

```tsx
import { HarvestForecastCard } from "@/components/metrics";

<HarvestForecastCard
  estimatedYield={450}
  unit="lbs"
  harvestDate="2025-03-15"
  confidence={87}
  conditions="favorable"
  recommendations={[
    "Continue current watering schedule",
    "Monitor for pests in next 7 days",
  ]}
/>;
```

---

## ✨ BEST PRACTICES

### Component Selection Guide

| Use Case         | Recommended Component                    |
| ---------------- | ---------------------------------------- |
| Primary CTA      | Button (agricultural variant)            |
| Form input       | Input with proper label & error handling |
| Product display  | Card (crop variant)                      |
| Dashboard metric | Card (dashboard variant)                 |
| User feedback    | Toast notifications                      |
| Confirmations    | Modal (alert variant)                    |
| Data trends      | GrowthTimeline Chart                     |
| Comparisons      | YieldComparison Chart                    |
| Farm status      | Metric Cards                             |

### Agricultural Color Usage

```tsx
// Primary actions (planting, adding, creating)
className = "bg-agricultural text-white";

// Completion actions (harvesting, fulfilling)
className = "bg-harvest text-agricultural-dark";

// Success states
className = "text-green-600";

// Warning states
className = "text-amber-600";

// Error states
className = "text-red-600";
```

### Responsive Design Patterns

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => (
    <Card key={product.id} variant="crop">
      {/* Product content */}
    </Card>
  ))}
</div>

// Collapsible sidebar
<DashboardSidebar
  collapsible
  defaultCollapsed={useMediaQuery('(max-width: 768px)')}
/>
```

---

## ♿ ACCESSIBILITY GUIDELINES

### Keyboard Navigation

- All interactive elements focusable
- Logical tab order
- Escape key closes modals
- Arrow keys navigate lists

### Screen Readers

```tsx
// Descriptive labels
<Button aria-label="Add organic tomatoes to cart">
  Add to Cart
</Button>

// Status announcements
<div role="status" aria-live="polite">
  {successMessage}
</div>

// Loading states
<Button loading aria-busy="true">
  Processing Order
</Button>
```

### Color Contrast

- Text: 4.5:1 minimum (WCAG AA)
- UI elements: 3:1 minimum
- Large text: 3:1 minimum

### Touch Targets

- Minimum: 44x44px (automatically applied)
- Recommended: 48x48px for primary actions

---

## 📚 Additional Resources

- **Design Tokens:** See `DesignTokens.mdx` in Storybook
- **Agricultural Theme:** See `AgriculturalTheme.mdx`
- **Accessibility:** See `Accessibility.mdx`
- **Usage Patterns:** See `UsagePatterns.mdx`

---

**Questions?** Check our Storybook documentation or reach out to the design system team! 🌱

**Version:** 1.0.0
**Last Updated:** October 16, 2025
