import { Outlet } from 'react-router-dom';
import { NavigationHeader } from './NavigationHeader';
import { Footer } from './Footer';
import { BreadcrumbNav } from './BreadcrumbNav';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <BreadcrumbNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}