import React, { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket/socket";
import { useAuth } from "./authContext";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  //  1. Fetch old notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?._id) return;
      const token = localStorage.getItem("idToken");
      try {
        const res = await fetch("http://localhost:5001/api/v1/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        
        const sorted = (data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotifications(sorted);
      } catch (err) {
        console.error("Fetch notifications error:", err);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // 2. Socket connection
  useEffect(() => {
    if (!currentUser?._id) return;

    socket.emit("join", currentUser._id);

    const handler = (data) => {
      setNotifications((prev) => [data, ...prev]);
      toast.success(data.message);
    };

    socket.on("notification", handler);

    return () => socket.off("notification", handler);
  }, [currentUser]);

  // 3. Mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("idToken");
      await fetch(
        `http://localhost:5001/api/v1/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  //4. mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("idToken");

      await fetch("http://localhost:5001/api/v1/notifications/read-all", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // update UI
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};