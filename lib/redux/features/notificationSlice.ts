import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationPayload {
    type: NotificationType;
    message: string;
    description?: string;
}

interface NotificationState {
    queue: NotificationPayload[];
}

const initialState: NotificationState = {
    queue: [],
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<NotificationPayload>) => {
            state.queue.push(action.payload);
        },
        removeNotification: (state) => {
            state.queue.shift();
        },
    },
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
