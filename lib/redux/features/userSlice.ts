import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { User, Store } from "@/types/index";

interface CurrentUserState {
  user: User | null;
  store: Store | null;
}

const initialState: CurrentUserState = {
  user: null,
  store: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<CurrentUserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: (state) => {
      return initialState;
    },
  },
});

export const { setCurrentUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
