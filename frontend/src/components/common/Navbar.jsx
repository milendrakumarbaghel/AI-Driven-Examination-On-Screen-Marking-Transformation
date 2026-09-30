import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, LogOut, UserCircle2, BrainCircuit } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Brand & Hackathon Indicator */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">E-Valuate AI</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Hackathon 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">AI-Assisted University On-Screen Marking Transformation</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'EXAMINER' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <UserCircle2 className="w-6 h-6 text-slate-600" />
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
