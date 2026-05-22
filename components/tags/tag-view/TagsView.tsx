import { Tag, TagsQueryParams, TagStatus } from "../../../types/tag";
import { useGetTagsQuery } from "@/lib/redux/services";
import { useState } from "react";
import useToggle from "@/hooks/UseToggle";

import { useUpdateTagMutation, useDeleteTagMutation } from "@/lib/redux/services";
import TagsFormModal from "../TagsFormModal";
import TagsTable from "./TagsTable";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";

export interface TagViewItemAction {
  openEditModal: (contact: Tag) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

interface TagsViewProps {
  query: TagsQueryParams;
}

export function TagsView({ query }: TagsViewProps) {
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const [isEditModalOpen, toggleEditModal] = useToggle();

  const [selectedTag, setSelectedTag] = useState<Tag>();

  const { data: tagsData, isLoading: loadingTags } = useGetTagsQuery(query, { refetchOnMountOrArgChange: true });

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    toggleEditModal();
  };

  const handleActivateTag = async (tagId: string) => {
    !isUpdating && (await updateTag({ id: tagId, status: TagStatus.ACTIVE }));
  };
  const handleDeactivateTag = async (tagId: string) => {
    !isUpdating && (await updateTag({ id: tagId, status: TagStatus.INACTIVE }));
  };
  const handleDeleteTag = async (tagId: string) => {
    !isDeleting && (await deleteTag(tagId));
  };

  return (
    <>
      <AppViewLoader loading={loadingTags} />

      <AppNotFoundView dataLength={tagsData?.data?.length || 0} loading={loadingTags} query={query} entity="Tag" />

      <TagsTable tags={tagsData?.data || []} onActivate={handleActivateTag} onDeactivate={handleDeactivateTag} onDelete={handleDeleteTag} openEditModal={handleEditTag} />

      <TagsFormModal open={isEditModalOpen} toggle={toggleEditModal} initialValues={selectedTag} />
    </>
  );
}
