import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../../store/authStore';
import { notificationAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  LayoutDashboard,
  GitBranch,
  Play,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  Zap,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Plus,
  ExternalLink,
  Search,
} from 'lucide-react';
import styles from './AppShell.module.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflows/builder', label: 'AI Builder', icon: Sparkles, badge: 'AI' },
  { href: '/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/executions', label: 'Executions', icon: Play },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  }, [router.pathname]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.list({ limit: 10 });
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const socket = getSocket();
      if (socket) {
        socket.emit('join:user', user.id || user._id);
        const handleNewNotification = (notif) => {
          setNotifications((prev) => [notif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        };
        socket.on('notification:new', handleNewNotification);
        return () => {
          socket.off('notification:new', handleNewNotification);
        };
      }
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={styles.shell}>
      {/* ─── Sidebar ──────────────────────────────────── */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div className={styles.logoIcon}>
              <Zap size={20} />
            </div>
            {!sidebarCollapsed && (
              <span className={styles.logoText}>
                Agentflow<span className={styles.logoAccent}>AI</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {!sidebarCollapsed && <div className={styles.navSectionLabel}>Core Platform</div>}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              router.pathname === item.href ||
              (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}>
                <Icon size={18} color={isActive ? 'var(--primary-400)' : 'inherit'} />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.25)',
                      color: 'var(--primary-400)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <div className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Button inside sidebar */}
        {!sidebarCollapsed && (
          <div style={{ padding: '0 12px 14px 12px' }}>
            <Link
              href="/workflows/builder"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.15)',
              }}
            >
              <Sparkles size={14} color="var(--primary-400)" />
              New AI Automation
            </Link>
          </div>
        )}

        {/* Bottom section */}
        <div className={styles.sidebarBottom}>
          {!sidebarCollapsed && user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name ? user.name.substring(0, 2).toUpperCase() : 'OP'}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name || 'Operator'}</span>
                <span className={styles.userRole}>{user.role || 'Operator'}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ─── Mobile overlay ───────────────────────────── */}
      {mobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ─── Main Content ─────────────────────────────── */}
      <div className={`${styles.main} ${sidebarCollapsed ? styles.mainExpanded : ''}`}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>

            {/* Live Agent System Status Pill */}
            <div className={styles.statusPill}>
              <span className={styles.statusDot} />
              <span>5 Agents Active (Autonomous Mode)</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Quick AI Builder trigger */}
            <Link
              href="/workflows/builder"
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
            >
              <Sparkles size={14} />
              <span>Prompt Builder</span>
            </Link>

            {/* Notifications Button */}
            <button
              className={styles.notificationBtn}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) fetchNotifications();
              }}
              title="Execution Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--danger-500, #ef4444)',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    minWidth: '16px',
                    textAlign: 'center',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User chip */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px 4px 6px',
                  borderRadius: '999px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {user.name ? user.name.substring(0, 1).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name || 'Operator'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Notification Drawer */}
        {notificationsOpen && (
          <div
            className={styles.notificationDrawer}
            style={{
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="var(--primary-400)" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Audit Notifications {unreadCount > 0 && `(${unreadCount})`}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--primary-400)',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '380px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem auto', color: 'var(--text-muted)' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    All caught up! No unread notifications.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: n.read ? 'var(--bg-tertiary)' : 'rgba(99, 102, 241, 0.08)',
                      border: `1px solid ${n.read ? 'var(--border-primary)' : 'rgba(99, 102, 241, 0.3)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', lineHeight: '1.45' }}>
                      {n.message}
                    </div>
                    {n.executionId && (
                      <Link
                        href={`/executions/${n.executionId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '0.5rem',
                          fontSize: '0.725rem',
                          color: 'var(--primary-400)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Inspect Execution <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
