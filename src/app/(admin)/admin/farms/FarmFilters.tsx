"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { filterFarmsByStatus, searchFarms } from "./actions";

export function FarmFilters() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.length < 2) return;

    startTransition(async () => {
      const result = await searchFarms(term);
      if (result.success) {
        // Update would happen via state management or URL params
        router.refresh();
      }
    });
  };

  const handleStatusFilter = async (status: string) => {
    setSelectedStatus(status);

    startTransition(async () => {
      await filterFarmsByStatus(status as any);
      router.refresh();
    });
  };

  return (
    <div className="bg-white shadow rounded-lg border border-agricultural-200 mb-6">
      <div className="px-6 py-4 border-b border-agricultural-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-agricultural-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search farms by name, location, or owner..."
                disabled={isPending}
                className="block w-full pl-10 pr-3 py-2 border border-agricultural-300 rounded-md leading-5 bg-white placeholder-agricultural-500 focus:outline-none focus:placeholder-agricultural-400 focus:ring-1 focus:ring-agricultural-500 focus:border-agricultural-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              disabled={isPending}
              aria-label="Filter farms by status"
              className="block pl-3 pr-10 py-2 text-base border-agricultural-300 focus:outline-none focus:ring-agricultural-500 focus:border-agricultural-500 rounded-md disabled:opacity-50"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Review</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
