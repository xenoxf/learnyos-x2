"use client"
import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  CreditCard,
  NotebookPen,
  Languages,
  LogOut,
  Settings,
  X,
  Cpu,
  ChevronLeft
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { SettingsModal } from '@/components/SettingsModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Junior IA", url: "/chat", icon: MessageSquare },
  { title: "Quiz", url: "/quiz", icon: Brain },
  { title: "Flashcards", url: "/flashcards", icon: CreditCard },
  { title: "Notas", url: "/notes", icon: NotebookPen },
  { title: "Traductor", url: "/translator", icon: Languages },
  { title: "AI Implementation", url: "/ai-implementation", icon: Cpu },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function AppSidebar({ collapsed = false, onToggle, onNavigate }: AppSidebarProps) {
  const navigate = useRouter();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(collapsed);

  const handleLogout = () => {
    apiService.logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    navigate.push('/auth');
  };

  const handleNavigation = (url: string) => {
    setSidebarClosed(true);
    navigate.push(url);
    onNavigate?.();
  };

  const toggleSidebar = () => {
    setSidebarClosed(!sidebarClosed);
    onToggle?.();
  };

  const user = typeof window !== 'undefined' ? (
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  ) : null;

  // Detectar tema oscuro
  const isDark = typeof window !== 'undefined' && 
    (document.documentElement.classList.contains('dark') || 
     window.matchMedia('(prefers-color-scheme: dark)').matches);

  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const secondaryText = isDark ? '#d1d5db' : '#4b5563';
  const hoverBg = isDark ? '#374151' : '#f3f4f6';
  const activeBg = isDark ? '#3b82f6' : '#dbeafe';
  const activeText = isDark ? '#60a5fa' : '#1e40af';

  return (
    <aside 
      className="h-full flex flex-col transition-all duration-300 ease-out"
      style={{
        backgroundColor: bgColor,
        borderRight: `1px solid ${borderColor}`,
        width: sidebarClosed ? '80px' : '280px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          padding: '20px', 
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: bgColor
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 'bold', 
              flexShrink: 0,
              fontSize: '18px',
              boxShadow: isDark ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(59, 130, 246, 0.2)'
            }}
          >
            L
          </div>
          {!sidebarClosed && (
            <span style={{ 
              fontWeight: 'bold', 
              whiteSpace: 'nowrap',
              color: textColor,
              fontSize: '16px'
            }}>
              LearnYos
            </span>
          )}
        </div>
        {!sidebarClosed && (
          <button
            onClick={toggleSidebar}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: secondaryText,
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-opacity-50"
            aria-label="Contraer sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
        <div>
          {!sidebarClosed && (
            <div 
              style={{ 
                fontSize: '11px', 
                fontWeight: 'bold', 
                color: secondaryText,
                padding: '12px 8px 8px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              HERRAMIENTAS
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => handleNavigation(item.url)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarClosed ? 'center' : 'flex-start',
                  gap: '12px',
                  padding: sidebarClosed ? '12px' : '11px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                  color: secondaryText,
                  textDecoration: 'none',
                  marginBottom: '6px',
                  fontSize: '14px'
                }}
                className="hover:bg-opacity-70 group"
                title={item.title}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = hoverBg;
                  e.currentTarget.style.color = activeText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = secondaryText;
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!sidebarClosed && (
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    transition: 'opacity 0.2s ease'
                  }}>
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - User Info & Actions */}
      <div 
        style={{ 
          borderTop: `1px solid ${borderColor}`, 
          padding: '15px', 
          backgroundColor: bgColor
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '15px', 
            overflow: 'hidden',
            justifyContent: sidebarClosed ? 'center' : 'flex-start'
          }}
        >
          <div 
            style={{ 
              width: '36px', 
              height: '36px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 'bold', 
              flexShrink: 0,
              fontSize: '14px'
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!sidebarClosed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div 
                style={{ 
                  fontWeight: '600', 
                  fontSize: '13px',
                  color: textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.name || 'Usuario'}
              </div>
              <div 
                style={{ 
                  fontSize: '11px', 
                  color: secondaryText,
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.email || 'email@example.com'}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{ 
              flex: 1, 
              padding: '8px', 
              borderRadius: '6px', 
              border: `1px solid ${borderColor}`, 
              backgroundColor: hoverBg,
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              fontSize: '12px',
              color: secondaryText,
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Configuración"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = activeBg;
              e.currentTarget.style.color = activeText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = hoverBg;
              e.currentTarget.style.color = secondaryText;
            }}
          >
            <Settings size={14} />
            {!sidebarClosed && <span>Config</span>}
          </button>
          <button
            onClick={handleLogout}
            style={{ 
              flex: 1, 
              padding: '8px', 
              borderRadius: '6px', 
              border: `1px solid ${borderColor}`, 
              backgroundColor: hoverBg,
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              fontSize: '12px',
              color: secondaryText,
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Cerrar sesión"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.color = isDark ? '#fca5a5' : '#dc2626';
              e.currentTarget.style.borderColor = isDark ? '#7f1d1d' : '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = hoverBg;
              e.currentTarget.style.color = secondaryText;
              e.currentTarget.style.borderColor = borderColor;
            }}
          >
            <LogOut size={14} />
            {!sidebarClosed && <span>Salir</span>}
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </aside>
  );
}
