import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DbUser } from '@/lib/mock-backend';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Ban, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function UsersPage() {
    const { getUsers, deleteUser } = useAuth();
    const [users, setUsers] = useState<DbUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) return;

        try {
            await deleteUser(id);
            toast.success("User deleted");
            loadUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const togglePassword = (id: string) => {
        setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User Directory</h1>
                    <p className="text-slate-400">Manage user access and credentials.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1.5 text-base border-indigo-500/50 text-indigo-400 bg-indigo-500/10">
                    {users.length} Active Records
                </Badge>
            </div>

            <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-950 border-b border-slate-800">
                        <TableRow className="border-slate-800 hover:bg-slate-950">
                            <TableHead className="text-slate-400">User Identity</TableHead>
                            <TableHead className="text-slate-400">Stored Credentials</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Registration</TableHead>
                            <TableHead className="text-right text-slate-400">Control</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell>
                                    <div>
                                        <p className="font-bold text-slate-200">{user.name}</p>
                                        <p className="text-sm text-indigo-400 font-mono">{user.email}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="font-mono text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-500 w-[140px] truncate">
                                            {showPassword[user.id] ? (user.password || '••••••••') : '••••••••••••'}
                                        </div>
                                        {user.role !== 'ADMIN' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-500 hover:text-indigo-400"
                                                onClick={() => togglePassword(user.id)}
                                            >
                                                {showPassword[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                                        className={user.role === 'ADMIN' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 text-slate-300'}
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 font-mono text-xs">
                                    {format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm')}
                                </TableCell>
                                <TableCell className="text-right">
                                    {user.role !== 'ADMIN' && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                                onClick={() => toast.info("Disable feature simulates account lock")}
                                            >
                                                <Ban className="w-3.5 h-3.5 mr-1" />
                                                Lock
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-8 bg-red-950/20 text-red-500 hover:bg-red-900/50 border border-red-900/50"
                                                onClick={() => handleDelete(user.id, user.email)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                    {user.role === 'ADMIN' && (
                                        <span className="text-xs text-slate-600 italic mr-2">Protected</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
