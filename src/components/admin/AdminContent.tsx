import React, { lazy, Suspense } from 'react';
import { LayoutDashboard, Box, Folder, Users, MessageSquare, Settings, LogOut, Package } from 'lucide-react';
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAdmin } from '../../contexts/AdminContext';

// Import actual Admin sub-components (Lazy Loaded)
const AdminSlides = lazy(() => import('./AdminSlides'));
const AdminServices = lazy(() => import('./AdminServices'));
const AdminProducts = lazy(() => import('./AdminProducts'));
const AdminProjects = lazy(() => import('./AdminProjects'));
const AdminTeam = lazy(() => import('./AdminTeam'));
const AdminTestimonials = lazy(() => import('./AdminTestimonials'));
const AdminPartners = lazy(() => import('./AdminPartners'));
const AdminMessages = lazy(() => import('./AdminMessages'));
const AdminSettings = lazy(() => import('./AdminSettings'));

// Dummy AdminDashboard (if a more complex one is desired, it should be in its own file)
const AdminDashboard = () => (
  <div className="p-10 text-center text-slate-400 border rounded-xl bg-white">
    <h3 className="text-xl font-bold text-slate-800 mb-4">Welcome to Admin Dashboard</h3>
    <p>Use the sidebar to navigate and manage your website content.</p>
  </div>
);

const AdminLoader = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
    </div>
  );

interface AdminContentProps {}

export const AdminContent: React.FC<AdminContentProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdminMode, handleLogout } = useAdmin(); // Destructure handleLogout

  // Redirect if not in admin mode
  if (!isAdminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Unauthorized Access</h1>
          <p className="text-slate-600">Please log in to access the admin panel.</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700">Go to Home</button>
        </div>
      </div>
    );
  }


  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard /> },
    { name: 'Slides', path: '/admin/slides', icon: <Box /> },
    { name: 'Services', path: '/admin/services', icon: <Folder /> },
    { name: 'Products', path: '/admin/products', icon: <Package /> },
    { name: 'Projects', path: '/admin/projects', icon: <Folder /> },
    { name: 'Team', path: '/admin/team', icon: <Users /> },
    { name: 'Testimonials', path: '/admin/testimonials', icon: <MessageSquare /> },
    { name: 'Partners', path: '/admin/partners', icon: <Users /> },
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings /> },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fade-in">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">TECL <span className="text-orange-500">Admin</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <ul>
            {adminNavItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors duration-200",
                    currentPath.startsWith(item.path) && item.path !== '/admin'
                      ? 'bg-orange-600 text-white'
                      : currentPath === '/admin' && item.path === '/admin'
                        ? 'bg-orange-600 text-white'
                        : 'hover:bg-slate-800'
                  )}
                >
                  {item.icon && React.cloneElement(item.icon, { className: 'mr-3 h-5 w-5' })}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold capitalize text-slate-900">{currentPath.split('/').pop() || 'dashboard'}</h2>
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">A</div>
        </header>
        
        <Suspense fallback={<AdminLoader />}>
            <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="slides" element={<AdminSlides />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<div className="p-10 text-center text-slate-400 border rounded-xl bg-white">Admin Module Not Found</div>} />
            </Routes>
        </Suspense>
      </main>
    </div>
  );
};