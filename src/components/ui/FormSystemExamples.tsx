/**
 * 🌟 Form System Examples - Divine Form Demonstrations
 * Comprehensive examples showcasing all form components and patterns
 * Following: 08_UX_DESIGN_CONSCIOUSNESS, 12_ERROR_HANDLING_VALIDATION
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Package, Store, Upload, User } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import {
  AgriculturalCheckboxCard,
  CardRadioGroup,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
} from "./checkbox";
import {
  AgriculturalFileUpload,
  type UploadedFile
} from "./file-upload";
import {
  Form,
  FormActions,
  FormControl,
  FormDescription,
  FormField,
  FormGrid,
  FormItem,
  FormLabel,
  FormMessage,
  FormSection,
  FormSuccess,
} from "./form";
import { Input } from "./input";
import {
  AgriculturalMultiStepForm,
  FormStep,
  useMultiStepForm
} from "./multi-step-form";
import { AgriculturalSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// EXAMPLE 1: BASIC FORM WITH VALIDATION
// ============================================================================

const basicFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type BasicFormData = z.infer<typeof basicFormSchema>;

export function BasicFormExample() {
  const form = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
  });

  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const onSubmit = async (data: BasicFormData) => {
    logger.info("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitSuccess(true);
    form.reset();
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: Basic Contact Form</CardTitle>
        <CardDescription>
          Simple form with text inputs and validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your full name as it appears on your ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you're thinking..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitSuccess && (
              <FormSuccess>
                Your message has been sent successfully! ✨
              </FormSuccess>
            )}

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </FormActions>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 2: FORM WITH SELECTS AND CHECKBOXES
// ============================================================================

const userPreferencesSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  notifications: z.boolean(),
  newsletter: z.boolean(),
});

type UserPreferencesData = z.infer<typeof userPreferencesSchema>;

export function SelectCheckboxFormExample() {
  const form = useForm<UserPreferencesData>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      role: "",
      interests: [],
      notifications: false,
      newsletter: false,
    },
  });

  const onSubmit = (data: UserPreferencesData) => {
    logger.info("Preferences:", data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: Selects & Checkboxes</CardTitle>
        <CardDescription>
          Form with dropdown selects and checkbox groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Your Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Your Interests</FormLabel>
                  <CheckboxGroup
                    options={[
                      {
                        value: "organic",
                        label: "Organic Produce",
                        description: "Certified organic fruits and vegetables",
                      },
                      {
                        value: "dairy",
                        label: "Dairy Products",
                        description: "Fresh milk, cheese, and yogurt",
                      },
                      {
                        value: "meat",
                        label: "Local Meat",
                        description: "Grass-fed and free-range options",
                      },
                      {
                        value: "baked",
                        label: "Baked Goods",
                        description: "Fresh bread and pastries",
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    variant="agricultural"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSection title="Communication Preferences">
              <FormField
                control={form.control}
                name="notifications"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Push Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications about new products and deals
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        variant="agricultural"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Newsletter</FormLabel>
                      <FormDescription>
                        Get weekly updates about seasonal produce
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormActions>
              <Button type="submit">Save Preferences</Button>
            </FormActions>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 3: RADIO GROUPS (STANDARD & CARD VARIANTS)
// ============================================================================

const paymentMethodSchema = z.object({
  method: z.string().min(1, "Please select a payment method"),
  deliverySpeed: z.string().min(1, "Please select delivery speed"),
});

type PaymentMethodData = z.infer<typeof paymentMethodSchema>;

export function RadioGroupFormExample() {
  const form = useForm<PaymentMethodData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      method: "",
      deliverySpeed: "",
    },
  });

  const onSubmit = (data: PaymentMethodData) => {
    logger.info("Payment selection:", data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Radio Group Variants</CardTitle>
        <CardDescription>
          Standard and card-style radio button groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Payment Method</FormLabel>
                  <CardRadioGroup
                    options={[
                      {
                        value: "credit_card",
                        label: "Credit Card",
                        description: "Pay securely with your credit card",
                        icon: "💳",
                      },
                      {
                        value: "cash",
                        label: "Cash on Delivery",
                        description: "Pay when you receive your order",
                        icon: "💵",
                      },
                      {
                        value: "bank",
                        label: "Bank Transfer",
                        description: "Direct transfer to our account",
                        icon: "🏦",
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    name="paymentMethod"
                    variant="agricultural"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliverySpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Delivery Speed</FormLabel>
                  <RadioGroup
                    options={[
                      {
                        value: "standard",
                        label: "Standard Delivery (3-5 days)",
                        description: "Free shipping",
                      },
                      {
                        value: "express",
                        label: "Express Delivery (1-2 days)",
                        description: "$9.99 shipping fee",
                      },
                      {
                        value: "same_day",
                        label: "Same Day Delivery",
                        description: "$19.99 shipping fee",
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    name="deliverySpeed"
                    variant="agricultural"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormActions>
              <Button type="submit">Continue to Checkout</Button>
            </FormActions>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 4: FILE UPLOAD FORM
// ============================================================================

const productImageSchema = z.object({
  productName: z.string().min(3, "Product name is required"),
  images: z.array(z.any()).min(1, "At least one image is required"),
});

type ProductImageData = z.infer<typeof productImageSchema>;

export function FileUploadFormExample() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  const form = useForm<ProductImageData>({
    resolver: zodResolver(productImageSchema),
    defaultValues: {
      productName: "",
      images: [],
    },
  });

  const onSubmit = async (data: ProductImageData) => {
    logger.info("Product submission:", data);
    logger.info("Files:", files);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: File Upload</CardTitle>
        <CardDescription>
          Form with drag-and-drop file upload and preview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Organic Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Product Images</FormLabel>
                  <AgriculturalFileUpload
                    value={files}
                    onChange={(newFiles) => {
                      setFiles(newFiles);
                      field.onChange(newFiles);
                    }}
                    maxFiles={5}
                    category="product"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormActions>
              <Button type="submit" disabled={files.length === 0}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Product
              </Button>
            </FormActions>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 5: FORM GRID LAYOUT
// ============================================================================

const farmProfileSchema = z.object({
  farmName: z.string().min(3, "Farm name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
});

type FarmProfileData = z.infer<typeof farmProfileSchema>;

export function FormGridExample() {
  const form = useForm<FarmProfileData>({
    resolver: zodResolver(farmProfileSchema),
    defaultValues: {
      farmName: "",
      ownerName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const onSubmit = (data: FarmProfileData) => {
    logger.info("Farm profile:", data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 5: Form Grid Layout</CardTitle>
        <CardDescription>
          Multi-column responsive form layout with sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection
              title="Farm Information"
              description="Basic details about your farm"
              consciousness="AGRICULTURAL"
            >
              <FormGrid columns={2}>
                <FormField
                  control={form.control}
                  name="farmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Farm Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Green Valley Farm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Owner Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="farm@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection
              title="Farm Location"
              description="Where your farm is located"
              consciousness="AGRICULTURAL"
            >
              <FormGrid columns={1}>
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Farm Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>

              <FormGrid columns={3}>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Springfield" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>State</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormActions justify="between">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                <Store className="h-4 w-4 mr-2" />
                Save Farm Profile
              </Button>
            </FormActions>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 6: MULTI-STEP FORM
// ============================================================================

const step1Schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
});

const step2Schema = z.object({
  farmName: z.string().min(3, "Farm name is required"),
  farmType: z.string().min(1, "Select farm type"),
});

const step3Schema = z.object({
  products: z.array(z.string()).min(1, "Select at least one product type"),
  organic: z.boolean(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

function Step1Form() {
  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { fullName: "", email: "" },
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Email Address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="john@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step2Form() {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { farmName: "", farmType: "" },
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="farmName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Farm Name</FormLabel>
            <FormControl>
              <Input placeholder="Green Valley Farm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="farmType"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Farm Type</FormLabel>
            <AgriculturalSelect
              value={field.value}
              onValueChange={field.onChange}
              options={[
                { value: "vegetable", label: "Vegetable Farm", icon: "🥬" },
                { value: "fruit", label: "Fruit Farm", icon: "🍎" },
                { value: "dairy", label: "Dairy Farm", icon: "🥛" },
                { value: "mixed", label: "Mixed Farm", icon: "🌾" },
              ]}
              placeholder="Select farm type"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step3Form() {
  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { products: [], organic: false },
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="products"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Product Types</FormLabel>
            <CheckboxGroup
              options={[
                { value: "vegetables", label: "Vegetables" },
                { value: "fruits", label: "Fruits" },
                { value: "dairy", label: "Dairy" },
                { value: "meat", label: "Meat" },
              ]}
              value={field.value}
              onChange={field.onChange}
              variant="agricultural"
              orientation="horizontal"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="organic"
        render={({ field }) => (
          <FormItem>
            <AgriculturalCheckboxCard
              checked={field.value}
              onCheckedChange={field.onChange}
              title="Certified Organic"
              description="My farm is certified organic"
              icon="🌿"
              badge="Recommended"
            />
          </FormItem>
        )}
      />
    </div>
  );
}

export function MultiStepFormExample() {
  const steps: FormStep[] = [
    {
      id: "personal",
      title: "Personal Info",
      description: "Tell us about yourself",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "farm",
      title: "Farm Details",
      description: "Information about your farm",
      icon: <Leaf className="h-5 w-5" />,
    },
    {
      id: "products",
      title: "Products",
      description: "What you produce",
      icon: <Package className="h-5 w-5" />,
    },
  ];

  const handleComplete = () => {
    logger.info("Multi-step form completed!");
    alert("Farm registration completed! 🎉");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 6: Multi-Step Form</CardTitle>
        <CardDescription>
          Progressive form with step indicator and navigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AgriculturalMultiStepForm
          steps={steps}
          onComplete={handleComplete}
        >
          <MultiStepFormContent />
        </AgriculturalMultiStepForm>
      </CardContent>
    </Card>
  );
}

function MultiStepFormContent() {
  const { currentStep } = useMultiStepForm();

  return (
    <div>
      {currentStep === 0 && <Step1Form />}
      {currentStep === 1 && <Step2Form />}
      {currentStep === 2 && <Step3Form />}
    </div>
  );
}

// ============================================================================
// MAIN EXAMPLES CONTAINER
// ============================================================================

export function FormSystemExamples() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">🌟 Form System Examples</h1>
        <p className="text-muted-foreground">
          Comprehensive showcase of all form components and patterns
        </p>
      </div>

      <div className="grid gap-8">
        <BasicFormExample />
        <SelectCheckboxFormExample />
        <RadioGroupFormExample />
        <FileUploadFormExample />
        <FormGridExample />
        <MultiStepFormExample />
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormSystemExamples;
