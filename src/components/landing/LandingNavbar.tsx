import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export const LandingNavbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-600/20 overflow-hidden p-1">
                        <img src="/unitylogo.jpg" alt="Unity Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-slate-900">Unity</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/auth/login">
                        <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium text-base">Log in</Button>
                    </Link>
                    <Link to="/auth/register">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-11 font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">Sign up</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
