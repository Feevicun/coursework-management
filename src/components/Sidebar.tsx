import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Zap,
  LogOut,
  ChevronRight,
  Book,
  Users,
  GraduationCap,
  FolderOpen,
  UserCircle, // Додано для іконки викладачів
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';

// Імпортуємо типи
import type { User, MenuItemType } from '../types/types';

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }

        const res = await fetch('/api/current-user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Помилка отримання користувача', error);
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && user?.email) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        });
      }

      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Помилка при виході:', error);
    }
  };

  const userName = user
    ? (() => {
        if (user.firstName && user.lastName) {
          return `${user.firstName} ${user.lastName}`;
        }
        if (user.name) {
          return user.name;
        }
        return t('sidebar.user');
      })()
    : t('sidebar.user');

  const userRole = user?.role ?? '';

  // Студентське меню
  const studentMenuItems: MenuItemType[] = [
    { title: t('sidebar.dashboard'), href: '/dashboard', icon: Home, badge: null },
    { title: t('sidebar.projects'), href: '/tracker', icon: FileText },
    { title: t('sidebar.tasks'), href: '/chat', icon: MessageSquare },
    { title: t('sidebar.calendar'), href: '/calendar', icon: Calendar, badge: null }
  ];

  // Викладацьке меню
  const teacherMenuItems: MenuItemType[] = [
    { title: t('sidebar.teacherDashboard'), href: '/teacherdashboard', icon: Home },
    { title: t('sidebar.gradingWorks'), href: '/teacher/grades', icon: FileText },
    { title: t('sidebar.studentApplications'), href: '/teacher/students', icon: Users },
    { title: t('sidebar.messages'), href: '/chat', icon: MessageSquare },
    { title: t('sidebar.calendar'), href: '/calendar', icon: Calendar }
  ];

  // Спільні інструменти для всіх
  const commonToolsItems: MenuItemType[] = [
    { title: t('sidebar.workspace'), href: '/notespage', icon: FolderOpen, badge: null },
    { title: t('sidebar.aiAssistant'), href: '/ai-assistant', icon: Zap, badge: 'BETA' },
    { title: t('sidebar.analytics'), href: '/analytics', icon: TrendingUp, badge: null },
    { title: t('sidebar.resources'), href: '/resources', icon: Book, badge: null }
  ];

// Додаткові інструменти тільки для студентів
const studentToolsItems: MenuItemType[] = [
  { title: t('sidebar.teachers'), href: '/teachers', icon: UserCircle, badge: null },
];

  // Формуємо повний список інструментів в залежності від ролі
  const getToolsItems = () => {
    if (userRole === 'student') {
      return [...commonToolsItems, ...studentToolsItems];
    }
    return commonToolsItems;
  };

  const toolsItems = getToolsItems();

  // Вибір відповідного меню в залежності від ролі
  const mainMenuItems = userRole === 'teacher' ? teacherMenuItems : studentMenuItems;

  const MenuItem = ({ item, isActive }: { item: MenuItemType; isActive: boolean }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-accent/50 hover:text-accent-foreground',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <Badge
            variant={item.badge === 'BETA' ? 'default' : 'secondary'}
            className="h-5 px-2 text-xs"
          >
            {item.badge}
          </Badge>
        )}
        {isActive && (
          <ChevronRight className="h-3 w-3 text-primary-foreground/70" />
        )}
      </Link>
    );
  };

  return (
    <div className="w-72 h-screen bg-[--sidebar] text-[--sidebar-foreground] border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ThesisHub</h1>
            <p className="text-xs text-muted-foreground">
              {userRole === 'teacher' ? t('sidebar.teacherPlatform') : t('sidebar.researchPlatform')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation з ScrollArea */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-8">
          {/* Основне меню */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-3">
              {userRole === 'teacher' ? t('sidebar.teacherPanel') : t('sidebar.sectionMain')}
            </h2>
            <nav className="space-y-1">
              {mainMenuItems.map((item) => (
                <MenuItem
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </nav>
          </div>

          <Separator />

          {/* Інструменти (спільні для всіх + додаткові для студентів) */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-3">
              {t('sidebar.sectionTools')}
            </h2>
            <nav className="space-y-1">
              {toolsItems.map((item) => (
                <MenuItem
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Profile Section */}
      <div className="p-4 border-t flex-shrink-0">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userName
                ? userName
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0].toUpperCase())
                    .join('')
                : t('sidebar.userInitial')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userRole === 'student'
                ? t('sidebar.student')
                : userRole === 'teacher'
                ? t('sidebar.teacher')
                : userRole || t('sidebar.user')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;