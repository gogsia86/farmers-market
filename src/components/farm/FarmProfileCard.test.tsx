/**
 * FARM PROFILE CARD COMPONENT TESTS
 *
 * Comprehensive tests for FarmProfileCard component.
 * Tests all variants, interactions, states, and accessibility.
 *
 * Divine Patterns Applied:
 * - Enlightening test names
 * - Comprehensive coverage of all variants
 * - Accessibility testing
 * - User interaction testing
 * - Loading state testing
 *
 * Coverage Target: 100%
 */

import type { QuantumFarm } from "@/types/farm.types";
import { fireEvent, render, screen } from "@testing-library/react";
import { FarmProfileCard } from "./FarmProfileCard";

// ============================================================================
// MOCK NEXT.JS IMAGE
// ============================================================================

jest.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// ============================================================================
// MOCK NEXT.JS LINK
// ============================================================================

jest.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockFarm: QuantumFarm = {
  identity: {
    id: "farm-123",
    slug: "quantum-valley-farm",
    name: "Quantum Valley Farm",
  },
  location: {
    address: "123 Divine Street",
    city: "Reality",
    state: "CA",
    coordinates: {
      lat: 37.7749,
      lng: -122.4194,
    },
  },
  contact: {
    email: "farm@quantum.valley",
    phone: "+1234567890",
  },
  metadata: {
    description: "Growing consciousness through organic vegetables",
    productCategories: ["Vegetables", "Fruits"],
    farmingPractices: ["Organic", "Biodynamic"],
    certifications: ["USDA Organic"],
    deliveryRadius: 25,
    images: {
      logo: "https://example.com/logo.jpg",
      cover: "https://example.com/cover.jpg",
      gallery: [],
    },
  },
  status: {
    current: "ACTIVE",
    verificationStatus: "VERIFIED",
    stripeOnboarded: true,
    payoutsEnabled: true,
  },
  consciousness: {
    currentSeason: "FALL",
    state: "HARVESTING",
  },
  temporal: {
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  owner: {
    id: "user-123",
    firstName: "Test",
    lastName: "Farmer",
    email: "farmer@test.com",
  },
};

// ============================================================================
// TESTS - RENDERING
// ============================================================================

describe("FarmProfileCard - Divine Component", () => {
  describe("Rendering - Basic Display", () => {
    it("renders farm name correctly", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      expect(screen.getByText("Quantum Valley Farm")).toBeInTheDocument();
    });

    it("renders farm location correctly", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      expect(screen.getByText(/Reality, CA/)).toBeInTheDocument();
    });

    it("renders farm description correctly", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      expect(
        screen.getByText(/Growing consciousness through organic vegetables/)
      ).toBeInTheDocument();
    });

    it("renders product categories as tags", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      expect(screen.getByText("Vegetables")).toBeInTheDocument();
      expect(screen.getByText("Fruits")).toBeInTheDocument();
    });

    it("renders farming practices as badges", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      expect(screen.getByText("Organic")).toBeInTheDocument();
      expect(screen.getByText("Biodynamic")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // TESTS - VARIANTS
  // ========================================================================

  describe("Variants - Visual Styles", () => {
    it('renders "default" variant with correct classes', () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} variant="default" />
      );

      const card = container.querySelector('[data-testid="farm-card"]');
      expect(card).toHaveClass("bg-white");
    });

    it('renders "featured" variant with highlighted styling', () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} variant="featured" />
      );

      const card = container.querySelector('[data-testid="farm-card"]');
      expect(card).toHaveClass("border-agricultural-500");
    });

    it('renders "compact" variant with minimal layout', () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} variant="compact" />
      );

      const card = container.querySelector('[data-testid="farm-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  // ========================================================================
  // TESTS - INTERACTIVITY
  // ========================================================================

  describe("Interactivity - Click Behavior", () => {
    it("renders as article (non-interactive) when interactive=false", () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={false} />
      );

      const article = container.querySelector("article");
      expect(article).toBeInTheDocument();
    });

    it("renders as button when interactive=true", () => {
      const onClick = jest.fn();
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={true} onClick={onClick} />
      );

      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("calls onClick handler when clicked (interactive)", () => {
      const onClick = jest.fn();
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={true} onClick={onClick} />
      );

      const button = container.querySelector("button");
      fireEvent.click(button!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("handles keyboard navigation (Enter key)", () => {
      const onClick = jest.fn();
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={true} onClick={onClick} />
      );

      const button = container.querySelector("button");
      fireEvent.keyDown(button!, { key: "Enter" });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("handles keyboard navigation (Space key)", () => {
      const onClick = jest.fn();
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={true} onClick={onClick} />
      );

      const button = container.querySelector("button");
      fireEvent.keyDown(button!, { key: " " });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when non-interactive", () => {
      const onClick = jest.fn();
      const { container } = render(
        <FarmProfileCard
          farm={mockFarm}
          interactive={false}
          onClick={onClick}
        />
      );

      const article = container.querySelector("article");
      fireEvent.click(article!);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // TESTS - LOADING STATE
  // ========================================================================

  describe("Loading State - Skeleton", () => {
    it('renders skeleton when variant="skeleton"', () => {
      const { container } = render(
        <FarmProfileCard.Skeleton variant="default" />
      );

      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute("aria-label", "Loading farm profile");
    });

    it("renders skeleton with all placeholder elements", () => {
      const { container } = render(
        <FarmProfileCard.Skeleton variant="default" />
      );

      // Check for animated skeleton elements
      const animatedElements = container.querySelectorAll(".animate-pulse");
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // TESTS - IMAGE HANDLING
  // ========================================================================

  describe("Image Handling - Quantum Reality", () => {
    it("renders farm logo when available", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      const img = screen.getByAlt("Quantum Valley Farm");
      expect(img).toHaveAttribute("src", "https://example.com/logo.jpg");
    });

    it("renders default image when logo is missing", () => {
      const farmWithoutLogo = {
        ...mockFarm,
        metadata: {
          ...mockFarm.metadata,
          images: {
            ...mockFarm.metadata.images,
            logo: undefined,
          },
        },
      };

      render(<FarmProfileCard farm={farmWithoutLogo} />);

      const img = screen.getByAlt("Quantum Valley Farm");
      expect(img).toHaveAttribute("src", "/images/default-farm.jpg");
    });

    it("handles image load error by showing fallback", () => {
      render(<FarmProfileCard farm={mockFarm} />);

      const img = screen.getByAlt("Quantum Valley Farm");
      fireEvent.error(img);

      // After error, should show fallback
      expect(img).toHaveAttribute("src", "/images/default-farm.jpg");
    });
  });

  // ========================================================================
  // TESTS - ACCESSIBILITY
  // ========================================================================

  describe("Accessibility - A11y Divine Standards", () => {
    it("uses semantic HTML article when non-interactive", () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={false} />
      );

      expect(container.querySelector("article")).toBeInTheDocument();
    });

    it("uses semantic HTML button when interactive", () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={true} />
      );

      expect(container.querySelector("button")).toBeInTheDocument();
    });

    it("has proper ARIA labels", () => {
      const { container } = render(
        <FarmProfileCard farm={mockFarm} interactive={true} />
      );

      const button = container.querySelector("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "View farm: Quantum Valley Farm"
      );
    });

    it("skeleton has proper loading indicator", () => {
      const { container } = render(
        <FarmProfileCard.Skeleton variant="default" />
      );

      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveAttribute("aria-label", "Loading farm profile");
    });
  });

  // ========================================================================
  // TESTS - EDGE CASES
  // ========================================================================

  describe("Edge Cases - Quantum Resilience", () => {
    it("handles missing description gracefully", () => {
      const farmWithoutDesc = {
        ...mockFarm,
        metadata: {
          ...mockFarm.metadata,
          description: undefined,
        },
      };

      render(<FarmProfileCard farm={farmWithoutDesc} />);

      expect(screen.getByText("Quantum Valley Farm")).toBeInTheDocument();
    });

    it("handles empty product categories", () => {
      const farmWithoutCategories = {
        ...mockFarm,
        metadata: {
          ...mockFarm.metadata,
          productCategories: [],
        },
      };

      render(<FarmProfileCard farm={farmWithoutCategories} />);

      expect(screen.getByText("Quantum Valley Farm")).toBeInTheDocument();
    });

    it("handles empty farming practices", () => {
      const farmWithoutPractices = {
        ...mockFarm,
        metadata: {
          ...mockFarm.metadata,
          farmingPractices: [],
        },
      };

      render(<FarmProfileCard farm={farmWithoutPractices} />);

      expect(screen.getByText("Quantum Valley Farm")).toBeInTheDocument();
    });

    it("handles very long farm name gracefully", () => {
      const farmWithLongName = {
        ...mockFarm,
        identity: {
          ...mockFarm.identity,
          name: "A".repeat(200),
        },
      };

      render(<FarmProfileCard farm={farmWithLongName} />);

      const nameElement = screen.getByText("A".repeat(200));
      expect(nameElement).toBeInTheDocument();
    });
  });
});

