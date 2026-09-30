import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileCheck, 
  ShieldAlert, 
  FileText,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const links = [
    // Admin Links
    ...(role === 'ADMIN' ? [
      { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      { to: '/admin/exams', label: 'Manage Exams & Rubrics', icon: BookOpen },
      { to: '/examiner/dashboard', label: 'Examiner Portal', icon: FileCheck },
      { to: '/moderator/dashboard', label: 'Moderation Queue', icon: ShieldAlert },
    ] : []),

    // Examiner Links
    ...(role === 'EXAMINER' ? [
      { to: '/examiner/dashboard', label: 'Evaluation Workspace', icon: FileCheck },
      { to: '/admin/exams', label: 'Available Exams', icon: BookOpen },
    ] : []),

    // Moderator Links
    ...(role === 'MODERATOR' ? [
      { to: '/moderator/dashboard', label: 'Flagged Moderations', icon: ShieldAlert },
      { to: '/admin/dashboard', label: 'Quality Analytics', icon: LayoutDashboard },
    ] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation Menu
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Core Principle Callout */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-blue-400 font-bold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Core Principle</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-300">
          <strong>AI Assists. Examiner Decides.</strong> University marks remain strictly under examiner control.
        </p>
      </div>
    </aside>
  );
}
