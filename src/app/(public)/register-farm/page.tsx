"use client";

import {
  AlertCircle,
  CheckCircle,
  FileText,
  Leaf,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";

/**
 * 🌾 FARMER REGISTRATION PAGE - Fall Harvest Theme
 * Multi-step farm registration form
 */

interface FarmRegistrationData {
  // Farm Details
  farmName: string;
  farmDescription: string;
  farmType: string;

  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Contact
  ownerName: string;
  email: string;
  phone: string;

  // Certifications
  organic: boolean;
  biodynamic: boolean;
  gapCertified: boolean;

  // Business
  businessLicense: string;
  taxId: string;
  insurance: boolean;

  // Additional
  website: string;
  socialMedia: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
}

export default function RegisterFarmPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FarmRegistrationData>({
    farmName: "",
    farmDescription: "",
    farmType: "",
    address: "",
    city: "",
    state: "OR",
    zipCode: "",
    ownerName: "",
    email: "",
    phone: "",
    organic: false,
    biodynamic: false,
    gapCertified: false,
    businessLicense: "",
    taxId: "",
    insurance: false,
    website: "",
    socialMedia: "",
    pickupAvailable: true,
    deliveryAvailable: false,
  });

  const handleInputChange = (
    field: keyof FarmRegistrationData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Note: API integration in progress - using mock submission for now
    alert(
      "Farm registration submitted! We'll review and contact you within 2-3 business days.",
    );
    // Redirect to confirmation page
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.farmName && formData.farmDescription && formData.farmType;
    }
    if (currentStep === 2) {
      return (
        formData.address && formData.city && formData.state && formData.zipCode
      );
    }
    if (currentStep === 3) {
      return formData.ownerName && formData.email && formData.phone;
    }
    if (currentStep === 4) {
      return formData.businessLicense && formData.taxId && formData.insurance;
    }
    return true;
  };

  const STEPS = [
    { number: 1, title: "Farm Details", icon: Leaf },
    { number: 2, title: "Location", icon: MapPin },
    { number: 3, title: "Contact", icon: User },
    { number: 4, title: "Business Info", icon: FileText },
    { number: 5, title: "Review", icon: CheckCircle },
  ];

  const FARM_TYPES = [
    "Vegetable Farm",
    "Fruit Orchard",
    "Dairy Farm",
    "Livestock Ranch",
    "Grain Farm",
    "Mixed/Diversified",
    "Specialty Crops",
    "Organic Farm",
  ];

  return (
<main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-accent-600/20 border border-accent-500/30 text-accent-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-4">
                <Leaf className="h-5 w-5" />
                Become a Partner Farmer
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Register Your Farm
              </h1>
              <p className="text-muted-foreground">
                Join our marketplace and reach thousands of local customers
              </p>
            </div>

            {/* Progress Steps */}
            <div className="glass-card rounded-2xl p-6 mb-8">
              <div className="flex justify-between">
                {STEPS.map((step, idx) => {
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
                          className={`text-xs md:text-sm font-medium text-center ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
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
              {/* Step 1: Farm Details */}
              {currentStep === 1 && (
                <div className="glass-card rounded-2xl p-6 mb-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary-600" />
                    Farm Details
                  </h2>
                  <div>
                    <label
                      htmlFor="farmName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Farm Name *
                    </label>
                    <input
                      id="farmName"
                      type="text"
                      required
                      value={formData.farmName}
                      onChange={(e) =>
                        handleInputChange("farmName", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="Green Valley Farm"
                    />
                  </div>{" "}
                  <div>
                    <label
                      htmlFor="farm-type"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Farm Type *
                    </label>
                    <select
                      id="farm-type"
                      required
                      value={formData.farmType}
                      onChange={(e) =>
                        handleInputChange("farmType", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      aria-label="Farm type"
                    >
                      <option value="">Select farm type</option>
                      {FARM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="farmDescription"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Farm Description * (Tell customers about your farm)
                    </label>
                    <textarea
                      required
                      value={formData.farmDescription}
                      onChange={(e) =>
                        handleInputChange("farmDescription", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all resize-none"
                      placeholder="We're a family-owned organic farm growing seasonal vegetables..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label
                      htmlFor="certifications"
                      className="block text-sm font-medium text-foreground"
                    >
                      Certifications (Optional)
                    </label>
                    <div id="certifications" className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.organic}
                          onChange={(e) =>
                            handleInputChange("organic", e.target.checked)
                          }
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-foreground">
                          USDA Organic Certified
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.biodynamic}
                          onChange={(e) =>
                            handleInputChange("biodynamic", e.target.checked)
                          }
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-foreground">
                          Biodynamic Certified
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.gapCertified}
                          onChange={(e) =>
                            handleInputChange("gapCertified", e.target.checked)
                          }
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-foreground">GAP Certified</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="glass-card rounded-2xl p-6 mb-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    Farm Location
                  </h2>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Street Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="123 Farm Road"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                        placeholder="Portland"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        State *
                      </label>
                      <select
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                        aria-label="State"
                      >
                        <option value="OR">Oregon</option>
                        <option value="WA">Washington</option>
                        <option value="CA">California</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      ZIP Code *
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="97201"
                      maxLength={5}
                    />
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="pickupOptions"
                      className="block text-sm font-medium text-foreground"
                    >
                      Pickup & Delivery Options
                    </label>
                    <div id="pickupOptions" className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pickupAvailable}
                          onChange={(e) =>
                            handleInputChange(
                              "pickupAvailable",
                              e.target.checked,
                            )
                          }
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-foreground">
                          Offer on-farm pickup
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.deliveryAvailable}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAvailable",
                              e.target.checked,
                            )
                          }
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-foreground">
                          Offer delivery service
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact */}
              {currentStep === 3 && (
                <div className="glass-card rounded-2xl p-6 mb-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-600" />
                    Contact Information
                  </h2>

                  <div>
                    <label
                      htmlFor="ownerName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Farm Owner / Manager Name *
                    </label>
                    <input
                      id="ownerName"
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) =>
                        handleInputChange("ownerName", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="contactEmail"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                        placeholder="farmer@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="contactPhone"
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

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Website (Optional)
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="https://yourfarm.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="socialMedia"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Social Media (Optional)
                    </label>
                    <input
                      id="socialMedia"
                      type="text"
                      value={formData.socialMedia}
                      onChange={(e) =>
                        handleInputChange("socialMedia", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="@yourfarm or facebook.com/yourfarm"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Business Info */}
              {currentStep === 4 && (
                <div className="glass-card rounded-2xl p-6 mb-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                    Business Information
                  </h2>

                  <div className="p-4 bg-accent-900/10 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-accent-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        Required Documentation
                      </p>
                      <p>
                        All farms must provide valid business registration and
                        insurance information.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="businessLicense"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Business License Number *
                    </label>
                    <input
                      id="businessLicense"
                      type="text"
                      required
                      value={formData.businessLicense}
                      onChange={(e) =>
                        handleInputChange("businessLicense", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="BL-123456"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="taxId"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Tax ID / EIN *
                    </label>
                    <input
                      id="taxId"
                      type="text"
                      required
                      value={formData.taxId}
                      onChange={(e) =>
                        handleInputChange("taxId", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.insurance}
                        onChange={(e) =>
                          handleInputChange("insurance", e.target.checked)
                        }
                        className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-foreground">
                        I have liability insurance for my farm business *
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                      Review Your Information
                    </h2>

                    <div className="space-y-6">
                      {/* Farm Details */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          Farm Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-muted-foreground">Name:</span>{" "}
                            <span className="text-foreground font-medium">
                              {formData.farmName}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Type:</span>{" "}
                            <span className="text-foreground">
                              {formData.farmType}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Description:
                            </span>{" "}
                            <span className="text-foreground">
                              {formData.farmDescription}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Certifications:
                            </span>{" "}
                            <span className="text-foreground">
                              {[
                                formData.organic && "Organic",
                                formData.biodynamic && "Biodynamic",
                                formData.gapCertified && "GAP",
                              ]
                                .filter(Boolean)
                                .join(", ") || "None"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-foreground">{formData.address}</p>
                          <p className="text-foreground">
                            {formData.city}, {formData.state} {formData.zipCode}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Pickup:
                            </span>{" "}
                            <span className="text-foreground">
                              {formData.pickupAvailable ? "Yes" : "No"}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Delivery:
                            </span>{" "}
                            <span className="text-foreground">
                              {formData.deliveryAvailable ? "Yes" : "No"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-foreground">
                            {formData.ownerName}
                          </p>
                          <p className="text-foreground">{formData.email}</p>
                          <p className="text-foreground">{formData.phone}</p>
                          {formData.website && (
                            <p className="text-foreground">
                              {formData.website}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Business */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Business
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-muted-foreground">
                              License:
                            </span>{" "}
                            <span className="text-foreground">
                              {formData.businessLicense}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Tax ID:
                            </span>{" "}
                            <span className="text-foreground">
                              {formData.taxId}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Insurance:
                            </span>{" "}
                            <span className="text-accent-600 font-medium">
                              ✓ Confirmed
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500 mt-0.5"
                        />
                        <span className="text-sm text-foreground">
                          I agree to the 10% commission on all sales and
                          understand that payments are processed weekly *
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500 mt-0.5"
                        />
                        <span className="text-sm text-foreground">
                          I have read and agree to the{" "}
                          <a
                            href="/terms"
                            className="text-primary-600 hover:text-primary-500 underline"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            className="text-primary-600 hover:text-primary-500 underline"
                          >
                            Privacy Policy
                          </a>{" "}
                          *
                        </span>
                      </label>
                    </div>
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
                {currentStep < 5 ? (
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
                    className="ml-auto px-8 py-3 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-semibold transition-colors shadow-glow flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Submit Application
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
  );
}
