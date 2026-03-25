"use client";

import {
  clearNotifications,
  getAllNotifications,
  markNotificationsAsSeen,
} from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
    refetchInterval: 15000,
  });

  const { mutate: markAsReadMutation } = useMutation({
    mutationFn: markNotificationsAsSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error(
        "Nie udało się oznaczyć powiadomień jako przeczytanych:",
        error,
      );
    },
  });

  const { mutate: clearNotificationsMutation, isPending: isClearing } =
    useMutation({
      mutationFn: clearNotifications,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
      onError: (error) => {
        console.error("Nie udało się usunąć powiadomień:", error);
      },
    });

  useEffect(() => {
    if (notifications.length > 0) {
      const unread = notifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(0);
    }
  }, [notifications]);

  return (
    <DropdownMenu
      onOpenChange={(isOpen) => {
        if (!isOpen && unreadCount > 0) {
          setUnreadCount(0);
          markAsReadMutation();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2 rounded-full">
          <Bell className="w-10 h-10" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-84">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Powiadomienia</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
            disabled={isClearing || notifications.length === 0}
            onClick={(e) => {
              e.preventDefault();
              clearNotificationsMutation();
            }}
            title="Wyczyść wszystkie powiadomienia"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-center text-gray-500">
              Ładowanie powiadomień...
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-center text-red-500">
              Nie udało się załadować powiadomień.
            </div>
          ) : notifications.length === 0 ? (
            <DropdownMenuItem className="text-gray-500 cursor-default">
              Brak nowych powiadomień
            </DropdownMenuItem>
          ) : (
            [...notifications]
              .sort((a, b) => Number(a.is_read) - Number(b.is_read))
              .map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1"
                >
                  <span
                    className={`text-sm ${notif.is_read ? "text-gray-500" : "text-black font-semibold"}`}
                  >
                    {notif.message}
                  </span>
                </DropdownMenuItem>
              ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
