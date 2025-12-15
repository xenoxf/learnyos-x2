"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Brain, 
  CreditCard, 
  NotebookPen, 
  Languages, 
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import SettingsModal from '@/components/SettingsModal';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    title: "Junior IA",
    url: "/chat",
    icon: MessageSquare,
    gradient: "from-purple-500 to-violet-500"
  },
  {
    title: "Quiz",
    url: "/quiz",
    icon: Brain,
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    title: "Flashcards",
    url: "/flashcards",
    icon: CreditCard,
    gradient: "from-orange-500 to-red-500"
  },
  {
    title: "Notas",
    url: "/notes",
    icon: NotebookPen,
    gradient: "from-pink-500 to-rose-500"
  },
  {
    title: "Traductor",
    url: "/translator",
    icon: Languages,
    gradient: "from-indigo-500 to-purple-500"
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onRouter?: () => void;
}

export function AppSidebar({ collapsed = false, onToggle, onRouter }: AppSidebarProps) {
  const router = useRouter();
  const pathName = usePathname();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    apiService.logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    router.push('/auth');
  };

  const handleNavigation = (url: string) => {
    router.push(url);
    onRouter?.();
  };

  const NavButton = ({ item, isActive }: { item: typeof menuItems[0], isActive: boolean }) => {
    const content = (
      <button
        onClick={() => handleNavigation(item.url)}
        className={cn(
          "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-300 text-sm font-medium group",
          isActive 
            ? "bg-gradient-to-r text-white shadow-lg" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50",
          isActive && item.gradient,
          collapsed && "justify-center px-2"
        )}
      >
        <div className={cn(
          "p-1.5 rounded-lg transition-all duration-300",
          isActive 
            ? "bg-white/20" 
            : `bg-gradient-to-br ${item.gradient} bg-opacity-10`,
          !isActive && "group-hover:scale-110"
        )}>
          <item.icon className={cn(
            "w-4 h-4 flex-shrink-0",
            isActive ? "text-white" : "text-white"
          )} />
        </div>
        {!collapsed && <span>{item.title}</span>}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover border-border">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "h-full flex flex-col transition-all duration-300",
          "bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50",
          collapsed ? "w-14" : "w-52"
        )}
      >
        {/* Header */}
        <div 
          className={cn(
            "p-4 border-b border-sidebar-border/50 cursor-pointer hover:bg-sidebar-accent/30 transition-all duration-300 flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}
          onClick={onToggle}
        >
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse-soft">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                LearnyOS
              </span>
            )}
          </div>
          {!collapsed && (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors" />
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1.5">
            {menuItems.map((item, index) => {
              const isActive = pathName === item.url;
              return (
                <div 
                  key={item.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <NavButton item={item} isActive={isActive} />
                </div>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className={cn(
          "p-3 border-t border-sidebar-border/50 space-y-1.5",
          collapsed && "p-2"
        )}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center px-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Configuración</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Cerrar sesión</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5 mr-2" />
                <span>Configuración</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Cerrar sesión</span>
              </Button>
            </>
          )}
        </div>
        
        <SettingsModal 
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </aside>
    </TooltipProvider>
  );
}
