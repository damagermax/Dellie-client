import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CurrentUser, Store } from "@/types/index";
import { StoreAccess, StorePermission } from "@/types/store-access";
import { DEFAULT_STORE_SETTINGS, StoreSettings } from "@/types/store-settings";

interface CurrentUserState {
  user: CurrentUser | null;
  store: Store | null;
  stores: StoreAccess[];
  activeStoreId: string | null;
  permissions: StorePermission[];
  storeSettings: StoreSettings;
}

const initialState: CurrentUserState = {
  user: null,
  store: null,
  stores: [],
  activeStoreId: null,
  permissions: [],
  storeSettings: DEFAULT_STORE_SETTINGS,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<Partial<CurrentUserState>>) => {
      return { ...state, ...action.payload };
    },
    updateCurrentStore: (state, action: PayloadAction<Partial<Store>>) => {
      const mergeStore = (currentStore: Store) => ({
        ...currentStore,
        ...action.payload,
        settings: {
          ...currentStore.settings,
          ...(action.payload.settings || {}),
        },
      });

      if (state.store) {
        state.store = mergeStore(state.store);
      }

      if (state.user?.store) {
        state.user.store = mergeStore(state.user.store);
      }
    },
    clearUser: () => {
      return initialState;
    },
    setStoreSettings: (state, action: PayloadAction<StoreSettings>) => {
      state.storeSettings = action.payload;
    },
  },
});

export const { setCurrentUser, updateCurrentStore, clearUser, setStoreSettings } = userSlice.actions;

export default userSlice.reducer;
