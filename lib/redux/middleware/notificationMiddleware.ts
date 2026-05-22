import { isFulfilled, isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { addNotification } from "../features/notificationSlice";

export const notificationMiddleware: Middleware = (store) => (next) => (action) => {
  // Handle errors globally
  if (isRejectedWithValue(action)) {
    store.dispatch(
      addNotification({
        type: "error",
        message: "Request Failed",
        description: (action.payload as any)?.data?.message || "Something went wrong",
      })
    );
  }

  // Handle success globally
  if (isFulfilled(action)) {
    const mutation = (action.meta as any)?.arg?.type !== "query";

    if (mutation) {
      store.dispatch(
        addNotification({
          type: "success",
          message: "Action Successful",
          description: (action.payload as any)?.message || "Action completed successfully",
        })
      );
    }
  }
  return next(action);
};
