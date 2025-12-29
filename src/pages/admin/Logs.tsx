import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function LogsPage() {
    const { getLogs } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getLogs();
            setLogs(data);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">System Logs</h1>

            <Card className="border-neutral-200 shadow-sm">
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px] w-full p-4">
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-0">
                                {logs.map((log, i) => (
                                    <div
                                        key={log.id}
                                        className={`flex gap-4 py-3 px-2 text-sm border-b border-neutral-100 last:border-0 ${i % 2 === 0 ? 'bg-neutral-50/50' : ''}`}
                                    >
                                        <div className="w-40 shrink-0 text-neutral-400 font-mono text-xs pt-0.5">
                                            {format(new Date(log.timestamp), 'MMM d HH:mm:ss')}
                                        </div>
                                        <div className="w-48 shrink-0 font-semibold text-neutral-700">
                                            {log.action}
                                        </div>
                                        <div className="text-neutral-600 font-mono text-xs pt-0.5">
                                            {log.details || '-'}
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <p className="text-center text-neutral-500 py-8">No logs found.</p>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
