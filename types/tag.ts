export enum TagStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  status?: TagStatus;
  color?: string;
}

export interface TagCreateInput extends Partial<Omit<Tag, "id">> {
  name: string;
}

export interface TagUpdateInput extends Partial<TagCreateInput> {
  id: string;
}

export interface TagsQueryParams {
  search?: string | "";
  status?: TagStatus;
}
