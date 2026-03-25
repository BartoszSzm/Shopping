"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  heading: string;
  text: string;
}

interface NotificationBellProps {
  notifications: Notification[];
}

export default function NotificationBell({
  notifications,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(notifications.length);

  return (
    <DropdownMenu
      onOpenChange={(isOpen) => {
        if (isOpen) setUnreadCount(0);
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
        <DropdownMenuLabel>Powiadomienia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-gray-500 cursor-default">
            Brak nowych powiadomień
          </DropdownMenuItem>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem key={notif.id}>
              <span className="font-bold">{notif.heading}</span>
              {notif.text}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
