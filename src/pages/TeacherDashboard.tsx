import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  User,
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Trophy,
  Activity,
  FileText,
  GraduationCap,
  Upload,
  Clock,
  ListChecks,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  course: number;
  faculty: string;
  specialty: string;
  workType: 'coursework' | 'diploma';
  workTitle: string;
  startDate: string;
  progress: number;
  status: 'active' | 'completed' | 'behind';
  lastMeeting?: string;
  nextMeeting?: string;
  teacherId?: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  id?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'meeting' | 'deadline';
  time?: string;
  location?: string;
  link?: string;
  description?: string;
}

// Функція для отримання токену
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token');
  }
  return null;
};

// Функція для отримання ID поточного користувача
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    const currentUser = localStorage.getItem('currentUser') || 
                       sessionStorage.getItem('currentUser');
    
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        if (userData.id) {
          return userData.id.toString();
        }
      } catch {
        // Ігноруємо помилку парсингу
      }
    }
    
    return localStorage.getItem('userId') || 
           sessionStorage.getItem('userId') ||
           localStorage.getItem('user_id') ||
           sessionStorage.getItem('user_id');
  }
  return null;
};

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'coursework' | 'diploma'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'behind'>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    coursework: 0,
    diploma: 0,
    completed: 0,
    averageProgress: 0,
    meetings: 0,
    upcomingEvents: 0
  });

  // Функція для перевірки та синхронізації даних
  const checkAndSyncData = () => {
    const teacherId = getCurrentUserId();
    if (!teacherId) return;

    // Перевіряємо localStorage як fallback
    const savedStudents = localStorage.getItem('teacherStudents');
    if (savedStudents) {
      const localStudents = JSON.parse(savedStudents);
      const teacherStudents = localStudents.filter((student: Student) => 
        student.teacherId === teacherId
      );
      
      // Якщо є студенти в localStorage, але не в стані - синхронізуємо
      if (teacherStudents.length > 0 && students.length === 0) {
        setStudents(teacherStudents);
        console.log('Synced students from localStorage:', teacherStudents.length);
      }
    }
  };

  // Отримання даних користувача з API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await fetch('/api/current-user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Якщо API повертає помилку, використовуємо дані з localStorage
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
          }
        }

        // Якщо немає токена, використовуємо дані з localStorage
        if (!user) {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
        
      } catch (error) {
        console.error('Помилка завантаження даних користувача:', error);
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Отримання подій з календаря з API
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/events', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const events: CalendarEvent[] = await response.json();
          setCalendarEvents(events);
        } else {
          console.error('Помилка отримання подій з календаря');
        }
      } catch (error) {
        console.error('Помилка завантаження подій:', error);
      }
    };

    if (user?.email) {
      fetchCalendarEvents();
    }
  }, [user]);

  // Основна функція завантаження студентів
  const fetchStudentsFromAPI = async () => {
    try {
      const teacherId = getCurrentUserId();
      const token = getAuthToken();
      
      console.log('Fetching students for teacher:', teacherId);
      
      if (!teacherId) {
        console.log('No teacher ID found');
        // Fallback до localStorage
        const savedStudents = localStorage.getItem('teacherStudents');
        if (savedStudents) {
          const localStudents = JSON.parse(savedStudents);
          const teacherStudents = localStudents.filter((student: Student) => 
            student.teacherId === teacherId
          );
          setStudents(teacherStudents);
        } else {
          setStudents([]);
        }
        return;
      }

      const response = await fetch(`/api/teacher/students?teacher_id=${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Конвертація даних з API у формат компонента
        const apiStudents: Student[] = Array.isArray(data) ? data.map((student: any) => ({
          id: student.id?.toString() || `api-${Date.now()}`,
          name: student.student_name || student.name || 'Студент',
          email: student.student_email || student.email || '',
          phone: student.student_phone || student.phone || '',
          avatar: student.student_avatar || student.avatar || '',
          course: student.course || 3,
          faculty: student.faculty || "Факультет інформаційних технологій",
          specialty: student.specialty || "Комп'ютерні науки",
          workType: student.work_type || student.workType || 'coursework',
          workTitle: student.work_title || student.workTitle || 'Робота без назви',
          startDate: student.start_date || student.startDate || new Date().toISOString().split('T')[0],
          progress: student.progress || 0,
          status: student.status || 'active',
          lastMeeting: student.last_meeting || student.lastMeeting,
          nextMeeting: student.next_meeting || student.nextMeeting,
          teacherId: student.teacher_id || teacherId
        })) : [];

        console.log('Students loaded from API:', apiStudents.length);
        setStudents(apiStudents);
        
        // Додатково зберігаємо в localStorage для синхронізації
        if (apiStudents.length > 0) {
          const existingStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
          const updatedStudents = [...existingStudents.filter((s: Student) => s.teacherId !== teacherId), ...apiStudents];
          localStorage.setItem('teacherStudents', JSON.stringify(updatedStudents));
        }
      } else {
        console.log('API request failed, trying localStorage');
        // Fallback до localStorage
        const savedStudents = localStorage.getItem('teacherStudents');
        if (savedStudents) {
          const localStudents = JSON.parse(savedStudents);
          const teacherStudents = localStudents.filter((student: Student) => 
            student.teacherId === teacherId
          );
          setStudents(teacherStudents);
          console.log('Students loaded from localStorage:', teacherStudents.length);
        } else {
          setStudents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching students from API:', error);
      // Fallback до localStorage
      const savedStudents = localStorage.getItem('teacherStudents');
      if (savedStudents) {
        const localStudents = JSON.parse(savedStudents);
        const teacherStudents = localStudents.filter((student: Student) => 
          student.teacherId === getCurrentUserId()
        );
        setStudents(teacherStudents);
      } else {
        setStudents([]);
      }
    }
  };

  // Завантаження студентів при монтуванні
  useEffect(() => {
    fetchStudentsFromAPI();
  }, []);

  // Слухачі для оновлення студентів
  useEffect(() => {
    const handleStudentUpdate = () => {
      console.log('Student update event received, refreshing students...');
      fetchStudentsFromAPI();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teacherStudents') {
        console.log('LocalStorage changed, refreshing students...');
        fetchStudentsFromAPI();
      }
    };

    // Слухач для кастомних подій (коли студент додається через заявки)
    window.addEventListener('studentUpdated', handleStudentUpdate);
    
    // Слухач для змін в localStorage
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('studentUpdated', handleStudentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Перевірка синхронізації після завантаження
  useEffect(() => {
    if (!loading) {
      checkAndSyncData();
    }
  }, [loading]);

  // Розрахунок статистики на основі реальних даних
  useEffect(() => {
    const calculateStats = () => {
      const total = students.length;
      const coursework = students.filter(s => s.workType === 'coursework').length;
      const diploma = students.filter(s => s.workType === 'diploma').length;
      const completed = students.filter(s => s.status === 'completed').length;
      const averageProgress = total > 0 
        ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / total)
        : 0;

      // Розрахунок зустрічей з календаря
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const upcomingMeetings = calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        return event.type === 'meeting' && eventDate >= today && eventDate <= nextWeek;
      });

      const upcomingEvents = calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      });

      setStats({
        total,
        coursework,
        diploma,
        completed,
        averageProgress,
        meetings: upcomingMeetings.length,
        upcomingEvents: upcomingEvents.length
      });
    };

    calculateStats();
  }, [students, calendarEvents]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.workTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || student.workType === filterType;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Отримання найближчих подій (наступні 7 днів)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return calendarEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const upcomingEvents = getUpcomingEvents();

  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Активний', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      completed: { variant: 'outline' as const, text: 'Завершено', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      behind: { variant: 'destructive' as const, text: 'Відстає', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={`text-xs whitespace-nowrap ${config.color} max-w-[80px] truncate`}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сьогодні';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task':
        return ListChecks;
      case 'meeting':
        return Users;
      case 'deadline':
        return Clock;
      default:
        return Calendar;
    }
  };

  const getEventPriority = (type: string) => {
    switch (type) {
      case 'deadline':
        return { text: 'Високий', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' };
      case 'meeting':
        return { text: 'Середній', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' };
      case 'task':
        return { text: 'Низький', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' };
      default:
        return { text: 'Середній', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' };
    }
  };

  // Слухачі для оновлення студентів
useEffect(() => {
  const handleStudentsUpdated = () => {
    console.log('Students updated event received, refreshing students...');
    fetchStudentsFromAPI();
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'teacherStudents') {
      console.log('LocalStorage changed, refreshing students...');
      fetchStudentsFromAPI();
    }
  };

  // Слухач для кастомних подій
  window.addEventListener('studentsUpdated', handleStudentsUpdated);
  window.addEventListener('studentUpdated', handleStudentsUpdated); // для зворотної сумісності
  
  // Слухач для змін в localStorage
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('studentsUpdated', handleStudentsUpdated);
    window.removeEventListener('studentUpdated', handleStudentsUpdated);
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);


  // Статистика для карток - на основі реальних даних
  const quickStats = [
    {
      label: 'Всього студентів',
      value: stats.total.toString(),
      icon: Users,
      change: stats.total > 0 ? 'Активні студенти' : 'Ще немає студентів',
      trend: stats.total > 0 ? 'up' : 'neutral' as const,
    },
    {
      label: 'Середній прогрес',
      value: `${stats.averageProgress}%`,
      icon: Target,
      change: stats.averageProgress > 0 ? 'Прогрес робіт' : 'Очікуємо роботи',
      trend: stats.averageProgress > 0 ? 'up' : 'neutral' as const,
    },
    {
      label: 'Заплановані зустрічі',
      value: stats.meetings.toString(),
      icon: Calendar,
      change: stats.meetings > 0 ? 'На цьому тижні' : 'Немає запланованих',
      trend: 'neutral' as const,
    },
    {
      label: 'Найближчі події',
      value: stats.upcomingEvents.toString(),
      icon: Clock,
      change: stats.upcomingEvents > 0 ? 'У найближчі 7 днів' : 'Немає подій',
      trend: 'neutral' as const,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Завантаження даних...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative w-64 bg-background border-r shadow-xl z-50">
            <Sidebar />
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-8 lg:p-8 space-y-8 pb-20 max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-primary">
                        Панель керівника
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
                      Ласкаво просимо, {user?.firstName || "Користувач"}!
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-6">
                      {students.length > 0 
                        ? `Керуйте роботами ${stats.total} студентів та відстежуйте їхній прогрес` 
                        : 'Почніть роботу з прийняття студентів для керівництва'
                      }
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <Users className="w-4 h-4 mr-2" />
                        {stats.total} студентів
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {stats.coursework} курсових
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {stats.diploma} дипломних
                      </Badge>
                      <Badge variant="default" className="px-4 py-2">
                        <Target className="w-4 h-4 mr-2" />
                        {students.length > 0 ? 'Активний' : 'Готовий до роботи'}
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:block ml-8">
                    <div className="w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 inline-block ml-1" />}
                          {stat.trend === 'down' && <Activity className="w-4 h-4 text-red-500 inline-block ml-1" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">{stat.label}</p>
                        <p className="text-sm text-muted-foreground">{stat.change}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Основний контент - список студентів */}
                <div className="lg:col-span-2">
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl md:text-2xl font-bold">Мої студенти</CardTitle>
                          <CardDescription>
                            {students.length > 0 
                              ? `Список студентів, які працюють під вашим керівництвом (${filteredStudents.length})` 
                              : 'Прийміть студентів для початку роботи'
                            }
                          </CardDescription>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          {students.length > 0 && (
                            <>
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Пошук студентів..."
                                  className="pl-8 w-full sm:w-[200px] text-sm"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                              </div>
                              
                              <div className="flex gap-1">
                                <Button
                                  variant={filterType === 'all' ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => setFilterType('all')}
                                >
                                  Всі
                                </Button>
                                <Button
                                  variant={filterType === 'coursework' ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => setFilterType('coursework')}
                                >
                                  Курсові
                                </Button>
                                <Button
                                  variant={filterType === 'diploma' ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs h-8"
                                  onClick={() => setFilterType('diploma')}
                                >
                                  Дипломні
                                </Button>
                              </div>

                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {students.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-4">Ще немає студентів</h3>
                          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Почніть роботу з прийняття студентів, які будуть працювати під вашим керівництвом над курсовими та дипломними роботами
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                              size="lg" 
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              asChild
                            >
                              <Link to="/teacher/applications">
                                <Users className="w-5 h-5 mr-2" />
                                Перейти до заявок
                              </Link>
                            </Button>
                          </div>
                          
                          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold mb-1">Прийняти заявки</h4>
                              <p className="text-sm text-muted-foreground">Переглянути список заявок</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold mb-1">Імпорт з файлу</h4>
                              <p className="text-sm text-muted-foreground">Завантажте список з Excel</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold mb-1">Шаблони</h4>
                              <p className="text-sm text-muted-foreground">Використовуйте готові шаблони</p>
                            </div>
                          </div>
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                          <User className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">Студентів не знайдено</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            Спробуйте змінити параметри пошуку або фільтрації
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                                setFilterStatus('all');
                              }}
                            >
                              Скинути фільтри
                            </Button>
                            <Button asChild>
                              <Link to="/teacher/students">
                                <Users className="w-4 h-4 mr-2" />
                                Прийняти ще студентів
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                          {filteredStudents.map((student) => (
                            <Card key={student.id} className="hover:shadow-md transition-all duration-200 border flex flex-col h-full">
                              <CardHeader className="pb-3 flex-none">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                      <AvatarImage src={student.avatar} />
                                      <AvatarFallback className="text-sm bg-primary/10">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <CardTitle className="text-base truncate">{student.name}</CardTitle>
                                      <CardDescription className="text-xs truncate">
                                        {student.course} курс • {student.specialty}
                                      </CardDescription>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 flex justify-start">
                                  {getStatusBadge(student.status)}
                                </div>
                              </CardHeader>
                              
                              <CardContent className="space-y-3 pb-3 flex-1">
                                <div className="flex-none">
                                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                                    <BookOpen className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {student.workType === 'coursework' ? 'Курсова' : 'Дипломна'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium line-clamp-2 leading-relaxed min-h-[2.5rem]">
                                    {student.workTitle}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs flex-none">
                                  <div>
                                    <p className="text-muted-foreground">Початок:</p>
                                    <p className="font-medium">{formatDate(student.startDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Прогрес:</p>
                                    <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          student.progress < 30 ? 'bg-red-500' :
                                          student.progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${student.progress}%` }}
                                      />
                                    </div>
                                    <p className="font-medium text-xs mt-1">{student.progress}%</p>
                                  </div>
                                </div>
                                
                                {student.nextMeeting && (
                                  <div className="flex items-center text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded flex-none">
                                    <Calendar className="mr-1 h-3 w-3 text-blue-500 flex-shrink-0" />
                                    <span className="truncate">Зустріч: {formatDate(student.nextMeeting)}</span>
                                  </div>
                                )}
                              </CardContent>
                              
                              <CardFooter className="pt-0 mt-auto flex-none">
                                <div className="flex w-full gap-2 items-center">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" asChild>
                                    <a href={`mailto:${student.email}`}>
                                      <Mail className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  {student.phone && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" asChild>
                                      <a href={`tel:${student.phone}`}>
                                        <Phone className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                  <Button asChild className="ml-auto text-xs h-8 px-3 flex-shrink-0" variant="outline">
                                    <Link to={`/teacher/grades?studentId=${student.id}`}>
                                      Детальніше
                                      <ChevronRight className="ml-1 h-3 w-3" />
                                    </Link>
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {students.length > 0 && (
                      <CardFooter className="border-t pt-4 bg-muted/50">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-sm text-muted-foreground">
                            Показано {filteredStudents.length} з {students.length} студентів
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/teacher/applications">
                              <Users className="w-4 h-4 mr-2" />
                              Прийняти ще студентів
                            </Link>
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                </div>

                {/* Бокова панель - події та швидкі дії */}
                <div className="space-y-6">
                  {/* Найближчі події */}
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <CardTitle className="text-lg">Найближчі події</CardTitle>
                      </div>
                      <CardDescription>
                        {upcomingEvents.length > 0 
                          ? 'Події на найближчі 7 днів' 
                          : 'Немає запланованих подій'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingEvents.length === 0 ? (
                          <div className="text-center py-6">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-sm mb-4">
                              Немає запланованих подій
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <Link to="/calendar">
                                <Calendar className="w-4 h-4 mr-2" />
                                Перейти до календаря
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          upcomingEvents.map((event) => {
                            const Icon = getEventIcon(event.type);
                            const priority = getEventPriority(event.type);
                            return (
                              <div key={event.id} className="p-4 border rounded-xl hover:bg-muted/50 transition-colors duration-200 group">
                                <div className={`inline-flex px-2 py-1 rounded text-xs font-medium mb-2 ${priority.color}`}>
                                  {priority.text}
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <Icon className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground leading-tight">
                                      {event.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatEventDate(event.date)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Швидкі дії */}
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Швидкі дії</CardTitle>
                      <CardDescription>Найчастіші операції</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start h-12" asChild>
                        <Link to="/calendar">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Календар</div>
                            <div className="text-xs text-muted-foreground">Переглянути розклад</div>
                          </div>
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12" asChild>
                        <Link to="/teacher/applications">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Заявки студентів</div>
                            <div className="text-xs text-muted-foreground">Прийняти нових студентів</div>
                          </div>
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12" asChild>
                        <Link to="/analytics">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <BarChart3 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Аналітика</div>
                            <div className="text-xs text-muted-foreground">Статистика прогресу</div>
                          </div>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Статистика */}
              <Card className="hover:shadow-lg transition-shadow duration-200 w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Загальна статистика</CardTitle>
                  <CardDescription>
                    {students.length > 0 ? 'Огляд роботи зі студентами' : 'Готовість до початку роботи'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Всього студентів</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="text-2xl font-bold text-foreground">
                        {stats.coursework}
                      </div>
                      <div className="text-sm text-muted-foreground">Курсові роботи</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="text-2xl font-bold text-foreground">
                        {stats.diploma}
                      </div>
                      <div className="text-sm text-muted-foreground">Дипломні роботи</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="text-2xl font-bold text-foreground">
                        {stats.completed}
                      </div>
                      <div className="text-sm text-muted-foreground">Завершено</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                    <div className="text-center p-4">
                      <div className="text-lg font-semibold text-foreground">
                        {stats.averageProgress}%
                      </div>
                      <div className="text-sm text-muted-foreground">Середній прогрес</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-lg font-semibold text-foreground">
                        {stats.meetings}
                      </div>
                      <div className="text-sm text-muted-foreground">Заплановані зустрічі</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-lg font-semibold text-foreground">
                        {stats.upcomingEvents}
                      </div>
                      <div className="text-sm text-muted-foreground">Найближчі події</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;