/**
 * @jest-environment jsdom
 */


/**
 * 🧪 DELIVERY ZONES MANAGER - UNIT TESTS
 * Comprehensive test suite for DeliveryZonesManager component
 * Sprint 5: Settings & Configuration
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeliveryZonesManager } from "@/components/features/settings/DeliveryZonesManager";
import type { DeliveryArea } from "@/types/settings";

describe("DeliveryZonesManager", () => {
  const mockOnChange = jest.fn();

  const defaultZones: DeliveryArea[] = [
    {
      name: "Downtown",
      postalCodes: ["12345", "12346"],
      radius: 10,
      deliveryFee: 5.0,
    },
    {
      name: "Suburbs",
      postalCodes: ["12350"],
      radius: 15,
      deliveryFee: 7.5,
    },
  ];

  const farmLocation = {
    lat: 40.7128,
    lng: -74.006,
    address: "123 Farm Road, City, State 12345",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with header", () => {
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Delivery Zones")).toBeInTheDocument();
      expect(screen.getByTestId("delivery-zones-manager")).toBeInTheDocument();
    });

    it("should display add zone button", () => {
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      expect(screen.getByTestId("add-zone-button")).toBeInTheDocument();
      expect(screen.getByText("Add Zone")).toBeInTheDocument();
    });

    it("should display farm location when provided", () => {
      render(
        <DeliveryZonesManager
          value={[]}
          onChange={mockOnChange}
          farmLocation={farmLocation}
        />,
      );

      expect(screen.getByText(/Farm Location:/)).toBeInTheDocument();
      expect(screen.getByText(/123 Farm Road/)).toBeInTheDocument();
    });

    it("should display existing zones", () => {
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      expect(screen.getByText("Downtown")).toBeInTheDocument();
      expect(screen.getByText("Suburbs")).toBeInTheDocument();
    });

    it("should show empty state when no zones", () => {
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      expect(
        screen.getByText("No delivery zones configured"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Add a delivery zone to enable deliveries"),
      ).toBeInTheDocument();
    });
  });

  describe("Zone Information Display", () => {
    it("should display zone details correctly", () => {
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      expect(screen.getByText("10 miles")).toBeInTheDocument();
      expect(screen.getByText("$5.00")).toBeInTheDocument();
      expect(screen.getByText("12345, 12346")).toBeInTheDocument();
    });

    it("should handle zones without postal codes", () => {
      const zoneWithoutPostal: DeliveryArea[] = [
        {
          name: "Wide Area",
          postalCodes: [],
          radius: 20,
          deliveryFee: 10.0,
        },
      ];

      render(
        <DeliveryZonesManager
          value={zoneWithoutPostal}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText("Wide Area")).toBeInTheDocument();
      expect(screen.getByText("20 miles")).toBeInTheDocument();
    });
  });

  describe("Adding New Zone", () => {
    it("should show new zone form when add button clicked", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      expect(screen.getByTestId("new-zone-form")).toBeInTheDocument();
      expect(screen.getByText("New Delivery Zone")).toBeInTheDocument();
    });

    it("should allow entering zone name", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "Test Zone");

      expect(nameInput).toHaveValue("Test Zone");
    });

    it("should allow entering delivery radius", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const radiusInput = screen.getByTestId("new-zone-radius");
      await user.clear(radiusInput);
      await user.type(radiusInput, "15");

      expect(radiusInput).toHaveValue(15);
    });

    it("should allow entering delivery fee", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const feeInput = screen.getByTestId("new-zone-fee");
      await user.clear(feeInput);
      await user.type(feeInput, "8.50");

      expect(feeInput).toHaveValue(8.5);
    });

    it("should allow entering postal codes", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const postalInput = screen.getByTestId("new-zone-postal-codes");
      await user.type(postalInput, "12345, 12346, 12347");

      expect(postalInput).toHaveValue("12345, 12346, 12347");
    });

    it("should save new zone with valid data", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "New Zone");

      const saveButton = screen.getByTestId("save-new-zone");
      await user.click(saveButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        {
          name: "New Zone",
          postalCodes: [],
          radius: 10,
          deliveryFee: 0,
        },
      ]);
    });

    it("should not save zone without name", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const saveButton = screen.getByTestId("save-new-zone");
      expect(saveButton).toBeDisabled();
    });

    it("should cancel new zone creation", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const cancelButton = screen.getByTestId("cancel-new-zone");
      await user.click(cancelButton);

      expect(screen.queryByTestId("new-zone-form")).not.toBeInTheDocument();
    });

    it("should disable add button when form is open", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      expect(addButton).toBeDisabled();
    });
  });

  describe("Editing Existing Zone", () => {
    it("should enter edit mode when edit button clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      const editButton = screen.getByTestId("edit-zone-0");
      await user.click(editButton);

      expect(screen.getByTestId("edit-zone-name-0")).toBeInTheDocument();
    });

    it("should update zone name in edit mode", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      const editButton = screen.getByTestId("edit-zone-0");
      await user.click(editButton);

      const nameInput = screen.getByTestId("edit-zone-name-0");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Downtown");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update zone radius in edit mode", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      const editButton = screen.getByTestId("edit-zone-0");
      await user.click(editButton);

      const radiusInput = screen.getByTestId("edit-zone-radius-0");
      await user.clear(radiusInput);
      await user.type(radiusInput, "12");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should exit edit mode when done button clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      const editButton = screen.getByTestId("edit-zone-0");
      await user.click(editButton);

      const doneButton = screen.getByTestId("save-zone-0");
      await user.click(doneButton);

      expect(screen.queryByTestId("edit-zone-name-0")).not.toBeInTheDocument();
    });
  });

  describe("Deleting Zone", () => {
    it("should delete zone when delete button clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      const deleteButton = screen.getByTestId("delete-zone-0");
      await user.click(deleteButton);

      expect(mockOnChange).toHaveBeenCalledWith([defaultZones[1]]);
    });

    it("should delete all zones when deleting last zone", async () => {
      const user = userEvent.setup();
      const singleZone = [defaultZones[0]];

      render(
        <DeliveryZonesManager value={singleZone} onChange={mockOnChange} />,
      );

      const deleteButton = screen.getByTestId("delete-zone-0");
      await user.click(deleteButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe("Postal Code Parsing", () => {
    it("should parse comma-separated postal codes", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "Test");

      const postalInput = screen.getByTestId("new-zone-postal-codes");
      await user.type(postalInput, "12345, 12346, 12347");

      const saveButton = screen.getByTestId("save-new-zone");
      await user.click(saveButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          postalCodes: ["12345", "12346", "12347"],
        }),
      ]);
    });

    it("should handle postal codes with extra spaces", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "Test");

      const postalInput = screen.getByTestId("new-zone-postal-codes");
      await user.type(postalInput, " 12345 ,  12346  , 12347 ");

      const saveButton = screen.getByTestId("save-new-zone");
      await user.click(saveButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          postalCodes: ["12345", "12346", "12347"],
        }),
      ]);
    });

    it("should filter out empty postal codes", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      const nameInput = screen.getByTestId("new-zone-name");
      await user.type(nameInput, "Test");

      const postalInput = screen.getByTestId("new-zone-postal-codes");
      await user.type(postalInput, "12345,  , 12346, ,");

      const saveButton = screen.getByTestId("save-new-zone");
      await user.click(saveButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          postalCodes: ["12345", "12346"],
        }),
      ]);
    });
  });

  describe("Disabled State", () => {
    it("should disable add button when disabled prop is true", () => {
      render(
        <DeliveryZonesManager
          value={[]}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const addButton = screen.getByTestId("add-zone-button");
      expect(addButton).toBeDisabled();
    });

    it("should disable edit buttons when disabled", () => {
      render(
        <DeliveryZonesManager
          value={defaultZones}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const editButton = screen.getByTestId("edit-zone-0");
      expect(editButton).toBeDisabled();
    });

    it("should disable delete buttons when disabled", () => {
      render(
        <DeliveryZonesManager
          value={defaultZones}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const deleteButton = screen.getByTestId("delete-zone-0");
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button labels", () => {
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      expect(screen.getByTestId("add-zone-button")).toHaveAccessibleName();
      expect(screen.getByTestId("edit-zone-0")).toHaveAttribute("title");
      expect(screen.getByTestId("delete-zone-0")).toHaveAttribute("title");
    });

    it("should have form labels", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      expect(screen.getByLabelText(/Zone Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Delivery Radius/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Delivery Fee/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty zones array", () => {
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      expect(
        screen.getByText("No delivery zones configured"),
      ).toBeInTheDocument();
    });

    it("should handle zone with zero delivery fee", () => {
      const freeDeliveryZone: DeliveryArea[] = [
        {
          name: "Free Zone",
          postalCodes: ["12345"],
          radius: 5,
          deliveryFee: 0,
        },
      ];

      render(
        <DeliveryZonesManager
          value={freeDeliveryZone}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should handle very large delivery radius", () => {
      const largeRadiusZone: DeliveryArea[] = [
        {
          name: "Wide Area",
          postalCodes: [],
          radius: 100,
          deliveryFee: 50.0,
        },
      ];

      render(
        <DeliveryZonesManager
          value={largeRadiusZone}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText("100 miles")).toBeInTheDocument();
    });

    it("should handle zone without optional radius", () => {
      const zoneWithoutRadius: DeliveryArea[] = [
        {
          name: "Postal Only",
          postalCodes: ["12345"],
          deliveryFee: 5.0,
        },
      ];

      render(
        <DeliveryZonesManager
          value={zoneWithoutRadius}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText("Postal Only")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("should display helper text", () => {
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      expect(
        screen.getByText(
          /Configure delivery zones to specify where you deliver/,
        ),
      ).toBeInTheDocument();
    });

    it("should display postal codes helper text in form", async () => {
      const user = userEvent.setup();
      render(<DeliveryZonesManager value={[]} onChange={mockOnChange} />);

      const addButton = screen.getByTestId("add-zone-button");
      await user.click(addButton);

      expect(
        screen.getByText(/Separate multiple postal codes with commas/),
      ).toBeInTheDocument();
    });
  });

  describe("Multiple Zones Management", () => {
    it("should handle multiple zones correctly", () => {
      const manyZones: DeliveryArea[] = [
        { name: "Zone 1", postalCodes: [], radius: 10, deliveryFee: 5.0 },
        { name: "Zone 2", postalCodes: [], radius: 15, deliveryFee: 7.5 },
        { name: "Zone 3", postalCodes: [], radius: 20, deliveryFee: 10.0 },
      ];

      render(
        <DeliveryZonesManager value={manyZones} onChange={mockOnChange} />,
      );

      expect(screen.getByText("Zone 1")).toBeInTheDocument();
      expect(screen.getByText("Zone 2")).toBeInTheDocument();
      expect(screen.getByText("Zone 3")).toBeInTheDocument();
    });

    it("should allow editing one zone without affecting others", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryZonesManager value={defaultZones} onChange={mockOnChange} />,
      );

      const editButton = screen.getByTestId("edit-zone-0");
      await user.click(editButton);

      // Second zone should still be in view mode
      expect(screen.getByText("Suburbs")).toBeInTheDocument();
      expect(screen.queryByTestId("edit-zone-name-1")).not.toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <DeliveryZonesManager
          value={[]}
          onChange={mockOnChange}
          className="custom-class"
        />,
      );

      const manager = container.querySelector(".custom-class");
      expect(manager).toBeInTheDocument();
    });
  });
});
