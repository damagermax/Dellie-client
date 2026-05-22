"use client";

import { removeNotification } from "@/lib/redux/features/notificationSlice";
import { RootState } from "@/lib/store";
import { notification } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function NotificationListener() {
  const dispatch = useDispatch();
  const queue = useSelector((state: RootState) => state.notification.queue);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (queue.length > 0) {
      const { type, message, description } = queue[0];

      api[type]({
        message,
        description,
        placement: "topLeft",
        duration: 5,
      });

      // Remove it from queue after showing
      dispatch(removeNotification());
    }
  }, [queue, api, dispatch]);

  return <>{contextHolder}</>;
}
