import { Outlet, useLocation } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';
import { Header } from './Header';

export function AppLayout() {
  const location = useLocation();

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/wallets') return 'Wallets';
    if (path === '/transactions') return 'Transactions';
    if (path === '/debts') return 'Debts & Lending';
    if (path === '/goals') return 'Goals';
    if (path === '/partner') return 'Partner';
    if (path === '/settings') return 'Settings';
    return 'Unity Finance';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-[17rem]">
        <Header title={getPageTitle()} />

        <main className="pb-20 lg:pb-8">
          <div className="container px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
