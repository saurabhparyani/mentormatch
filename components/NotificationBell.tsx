import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import { useWebSocket } from "@/hooks/useWebSocket";

interface Notification {
  id: string;
  fromUser: {
    id: string;
    name: string;
    role: "MENTOR" | "MENTEE";
  };
  type: "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED";
  message: string;
  read: boolean;
  createdAt: string;
  connectionId: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch notifications");
      }

      if (!Array.isArray(data.notifications)) {
        throw new Error("Invalid response format");
      }

      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter((n: Notification) => !n.read).length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]); // Set empty array as fallback
      setUnreadCount(0); // Reset unread count
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const socket = useWebSocket(() => {
    // Handle connection accepted event
    fetchNotifications();
  });

  const handleAction = async (
    notificationId: string,
    action: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const notificationToUpdate = notifications.find(
        (n) => n.id === notificationId
      );
      if (!notificationToUpdate) {
        throw new Error("Notification not found");
      }

      const response = await fetch(
        `/api/connections/${notificationToUpdate.connectionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update connection");
      }

      const { connection } = await response.json();

      // Emit socket event for real-time update
      if (action === "ACCEPTED" && socket) {
        socket.emit("connection_accepted", {
          userId: connection.fromUserId,
          acceptedBy: user?.id,
        });
      }

      // Mark notification as read
      const readResponse = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (!readResponse.ok) {
        throw new Error("Failed to mark notification as read");
      }

      if (action === "ACCEPTED") {
        // Create notification for the original sender
        const notifyResponse = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: connection.fromUserId,
            type: "CONNECTION_ACCEPTED",
            message: `${user?.name} accepted your connection request`,
            connectionId: connection.id,
          }),
        });

        if (!notifyResponse.ok) {
          throw new Error("Failed to create acceptance notification");
        }
      }

      // Remove the notification from the list
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success(
        action === "ACCEPTED" ? "Connection accepted!" : "Connection declined"
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to process connection action");
    }
  };

  const handleAccept = async (notificationId: string) => {
    setIsAccepting(notificationId);
    try {
      await handleAction(notificationId, "ACCEPTED");
    } finally {
      setIsAccepting(null);
    }
  };

  const handleDecline = async (notificationId: string) => {
    setIsDeclining(notificationId);
    try {
      await handleAction(notificationId, "REJECTED");
    } finally {
      setIsDeclining(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-3 p-4"
                >
                  {notification.fromUser && (
                    <UserAvatar
                      name={notification.fromUser.name}
                      className="h-10 w-10"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="text-sm">
                      {notification.fromUser && (
                        <span className="font-semibold">
                          {notification.fromUser.name}
                        </span>
                      )}{" "}
                      {notification.message}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(notification.id)}
                        isLoading={isAccepting === notification.id}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(notification.id)}
                        isLoading={isDeclining === notification.id}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
