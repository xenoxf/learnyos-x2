'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User, Menu, X } from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 z-50">
              <AppSidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-slate-700/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shadow-lg">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2 sm:gap-4 flex-1 lg:flex-none">
              <h2 className="text-lg sm:text-xl font-bold text-white hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-lg p-0"
                  >
                    <User className="w-5 h-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-slate-800 border border-slate-700/50">
                  <DropdownMenuItem className="text-slate-200 cursor-pointer hover:bg-slate-700/50 rounded-md text-xs sm:text-sm">
                    <User className="w-4 h-4 mr-2 text-cyan-400" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="text-slate-200 cursor-pointer hover:bg-slate-700/50 rounded-md text-xs sm:text-sm"
                  >
                    <Settings className="w-4 h-4 mr-2 text-amber-400" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-200 cursor-pointer hover:bg-slate-700/50 rounded-md text-xs sm:text-sm">
                    <LogOut className="w-4 h-4 mr-2 text-red-400" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <DashboardLayout>{children}</DashboardLayout>
            </div>
          </main>
        </div>

        {/* Settings Modal */}
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
