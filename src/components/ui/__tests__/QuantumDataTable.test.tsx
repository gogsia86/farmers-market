/**
 * 🧪 QUANTUM DATA TABLE - Component Tests
 *
 * Comprehensive test suite for QuantumDataTable component.
 * Tests sorting, filtering, pagination, selection, and agricultural consciousness.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QuantumDataTable,
  createColumn,
  QuantumColumn,
} from "../QuantumDataTable";

// ============================================================================
// TEST DATA
// ============================================================================

interface TestFarm {
  id: string;
  name: string;
  owner: string;
  productsCount: number;
  revenue: number;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
}

const mockFarms: TestFarm[] = [
  {
    id: "1",
    name: "Green Valley Farm",
    owner: "John Smith",
    productsCount: 25,
    revenue: 15000,
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Sunrise Orchards",
    owner: "Maria Garcia",
    productsCount: 18,
    revenue: 12500,
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Mountain View Ranch",
    owner: "David Lee",
    productsCount: 32,
    revenue: 22000,
    status: "PENDING",
  },
  {
    id: "4",
    name: "Organic Meadows",
    owner: "Sarah Johnson",
    productsCount: 12,
    revenue: 8500,
    status: "ACTIVE",
  },
  {
    id: "5",
    name: "Heritage Homestead",
    owner: "Michael Brown",
    productsCount: 45,
    revenue: 35000,
    status: "ACTIVE",
  },
];

const createMockColumns = (): QuantumColumn<TestFarm>[] => [
  createColumn<TestFarm>({
    key: "name",
    label: "Farm Name",
    accessor: (farm) => farm.name,
    sortable: true,
  }),
  createColumn<TestFarm>({
    key: "owner",
    label: "Owner",
    accessor: (farm) => farm.owner,
    sortable: true,
  }),
  createColumn<TestFarm>({
    key: "products",
    label: "Products",
    accessor: (farm) => farm.productsCount.toString(),
    sortable: true,
    sortFn: (a, b) => a.productsCount - b.productsCount,
    align: "center",
  }),
  createColumn<TestFarm>({
    key: "revenue",
    label: "Revenue",
    accessor: (farm) => `$${farm.revenue.toLocaleString()}`,
    sortable: true,
    sortFn: (a, b) => a.revenue - b.revenue,
    align: "right",
  }),
  createColumn<TestFarm>({
    key: "status",
    label: "Status",
    accessor: (farm) => farm.status,
    sortable: true,
  }),
];

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe("QuantumDataTable - Basic Rendering", () => {
  it("renders table with data", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    // Check that farm names are rendered
    expect(screen.getByText("Green Valley Farm")).toBeInTheDocument();
    expect(screen.getByText("Sunrise Orchards")).toBeInTheDocument();
    expect(screen.getByText("Mountain View Ranch")).toBeInTheDocument();
  });

  it("renders column headers correctly", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    expect(screen.getByText("Farm Name")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={[]}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        emptyMessage="No farms available"
      />,
    );

    expect(screen.getByText("No farms available")).toBeInTheDocument();
    expect(screen.getByText(/quantum field is empty/i)).toBeInTheDocument();
  });

  it("renders loading state", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        loading
      />,
    );

    // Loading state should show skeleton
    const skeletons = screen.getAllByRole("img", { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// SORTING TESTS
// ============================================================================

describe("QuantumDataTable - Sorting", () => {
  it("sorts by string column ascending", async () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    const nameHeader = screen.getByText("Farm Name");
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // First data row should be "Green Valley Farm" (alphabetically first)
      expect(rows[1]).toHaveTextContent("Green Valley Farm");
    });
  });

  it("sorts by string column descending on second click", async () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    const nameHeader = screen.getByText("Farm Name");

    // First click - ascending
    fireEvent.click(nameHeader);

    // Second click - descending
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // First data row should be "Sunrise Orchards" (alphabetically last)
      expect(rows[1]).toHaveTextContent("Sunrise Orchards");
    });
  });

  it("clears sort on third click", async () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    const nameHeader = screen.getByText("Farm Name");

    // Three clicks - back to original order
    fireEvent.click(nameHeader);
    fireEvent.click(nameHeader);
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // Should be back to original order (Green Valley Farm first)
      expect(rows[1]).toHaveTextContent("Green Valley Farm");
    });
  });

  it("sorts by custom sort function", async () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    const productsHeader = screen.getByText("Products");
    fireEvent.click(productsHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // Should sort by productsCount numerically
      // Organic Meadows has 12 products (lowest)
      expect(rows[1]).toHaveTextContent("Organic Meadows");
    });
  });
});

// ============================================================================
// PAGINATION TESTS
// ============================================================================

describe("QuantumDataTable - Pagination", () => {
  it("renders pagination controls when enabled", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        pagination
        pageSize={2}
      />,
    );

    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("displays correct page size", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        pagination
        pageSize={2}
      />,
    );

    // Only 2 farms should be visible
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(3); // 1 header + 2 data rows
  });

  it("navigates to next page", async () => {
    const user = userEvent.setup();
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        pagination
        pageSize={2}
      />,
    );

    const nextButton = screen.getByText("Next");
    await user.click(nextButton);

    await waitFor(() => {
      // Should show page 2 data
      expect(screen.getByText("Mountain View Ranch")).toBeInTheDocument();
    });
  });

  it("disables previous button on first page", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        pagination
        pageSize={2}
      />,
    );

    const previousButton = screen.getByText("Previous");
    expect(previousButton).toBeDisabled();
  });

  it("changes page size", async () => {
    const user = userEvent.setup();
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        pagination
        pageSize={2}
        pageSizeOptions={[2, 5, 10]}
      />,
    );

    const pageSizeSelect = screen.getByLabelText(/rows per page/i);
    await user.selectOptions(pageSizeSelect, "5");

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(6); // 1 header + 5 data rows
    });
  });
});

// ============================================================================
// SELECTION TESTS
// ============================================================================

describe("QuantumDataTable - Selection", () => {
  it("renders checkboxes when selectable", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        selectable
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // 1 select-all + 5 row checkboxes
    expect(checkboxes.length).toBe(6);
  });

  it("selects individual row", async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    const columns = createMockColumns();

    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const firstRowCheckbox = checkboxes[1]; // Skip select-all

    await user.click(firstRowCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(["1"]);
  });

  it("selects all rows", async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    const columns = createMockColumns();

    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    const selectAllCheckbox = screen.getByLabelText(/select all/i);
    await user.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(["1", "2", "3", "4", "5"]);
  });

  it("deselects all rows when all are selected", async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    const columns = createMockColumns();

    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        selectable
        selectedKeys={["1", "2", "3", "4", "5"]}
        onSelectionChange={onSelectionChange}
      />,
    );

    const selectAllCheckbox = screen.getByLabelText(/select all/i);
    await user.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });
});

// ============================================================================
// ROW INTERACTION TESTS
// ============================================================================

describe("QuantumDataTable - Row Interactions", () => {
  it("calls onRowClick when row is clicked", async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();
    const columns = createMockColumns();

    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        onRowClick={onRowClick}
      />,
    );

    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1];

    await user.click(firstDataRow);

    expect(onRowClick).toHaveBeenCalledWith(mockFarms[0]);
  });

  it("applies hover styles when hoverable", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        hoverable
      />,
    );

    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1];

    expect(firstDataRow).toHaveClass("hover:bg-agricultural-50");
  });

  it("applies striped styles when enabled", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        striped
      />,
    );

    const rows = screen.getAllByRole("row");
    const secondDataRow = rows[2]; // Index 1 in data (even)

    expect(secondDataRow).toHaveClass("bg-agricultural-25");
  });
});

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS TESTS
// ============================================================================

describe("QuantumDataTable - Agricultural Consciousness", () => {
  it("displays divine consciousness indicator", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        agricultural={{
          consciousness: "DIVINE",
        }}
      />,
    );

    expect(screen.getByText(/Quantum Coherence: Active/i)).toBeInTheDocument();
  });

  it("applies seasonal color scheme", () => {
    const columns = createMockColumns();
    const { container } = render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        agricultural={{
          season: "SPRING",
          consciousness: "DIVINE",
        }}
      />,
    );

    const thead = container.querySelector("thead");
    expect(thead).toHaveClass("border-green-200");
  });

  it("applies different seasonal colors", () => {
    const columns = createMockColumns();
    const { container } = render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        agricultural={{
          season: "WINTER",
          consciousness: "DIVINE",
        }}
      />,
    );

    const thead = container.querySelector("thead");
    expect(thead).toHaveClass("border-blue-200");
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe("QuantumDataTable - Accessibility", () => {
  it("has proper ARIA labels for checkboxes", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        selectable
      />,
    );

    expect(screen.getByLabelText(/select all/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select row 1/i)).toBeInTheDocument();
  });

  it("supports keyboard navigation for sortable columns", async () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    const nameHeader = screen.getByText("Farm Name");
    nameHeader.focus();

    fireEvent.keyDown(nameHeader, { key: "Enter" });

    await waitFor(() => {
      // Should trigger sort
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Green Valley Farm");
    });
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("QuantumDataTable - Edge Cases", () => {
  it("handles single row of data", () => {
    const columns = createMockColumns();
    render(
      <QuantumDataTable
        data={[mockFarms[0]]}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    expect(screen.getByText("Green Valley Farm")).toBeInTheDocument();
  });

  it("handles null accessor values gracefully", () => {
    const columns = [
      createColumn<TestFarm>({
        key: "optional",
        label: "Optional Field",
        accessor: () => null as any,
        sortable: true,
      }),
    ];

    render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
      />,
    );

    const header = screen.getByText("Optional Field");
    fireEvent.click(header);

    // Should not crash
    expect(header).toBeInTheDocument();
  });

  it("handles custom className", () => {
    const columns = createMockColumns();
    const { container } = render(
      <QuantumDataTable
        data={mockFarms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        className="custom-table-class"
      />,
    );

    expect(container.querySelector(".custom-table-class")).toBeInTheDocument();
  });
});
