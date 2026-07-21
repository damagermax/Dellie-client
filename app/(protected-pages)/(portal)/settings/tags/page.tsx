"use client";

import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";
import dynamic from "next/dynamic";
import { TagsQueryParams } from "@/types/tag";
import { useState } from "react";
import { TagsView } from "@/components/tags/tag-view/TagsView";
import { TagsFilters } from "@/components/tags/TagsFilterView";

// Import components with SSR disabled to avoid hydration issues
const TagsFormModal = dynamic(() => import("@/components/tags/TagsFormModal"), { ssr: false });

export default function TagsPage() {
  const [openTagForm, toggleTagForm] = useToggle();

  const [tagQuery, setTagQuery] = useState<TagsQueryParams>({});

  const handleFilterChange = (values: Partial<TagsQueryParams>) => {
    setTagQuery((prev) => ({ ...prev, ...values }));
  };

  const handleFilterRest = () => {
    setTagQuery({});
  };

  return (
    <div className="">
      <div className="py-8 px-8 flex justify-between items-center w-full bg-white ">
        <div className="flex items-center gap-4">
          <AppSearch placeholder="Search tags..." onReset={handleFilterRest} onSearchChange={handleFilterChange} menu={{ items: TagsFilters({ onChange: handleFilterChange, filters: tagQuery }) }} />
        </div>
        <div className="flex gap-4">
          <div className="hidden md:block">
            <AddButton onClick={toggleTagForm} label="New Tag" />
          </div>
        </div>
      </div>

      <TagsView query={tagQuery} />

      <TagsFormModal open={openTagForm} toggle={toggleTagForm} />
      <FloatingAddButton onClick={toggleTagForm} label="New Tag" />
    </div>
  );
}
