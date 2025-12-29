import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Users,
    KeyRound,
    FileText,
    LogOut,
    Shield,
    LayoutDashboard,
    Activity,
    Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function AdminLayout() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) return null;

    const sidebarLinks = [
        { icon: Activity, label: 'Overview', path: '/admin/overview' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: KeyRound, label: 'Password Reset', path: '/admin/reset' },
        { icon: Radio, label: 'Broadcasts', path: '/admin/broadcast' },
        { icon: FileText, label: 'System Audit', path: '/admin/logs' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex font-mono text-slate-300 selection:bg-indigo-500/30">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 text-white font-bold text-lg tracking-wider uppercase">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded">
                            <img src="/unitylogo.jpg" alt="Unity" className="w-full h-full object-contain" />
                        </div>
                        Command
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-mono text-emerald-500">SYSTEM ONLINE</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link to={link.path} key={link.path}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-10 mb-1 font-medium tracking-wide border border-transparent",
                                        isActive
                                            ? "bg-slate-800 text-white border-slate-700 shadow-sm"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    )}
                                >
                                    <Icon className="w-4 h-4 mr-3" />
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="px-2 py-3 mb-2 rounded border border-slate-800 bg-slate-950/50">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Authenticated As</p>
                        <p className="text-xs font-mono text-slate-300 truncate">{user?.email}</p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 hover:border-red-900/50"
                        onClick={() => {
                            logout();
                            navigate('/auth/login');
                        }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Terminating Session
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
