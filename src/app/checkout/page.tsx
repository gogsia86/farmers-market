"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 💳 CHECKOUT PAGE - Fall Harvest Theme
 * Complete checkout flow with customer info, pickup scheduling, and payment
 */

interface CheckoutFormData {
  // Customer Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Payment Info
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;

  // Pickup Details per farm
  pickupDates: Record<string, string>;
  pickupTimes: Record<string, string>;
  specialInstructions: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  farm: string;
  unit: string;
}

// Mock cart data - should come from cart context
const MOCK_CART: CartItem[] = [
  {
    id: "1",
    name: "Organic Pumpkins",
    price: 8.99,
    quantity: 2,
    farm: "Harvest Moon Farm",
    unit: "each",
  },
  {
    id: "2",
    name: "Honeycrisp Apples",
    price: 4.99,
    quantity: 3,
    farm: "Autumn Ridge Orchard",
    unit: "lb",
  },
  {
    id: "3",
    name: "Artisan Cheddar Cheese",
    price: 12.99,
    quantity: 1,
    farm: "Maple Leaf Dairy",
    unit: "8oz",
  },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    pickupDates: {},
    pickupTimes: {},
    specialInstructions: "",
  });

  const cartItems = MOCK_CART;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Group items by farm
  const itemsByFarm = cartItems.reduce<Record<string, CartItem[]>>(
    (acc, item) => {
      acc[item.farm] ??= [];
      acc[item.farm]!.push(item);
      return acc;
    },
    {},
  );
  const farms = Object.keys(itemsByFarm);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickupDateChange = (farm: string, date: string) => {
    setFormData((prev) => ({
      ...prev,
      pickupDates: { ...prev.pickupDates, [farm]: date },
    }));
  };

  const handlePickupTimeChange = (farm: string, time: string) => {
    setFormData((prev) => ({
      ...prev,
      pickupTimes: { ...prev.pickupTimes, [farm]: time },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - place order
      // Note: Stripe integration in progress - using mock for now
      alert("Order placed successfully!");
      globalThis.location.href = "/orders";
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.phone
      );
    }
    if (currentStep === 2) {
      return farms.every(
        (farm) => formData.pickupDates[farm] && formData.pickupTimes[farm],
      );
    }
    if (currentStep === 3) {
      return (
        formData.cardNumber &&
        formData.cardExpiry &&
        formData.cardCvc &&
        formData.cardName
      );
    }
    return false;
  };

  const STEPS = [
    { number: 1, title: "Contact Info", icon: User },
    { number: 2, title: "Pickup Schedule", icon: Calendar },
    { number: 3, title: "Payment", icon: CreditCard },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back to Cart */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Checkout
              </h1>
              <p className="text-muted-foreground">
                Complete your order and schedule pickup times
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                {/* Progress Steps */}
                <div className="glass-card rounded-2xl p-6 mb-6">
                  <div className="flex justify-between">
                    {STEPS.map((step) => {
                      const Icon = step.icon;
                      const isActive = currentStep === step.number;
                      const isCompleted = currentStep > step.number;

                      const getStepClassName = () => {
                        if (isCompleted) return "bg-accent-600 text-white";
                        if (isActive)
                          return "bg-primary-600 text-white shadow-glow";
                        return "bg-gray-200 dark:bg-gray-700 text-gray-500";
                      };

                      return (
                        <div key={step.number} className="flex-1 relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${getStepClassName()}`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <Icon className="h-6 w-6" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                          {step.number < STEPS.length && (
                            <div
                              className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${
                                isCompleted
                                  ? "bg-accent-600"
                                  : "bg-gray-300 dark:bg-gray-700"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Contact Information */}
                  {currentStep === 1 && (
                    <div className="glass-card rounded-2xl p-6 mb-6">
                      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary-600" />
                        Contact Information
                      </h2>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            First Name *
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Last Name *
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                            placeholder="(503) 555-0123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Pickup Scheduling */}
                  {currentStep === 2 && (
                    <div className="space-y-6 mb-6">
                      {farms.map((farm) => {
                        const farmItems = itemsByFarm[farm] || [];
                        const farmTotal = farmItems.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        );

                        return (
                          <div
                            key={farm}
                            className="glass-card rounded-2xl p-6"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                <Leaf className="h-5 w-5 text-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground">
                                  {farm}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {farmItems.length} items • $
                                  {farmTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  htmlFor={`pickup-date-${farm}`}
                                  className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"
                                >
                                  <Calendar className="h-4 w-4" />
                                  Pickup Date *
                                </label>
                                <input
                                  id={`pickup-date-${farm}`}
                                  type="date"
                                  required
                                  value={formData.pickupDates[farm] || ""}
                                  onChange={(e) =>
                                    handlePickupDateChange(farm, e.target.value)
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`pickup-time-${farm}`}
                                  className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"
                                >
                                  <Clock className="h-4 w-4" />
                                  Pickup Time *
                                </label>
                                <select
                                  id={`pickup-time-${farm}`}
                                  required
                                  value={formData.pickupTimes[farm] || ""}
                                  onChange={(e) =>
                                    handlePickupTimeChange(farm, e.target.value)
                                  }
                                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                                  aria-label={`Pickup time for ${farm}`}
                                >
                                  <option value="">Select time</option>
                                  <option value="9:00 AM">9:00 AM</option>
                                  <option value="10:00 AM">10:00 AM</option>
                                  <option value="11:00 AM">11:00 AM</option>
                                  <option value="12:00 PM">12:00 PM</option>
                                  <option value="1:00 PM">1:00 PM</option>
                                  <option value="2:00 PM">2:00 PM</option>
                                  <option value="3:00 PM">3:00 PM</option>
                                  <option value="4:00 PM">4:00 PM</option>
                                  <option value="5:00 PM">5:00 PM</option>
                                </select>
                              </div>
                            </div>

                            <div className="mt-4 p-4 bg-accent-900/10 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-accent-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                  <p className="font-medium text-foreground mb-1">
                                    Pickup Location
                                  </p>
                                  <p className="text-muted-foreground">
                                    123 Farm Road, Portland, OR 97201
                                    <br />
                                    Look for the red barn on the left
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="glass-card rounded-2xl p-6">
                        <label
                          htmlFor="specialInstructions"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          id="specialInstructions"
                          value={formData.specialInstructions}
                          onChange={(e) =>
                            handleInputChange(
                              "specialInstructions",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all resize-none"
                          placeholder="Any special requests or dietary restrictions..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment */}
                  {currentStep === 3 && (
                    <div className="glass-card rounded-2xl p-6 mb-6">
                      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary-600" />
                        Payment Information
                      </h2>

                      <div className="mb-6 p-4 bg-accent-900/10 rounded-lg flex items-start gap-3">
                        <Shield className="h-5 w-5 text-accent-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-1">
                            Secure Payment
                          </p>
                          <p className="text-muted-foreground">
                            Your payment information is encrypted and secure. We
                            never store your card details.
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="cardNumber"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Card Number *
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          required
                          value={formData.cardNumber}
                          onChange={(e) =>
                            handleInputChange("cardNumber", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label
                            htmlFor="cardExpiry"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Expiry Date *
                          </label>
                          <input
                            id="cardExpiry"
                            type="text"
                            required
                            value={formData.cardExpiry}
                            onChange={(e) =>
                              handleInputChange("cardExpiry", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="cardCvc"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            CVC *
                          </label>
                          <input
                            id="cardCvc"
                            type="text"
                            required
                            value={formData.cardCvc}
                            onChange={(e) =>
                              handleInputChange("cardCvc", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="cardName"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Cardholder Name *
                        </label>
                        <input
                          id="cardName"
                          type="text"
                          required
                          value={formData.cardName}
                          onChange={(e) =>
                            handleInputChange("cardName", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 py-3 rounded-xl border-2 border-border hover:border-primary-500 transition-colors font-medium"
                      >
                        Back
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceed()}
                        className="ml-auto px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-glow"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!canProceed()}
                        className="ml-auto px-8 py-3 rounded-xl bg-accent-600 hover:bg-accent-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-glow flex items-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Place Order - ${total.toFixed(2)}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="glass-card rounded-2xl p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Order Summary
                  </h2>

                  {/* Items by Farm */}
                  <div className="space-y-4 mb-6">
                    {Object.entries(itemsByFarm).map(([farm, items]) => (
                      <div key={farm}>
                        <h3 className="font-semibold text-foreground mb-2 text-sm">
                          {farm}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-foreground font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border">
                      <span>Total</span>
                      <span className="text-gradient-warm">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 bg-accent-900/20 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-accent-600" />
                      </div>
                      <span>Secure SSL checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 bg-accent-900/20 rounded-full flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-accent-600" />
                      </div>
                      <span>Supporting local farms</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 bg-accent-900/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-accent-600" />
                      </div>
                      <span>Satisfaction guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
