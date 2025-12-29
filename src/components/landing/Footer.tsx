import { Heart } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="border-t border-border bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <Heart className="h-4 w-4 text-primary-foreground fill-current" />
                            </div>
                            <span className="font-bold text-xl">Unity</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Master your finances together. Secure, private, and simple.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Features</li>
                            <li>Pricing</li>
                            <li>Security</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>About</li>
                            <li>Blog</li>
                            <li>Careers</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Privacy</li>
                            <li>Terms</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    © 2026 Unity. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
