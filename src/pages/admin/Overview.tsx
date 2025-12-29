import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, KeyRound, Activity, ShieldCheck, ServerCrash } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { name: 'Mon', active: 10 },
    { name: 'Tue', active: 15 },
    { name: 'Wed', active: 12 },
    { name: 'Thu', active: 20 },
    { name: 'Fri', active: 25 },
    { name: 'Sat', active: 22 },
    { name: 'Sun', active: 30 },
];

export default function OverviewPage() {
    const { getUsers, getActiveCodes } = useAuth();
    const [stats, setStats] = useState({ users: 0, codes: 0 });

    useEffect(() => {
        const load = async () => {
            const users = await getUsers();
            const codes = await getActiveCodes();
            setStats({ users: users.length, codes: codes.length });
        };
        load();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Overview</h1>
                <p className="text-slate-400">Real-time metrics and system status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-slate-500 mt-1">+2 from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Reset Codes</CardTitle>
                        <KeyRound className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.codes}</div>
                        <p className="text-xs text-slate-500 mt-1">Expires in 10m</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">System Status</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">OPERATIONAL</div>
                        <p className="text-xs text-slate-500 mt-1">Uptime: 99.9%</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Security Level</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">HIGH</div>
                        <p className="text-xs text-slate-500 mt-1">0 threats detected</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Traffic Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 rounded bg-slate-800/50 border border-slate-700/50">
                                <ServerCrash className="w-5 h-5 text-red-500 mt-1" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-200">Database Latency Spike</h4>
                                    <p className="text-xs text-slate-400">Detected 2 hours ago. Resolved automatically.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded bg-slate-800/50 border border-slate-700/50">
                                <ShieldCheck className="w-5 h-5 text-blue-500 mt-1" />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-200">System Patch Applied</h4>
                                    <p className="text-xs text-slate-400">Security patch v2.4.1 applied successfully.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
