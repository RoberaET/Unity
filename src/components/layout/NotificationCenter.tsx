import { Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
    const { getNotifications } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeenCount, setLastSeenCount] = useState<number>(() => {
        const stored = localStorage.getItem('lastSeenNotificationCount');
        return stored ? parseInt(stored, 10) : 0;
    });

    // Poll for notifications
    useEffect(() => {
        const fetch = async () => {
            const data = await getNotifications();
            setNotifications(data);
        };

        fetch();
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, [getNotifications]);

    // Mark notifications as seen when popover opens
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && notifications.length > 0) {
            setLastSeenCount(notifications.length);
            localStorage.setItem('lastSeenNotificationCount', notifications.length.toString());
        }
    };

    // Only show badge for new/unseen notifications
    const unreadCount = Math.max(0, notifications.length - lastSeenCount);

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        Updates and alerts from your partner and system.
                    </p>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((note) => (
                                <div key={note.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-0.5 h-2 w-2 rounded-full shrink-0",
                                            note.severity === 'critical' ? 'bg-destructive' :
                                                note.severity === 'warning' ? 'bg-warning' : 'bg-blue-500'
                                        )} />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{note.title}</p>
                                            <p className="text-sm text-muted-foreground text-xs">{note.body}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
