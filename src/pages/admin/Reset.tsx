import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ResetPage() {
    const { generateResetCode, getActiveCodes } = useAuth();
    const [email, setEmail] = useState('');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeCodes, setActiveCodes] = useState<any[]>([]);

    const loadCodes = async () => {
        const codes = await getActiveCodes();
        setActiveCodes(codes);
    };

    useEffect(() => {
        loadCodes();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGeneratedCode(null);
        try {
            const code = await generateResetCode(email);
            setGeneratedCode(code);
            toast.success("Reset code generated");
            loadCodes();
        } catch (error: any) {
            toast.error(error.message || "Failed to generate code");
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            toast.success("Code copied to clipboard");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Password Reset Tool</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generator */}
                <Card className="border-neutral-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Generate New Code</CardTitle>
                        <CardDescription>Create a temporary 6-digit code for a user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleGenerate} className="flex gap-2">
                            <Input
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                type="email"
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                            </Button>
                        </form>

                        {generatedCode && (
                            <div className="mt-6 p-6 bg-slate-900 rounded-xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-semibold">Temporary Code</p>
                                <div className="text-5xl font-mono font-bold text-white tracking-widest mb-4">
                                    {generatedCode}
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2"
                                    onClick={copyCode}
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy for Telegram
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Active Codes */}
                <Card className="border-neutral-200 shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Active Codes</CardTitle>
                            <Button variant="ghost" size="icon" onClick={loadCodes} title="Refresh">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeCodes.length === 0 ? (
                            <div className="text-center py-8 text-neutral-400">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No active reset codes</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead className="text-right">Expires</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeCodes.map((code) => (
                                        <TableRow key={code.id}>
                                            <TableCell className="font-medium">{code.email}</TableCell>
                                            <TableCell className="font-mono text-slate-600">{code.code}</TableCell>
                                            <TableCell className="text-right text-xs text-neutral-500">
                                                {formatDistanceToNow(new Date(code.expiresAt), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
