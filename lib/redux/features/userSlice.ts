import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CurrentUser, Store } from "@/types/index";
import { StoreAccess, StorePermission } from "@/types/store-access";

interface CurrentUserState {
  user: CurrentUser | null;
  store: Store | null;
  stores: StoreAccess[];
  activeStoreId: string | null;
  permissions: StorePermission[];
}

const initialState: CurrentUserState = {
  user: null,
  store: null,
  stores: [],
  activeStoreId: null,
  permissions: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<CurrentUserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => {
      return initialState;
    },
  },
});

export const { setCurrentUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
