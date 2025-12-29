import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Radio, Loader2, AlertTriangle, Info, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function BroadcastPage() {
    const { createNotification, getNotifications } = useAuth();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const loadHistory = async () => {
        const data = await getNotifications();
        setHistory(data);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createNotification(title, body, severity);
            toast.success("Broadcast sent to all users");
            setTitle('');
            setBody('');
            loadHistory();
        } catch (error) {
            toast.error("Failed to send broadcast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Broadcast</h1>
                <p className="text-slate-400">Send alerts and notifications to all active users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compose */}
                <Card className="bg-slate-900 border-slate-800 text-white shadow-lg">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-indigo-500 animate-pulse" />
                            <CardTitle>Compose Message</CardTitle>
                        </div>
                        <CardDescription className="text-slate-400">This message will appear on user dashboards immediately.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSend} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Title</label>
                                <Input
                                    className="bg-slate-950 border-slate-700 text-white focus:border-indigo-500"
                                    placeholder="e.g. Scheduled Maintenance"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Severity</label>
                                <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                        <SelectItem value="info">Info (Blue)</SelectItem>
                                        <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                        <SelectItem value="critical">Critical (Red)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Message Body</label>
                                <Textarea
                                    className="bg-slate-950 border-slate-700 text-white focus:border-indigo-500 min-h-[120px]"
                                    placeholder="Enter your message details..."
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
                                Broadcast to All Users
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History */}
                <Card className="bg-slate-900 border-slate-800 text-white shadow-lg h-fit">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle>Broadcast History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 max-h-[500px] overflow-y-auto">
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No matching records found</p>
                            ) : history.map((item) => (
                                <div key={item.id} className="p-4 rounded-lg border border-slate-700 bg-slate-950/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                            {item.severity === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            {item.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                            {item.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                                            {item.title}
                                        </h4>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {format(new Date(item.createdAt), 'MMM d, HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{item.body}</p>
                                    <div className="mt-2 text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                                        Sent by Admin
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
