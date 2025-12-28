import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Settings,
  Plus,
  Menu,
  X,
  User,
  Home,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Zap,
  LogOut,
  Book,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type ThemeType = 'light' | 'dark' | 'rose' | 'mint';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = useState(false);
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Функція для оновлення даних користувача
  const updateUserData = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('🔄 Header: Updating user data from localStorage:', user);
        
        if (user.firstName) {
          setFirstName(user.firstName);
        } else if (user.name) {
          const [firstName] = user.name.split(' ');
          setFirstName(firstName || '');
          localStorage.setItem(
            'currentUser',
            JSON.stringify({ ...user, firstName })
          );
        } else {
          setFirstName('');
        }

        if (user.role) {
          setUserRole(user.role);
        }
      } catch (error) {
        console.error('❌ Header: Error parsing user data:', error);
        setFirstName('');
      }
    } else {
      console.log('⚠️ Header: No user data found in localStorage');
      setFirstName('');
    }
    
    const storedStatus = localStorage.getItem('userStatus');
    setIsOnline(storedStatus === null ? true : storedStatus === 'online');
  };

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Header: Storage change detected');
      updateUserData();
    };

    const handleUserDataUpdated = (event: CustomEvent) => {
      console.log('🔄 Header: User data updated event received:', event.detail);
      updateUserData();
    };

    updateUserData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleUserDataUpdated as EventListener);

    const interval = setInterval(() => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          if (user.name && !firstName) {
            console.log('🔄 Header: Interval update - setting firstName');
            updateUserData();
          }
        } catch (error) {
          console.error('Error in interval check:', error);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdated as EventListener);
      clearInterval(interval);
    };
  }, [firstName]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ua' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    localStorage.setItem('userStatus', newStatus ? 'online' : 'offline');
  };

  const handleCreateNote = () => {
    setIsQuickNoteOpen(true);
    // Очищаємо поля при відкритті
    setQuickNoteTitle('');
    setQuickNoteContent('');
  };

  const handleSaveQuickNote = async () => {
    if (!quickNoteTitle.trim() && !quickNoteContent.trim()) {
      // Якщо обидва поля пусті, закриваємо без збереження
      setIsQuickNoteOpen(false);
      return;
    }

    try {
      setIsSaving(true);
      
      const noteData = {
        title: quickNoteTitle.trim() || 'Нова нотатка',
        content: quickNoteContent,
        tags: [],
        category: "personal",
        isBookmarked: false,
        isPublic: false,
        backgroundColor: "#ffffff",
        textColor: "#000000",
        images: [],
      };

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });
      
      if (response.ok) {
        const savedNote = await response.json();
        console.log('✅ Quick note created:', savedNote);
        
        // Відправляємо подію для оновлення списку нотаток
        window.dispatchEvent(new CustomEvent('noteCreated', { detail: savedNote }));
        
        // Закриваємо модалку
        setIsQuickNoteOpen(false);
        setQuickNoteTitle('');
        setQuickNoteContent('');
        
        // Показуємо сповіщення про успіх
        // Можна додати toast notification тут
      } else {
        const errorText = await response.text();
        console.error("Failed to save quick note:", response.status, errorText);
        alert(`Помилка збереження: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving quick note:", error);
      alert('Помилка збереження нотатки');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveQuickNote();
    }
    if (e.key === 'Escape') {
      setIsQuickNoteOpen(false);
    }
  };

  // Фокус на заголовок при відкритті
  useEffect(() => {
    if (isQuickNoteOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isQuickNoteOpen]);

  const handleProfileClick = () => {
    setIsProfileAnimating(true);
    createParticleEffect();
    
    setTimeout(() => {
      if (userRole === 'teacher') {
        navigate('/teacher/info');
      } else {
        navigate('/profile');
      }
      
      setTimeout(() => setIsProfileAnimating(false), 500);
    }, 600);
  };

  const createParticleEffect = () => {
    const button = profileButtonRef.current;
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    for (let i = 0; i < 12; i++) {
      createParticle(centerX, centerY);
    }
  };

  const createParticle = (x: number, y: number) => {
    const particle = document.createElement('div');
    particle.className = 'absolute w-1 h-1 rounded-full bg-primary pointer-events-none';
    
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-cyan-500', 'bg-primary'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    particle.className = `absolute w-1 h-1 rounded-full ${randomColor} pointer-events-none`;
    
    const size = Math.random() * 3 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 60 + 40;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const animation = particle.animate(
      [
        {
          transform: `translate(${x}px, ${y}px) scale(1)`,
          opacity: 1
        },
        {
          transform: `translate(${x + vx}px, ${y + vy}px) scale(0)`,
          opacity: 0
        }
      ],
      {
        duration: Math.random() * 600 + 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    );

    animation.onfinish = () => {
      particle.remove();
    };
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    setIsClosing(false);
  };

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeMobileMenu();
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { title: t('sidebar.dashboard'), href: userRole === 'teacher' ? '/teacherdashboard' : '/dashboard', icon: Home },
      { title: t('sidebar.projects'), href: userRole === 'teacher' ? '/teacher/grades' : '/tracker', icon: FileText },
      { title: t('sidebar.tasks'), href: '/chat', icon: MessageSquare },
      { title: t('sidebar.calendar'), href: '/calendar', icon: Calendar },
      { title: t('sidebar.aiAssistant'), href: '/ai-assistant', icon: Zap, badge: 'BETA' },
      { title: t('sidebar.analytics'), href: '/analytics', icon: TrendingUp },
      { title: t('sidebar.resources'), href: '/resources', icon: Book }
    ];

    if (userRole === 'teacher') {
      baseItems.splice(2, 0, { 
        title: 'Мої студенти', 
        href: '/teacher/students', 
        icon: User 
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      <header className="h-16 bg-[--sidebar]/95 backdrop-blur border-b sticky top-0 z-50 text-[--sidebar-foreground]">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={openMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder={t('header.searchPlaceholder')}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 relative">
            {userRole === 'student' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-[110px] justify-center"
                onClick={handleCreateNote}
              >
                <Plus className="h-4 w-4" />
                {t('header.create')}
              </Button>
            )}

            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as ThemeType)}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder={t('header.theme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="rose">Rose</SelectItem>
                <SelectItem value="mint">Mint</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="rounded-full text-sm px-3 py-1"
            >
              {i18n.language === 'ua' ? 'UA' : 'EN'}
            </Button>

            <Button
              ref={profileButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleProfileClick}
              disabled={isProfileAnimating}
              className={cn(
                "rounded-full relative overflow-hidden transition-all duration-500",
                isProfileAnimating && [
                  "bg-primary text-primary-foreground",
                  "animate-pulse scale-110",
                  "shadow-lg shadow-primary/50"
                ]
              )}
            >
              <Settings className={cn(
                "h-4 w-4 transition-all duration-300",
                isProfileAnimating && [
                  "scale-110 rotate-180",
                  "text-primary-foreground"
                ]
              )} />
              
              {isProfileAnimating && (
                <>
                  <Sparkles className="absolute h-3 w-3 animate-spin text-primary-foreground/80" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/30 animate-ping" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-transparent opacity-50" />
                </>
              )}
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">
                  {firstName || t('header.user')}
                </p>
                <p
                  onClick={toggleOnlineStatus}
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {isOnline ? t('header.online') : t('header.offline')}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Модалка швидкої нотатки */}
      <Dialog open={isQuickNoteOpen} onOpenChange={setIsQuickNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Швидка нотатка
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                ref={titleInputRef}
                placeholder="Заголовок (необов'язково)"
                value={quickNoteTitle}
                onChange={(e) => setQuickNoteTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-base font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Що хочете записати?..."
                value={quickNoteContent}
                onChange={(e) => setQuickNoteContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {quickNoteContent.length} символів
              </span>
              <span className="text-xs">
                Ctrl+Enter для збереження
              </span>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsQuickNoteOpen(false)}
                className="flex-1"
              >
                Скасувати
              </Button>
              <Button
                onClick={handleSaveQuickNote}
                disabled={isSaving || (!quickNoteTitle.trim() && !quickNoteContent.trim())}
                className="flex-1 gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Збереження...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Зберегти
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Мобільне меню (залишається без змін) */}
      {isMobileMenuOpen && (
        <div 
          ref={overlayRef}
          className="fixed inset-0 z-50 md:hidden"
          onClick={handleOverlayClick}
        >
          <div 
            className={cn(
              "absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300",
              isClosing ? "opacity-0" : "opacity-100"
            )}
          />
          
          <div 
            className={cn(
              "absolute top-0 left-0 h-full w-80 bg-background border-r shadow-xl transform transition-transform duration-300 ease-out",
              isClosing ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <div 
              className={cn(
                "flex items-center justify-between p-6 border-b transition-all duration-300",
                isClosing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: isClosing ? '0ms' : '100ms' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">{firstName || t('header.user')}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-muted-foreground">
                      {isOnline ? t('header.online') : t('header.offline')}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const delay = index * 50;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href);
                      closeMobileMenu();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 transform",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground",
                      isClosing ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
                    )}
                    style={{
                      transitionDelay: isClosing ? '0ms' : `${delay}ms`,
                      animationDelay: isClosing ? '0ms' : `${delay}ms`
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div 
              className={cn(
                "absolute bottom-0 left-0 right-0 p-4 border-t transition-all duration-300",
                isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: isClosing ? '0ms' : '200ms' }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Мова</span>
                  <div className="flex gap-1">
                    <Button
                      variant={i18n.language === 'ua' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        i18n.changeLanguage('ua');
                        localStorage.setItem('i18nextLng', 'ua');
                      }}
                      className="h-8 px-3 text-xs transition-all hover:scale-105"
                    >
                      UA
                    </Button>
                    <Button
                      variant={i18n.language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        i18n.changeLanguage('en');
                        localStorage.setItem('i18nextLng', 'en');
                      }}
                      className="h-8 px-3 text-xs transition-all hover:scale-105"
                    >
                      EN
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium block mb-2">Тема</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'dark', 'rose', 'mint'] as ThemeType[]).map((t) => (
                      <Button
                        key={t}
                        variant={theme === t ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme(t)}
                        className="h-8 capitalize text-xs transition-all hover:scale-105"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2 transition-all hover:scale-105 hover:border-destructive/50 hover:text-destructive"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/');
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Вийти
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;