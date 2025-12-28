// StudentProfileModal.tsx - оновлена версія зі стилем TeacherProfileModal
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Trophy, 
  Target, 
  Calendar,
  Users,
  GraduationCap,
  MapPin,
  Building,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Star,
  Layers,
  Activity,
  ExternalLink,
  Github,
  Linkedin,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  course: number;
  faculty: string;
  department?: string;
  bio?: string;
  group?: string;
  linkedin_url?: string;
  github_url?: string;
  specialty?: string;
  specialty_code?: string;
  created_at?: string;
  updated_at?: string;
  skills?: string[];
  interests?: string[];
  university?: string;
  status?: 'active' | 'inactive' | 'graduated';
}

interface Project {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  type?: string;
  organization?: string;
  certificateUrl?: string;
  createdAt: string;
}

interface Goal {
  id: string;
  goal: string;
  deadline: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  createdAt: string;
}

interface StudentProfileModalProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    program?: string;
    year?: string;
    bio?: string;
  };
}

// Функція для безпечного парсингу чисел
const safeParseInt = (value: string | number | undefined, defaultValue: number = 1): number => {
  if (value === undefined || value === null) return defaultValue;
  const num = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
  return isNaN(num) ? defaultValue : num;
};

// Функція для отримання рядка з будь-якого значення
const safeGetString = (value: unknown, defaultValue: string = ''): string => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
  return String(value);
};

// Функція для форматування дати
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Функції для отримання кольорів та іконок
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'accepted':
    case 'finished':
    case 'завершено':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
    case 'in progress':
    case 'active':
    case 'в процесі':
    case 'активно':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
    case 'pending':
    case 'очікує':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
    case 'cancelled':
    case 'rejected':
    case 'відхилено':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'finished':
    case 'завершено':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'in progress':
    case 'active':
    case 'в процесі':
    case 'активно':
      return <Clock className="h-3.5 w-3.5" />;
    case 'cancelled':
    case 'rejected':
    case 'відхилено':
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
};

export function StudentProfileModal({ 
  studentId, 
  open, 
  onOpenChange,
  isMobile = false,
  initialData 
}: StudentProfileModalProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && studentId) {
      fetchStudentData();
    } else {
      // Reset state when modal closes
      setStudent(null);
      setProjects([]);
      setAchievements([]);
      setGoals([]);
      setActiveTab('overview');
    }
  }, [open, studentId]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Завантажуємо основні дані студента з API
      const studentResponse = await fetch(`/api/students/${studentId}/profile`, { headers });
      if (studentResponse.ok) {
        const studentData = await studentResponse.json();
        console.log('📱 Дані студента для модального вікна:', studentData);
        
        const formattedStudent: StudentProfile = {
          id: studentId,
          name: safeGetString(studentData.name || studentData.user?.name || initialData?.name, 'Студент'),
          email: safeGetString(studentData.email || studentData.user?.email || initialData?.email),
          phone: safeGetString(studentData.phone || studentData.user?.phone || initialData?.phone),
          avatar_url: safeGetString(studentData.avatar_url || studentData.user?.avatar_url || initialData?.avatar),
          course: safeParseInt(studentData.course || studentData.year || initialData?.year, 1),
          faculty: safeGetString(studentData.faculty || studentData.user?.faculty || studentData.faculty_name, 'Не вказано'),
          department: safeGetString(studentData.department || studentData.user?.department || studentData.department_name),
          bio: safeGetString(studentData.bio || studentData.user?.bio || initialData?.bio, 'Біографія не вказана'),
          group: safeGetString(studentData.group || studentData.user?.group || studentData.group_name),
          linkedin_url: safeGetString(studentData.linkedin_url || studentData.user?.linkedin_url),
          github_url: safeGetString(studentData.github_url || studentData.user?.github_url),
          specialty: safeGetString(studentData.specialty || studentData.user?.specialty || studentData.specialty_name || initialData?.program),
          specialty_code: safeGetString(studentData.specialty_code || studentData.user?.specialty_code),
          created_at: safeGetString(studentData.created_at || studentData.user?.created_at),
          updated_at: safeGetString(studentData.updated_at || studentData.user?.updated_at),
          skills: Array.isArray(studentData.skills || studentData.user?.skills) ? (studentData.skills || studentData.user?.skills) as string[] : [],
          interests: Array.isArray(studentData.interests || studentData.user?.interests) ? (studentData.interests || studentData.user?.interests) as string[] : [],
          university: safeGetString(studentData.university || studentData.user?.university),
          status: (studentData.status || studentData.user?.status || 'active') as 'active' | 'inactive' | 'graduated'
        };
        
        setStudent(formattedStudent);
      } else {
        // Якщо API не працює, використовуємо початкові дані
        if (initialData) {
          const fallbackStudent: StudentProfile = {
            id: studentId,
            name: safeGetString(initialData.name, 'Студент'),
            email: safeGetString(initialData.email),
            phone: safeGetString(initialData.phone),
            avatar_url: safeGetString(initialData.avatar),
            course: safeParseInt(initialData.year, 1),
            faculty: 'Не вказано',
            department: undefined,
            bio: safeGetString(initialData.bio, 'Біографія не вказана'),
            group: undefined,
            linkedin_url: undefined,
            github_url: undefined,
            specialty: safeGetString(initialData.program),
            specialty_code: undefined,
            created_at: undefined,
            updated_at: undefined,
            skills: [],
            interests: [],
            university: undefined,
            status: 'active'
          };
          setStudent(fallbackStudent);
        }
      }

      // Завантажуємо проєкти
      const projectsResponse = await fetch(`/api/students/${studentId}/projects`, { headers });
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        if (Array.isArray(projectsData)) {
          const typedProjects: Project[] = projectsData.map((item: Record<string, unknown>) => ({
            id: safeGetString(item.id),
            title: safeGetString(item.title, 'Без назви'),
            type: safeGetString(item.type),
            status: safeGetString(item.status),
            description: safeGetString(item.description),
            technologies: Array.isArray(item.technologies) ? item.technologies as string[] : [],
            projectUrl: safeGetString(item.projectUrl),
            githubUrl: safeGetString(item.githubUrl),
            startDate: safeGetString(item.startDate),
            endDate: safeGetString(item.endDate),
            createdAt: safeGetString(item.createdAt)
          }));
          setProjects(typedProjects);
        }
      }

      // Завантажуємо досягнення
      const achievementsResponse = await fetch(`/api/students/${studentId}/achievements`, { headers });
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        if (Array.isArray(achievementsData)) {
          const typedAchievements: Achievement[] = achievementsData.map((item: Record<string, unknown>) => ({
            id: safeGetString(item.id),
            title: safeGetString(item.title),
            date: safeGetString(item.date),
            description: safeGetString(item.description),
            type: safeGetString(item.type),
            organization: safeGetString(item.organization),
            certificateUrl: safeGetString(item.certificateUrl),
            createdAt: safeGetString(item.createdAt)
          }));
          setAchievements(typedAchievements);
        }
      }

      // Завантажуємо цілі
      const goalsResponse = await fetch(`/api/students/${studentId}/goals`, { headers });
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        if (Array.isArray(goalsData)) {
          const typedGoals: Goal[] = goalsData.map((item: Record<string, unknown>) => ({
            id: safeGetString(item.id),
            goal: safeGetString(item.goal),
            deadline: safeGetString(item.deadline),
            description: safeGetString(item.description),
            status: safeGetString(item.status),
            priority: safeGetString(item.priority),
            progress: typeof item.progress === 'number' ? item.progress as number : 0,
            createdAt: safeGetString(item.createdAt)
          }));
          setGoals(typedGoals);
        }
      }

    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Огляд', icon: User },
    { id: 'projects', label: 'Проєкти', icon: BookOpen },
    { id: 'achievements', label: 'Досягнення', icon: Trophy },
    { id: 'goals', label: 'Цілі', icon: Target },
    { id: 'skills', label: 'Навички', icon: Code },
  ];

  // Статистика
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => 
      p.status.toLowerCase().includes('завершено') || 
      p.status.toLowerCase().includes('completed')
    ).length,
    totalAchievements: achievements.length,
    totalGoals: goals.length,
    activeGoals: goals.filter(g => 
      g.status.toLowerCase().includes('активно') || 
      g.status.toLowerCase().includes('active') ||
      g.status.toLowerCase().includes('в процесі') ||
      g.status.toLowerCase().includes('in progress')
    ).length,
    completedGoals: goals.filter(g => 
      g.status.toLowerCase().includes('завершено') || 
      g.status.toLowerCase().includes('completed')
    ).length,
    averageProgress: goals.length > 0 
      ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
      : 0
  };

  // Отримання ініціалів
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Спрощена мобільна версія
  const MobileModal = () => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-full p-0 overflow-hidden",
        "fixed inset-x-0 bottom-0 top-auto translate-y-0",
        "rounded-t-2xl border-b-0 h-auto max-h-[85vh]"
      )}>
        {/* Заголовок */}
        <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <h1 className="font-bold text-base">Профіль студента</h1>
          </div>
        </div>

        {/* Компактна навігація */}
        <div className="sticky top-[49px] z-40 bg-background border-b px-4 py-1">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg flex items-center gap-1 whitespace-nowrap text-xs font-medium",
                    "transition-all duration-200 min-w-[70px]",
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Основний контент */}
        <div className="overflow-y-auto max-h-[calc(85vh-90px)]">
          <div className="px-4 py-4">
            <CompactModalContent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Спрощена десктоп версія
  const DesktopModal = () => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-2xl p-0 overflow-hidden",
        "lg:max-w-3xl"
      )}>
        <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">Профіль студента</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Навігація */}
        <div className="border-b bg-muted/30 px-4 py-1">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium",
                    "transition-all duration-200",
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Контент */}
        <ScrollArea className="max-h-[60vh]">
          <div className="px-4 py-4">
            <CompactModalContent />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  // Спрощений контент з додатковими полями
  const CompactModalContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!student) {
      return (
        <div className="text-center py-6">
          <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            Не вдалося завантажити інформацію
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Вкладка Огляд */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Основна інформація */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={student.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-lg">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{student.name}</h3>
                <p className="text-primary text-sm mb-2">Студент {student.course} курсу</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  {student.group && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <Users className="h-3 w-3 mr-1" />
                      {student.group}
                    </Badge>
                  )}
                  {student.specialty && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {student.specialty_code ? `${student.specialty_code}` : student.specialty}
                    </Badge>
                  )}
                  {student.status && (
                    <Badge variant="outline" className={cn(
                      "text-xs px-2 py-0.5",
                      student.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 
                      student.status === 'graduated' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                      'bg-gray-100 text-gray-800 border-gray-200'
                    )}>
                      <Activity className="h-3 w-3 mr-1" />
                      {student.status === 'active' ? 'Активний' : 
                       student.status === 'graduated' ? 'Випускник' : 'Неактивний'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Контактна інформація */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Контактна інформація
              </h4>
              
              {/* Електронна пошта */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Електронна пошта</p>
                  <a 
                    href={`mailto:${student.email}`}
                    className="font-medium text-sm hover:text-blue-600 transition-colors truncate block"
                  >
                    {student.email}
                  </a>
                </div>
              </div>

              {/* Телефон */}
              {student.phone && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                    <a 
                      href={`tel:${student.phone.replace(/\s/g, '')}`}
                      className="font-medium text-sm hover:text-green-600 transition-colors"
                    >
                      {student.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Факультет */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Факультет</p>
                  <p className="font-medium text-sm">{student.faculty}</p>
                </div>
              </div>

              {/* Кафедра */}
              {student.department && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Кафедра</p>
                    <p className="font-medium text-sm">{student.department}</p>
                  </div>
                </div>
              )}

              {/* Соціальні мережі */}
              {(student.linkedin_url || student.github_url) && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Соціальні мережі</p>
                    <div className="flex gap-2">
                      {student.linkedin_url && (
                        <a 
                          href={student.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {student.github_url && (
                        <a 
                          href={student.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:text-gray-800 transition-colors flex items-center gap-1"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Біографія / Про себе */}
            {student.bio && student.bio !== 'Біографія не вказана' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm text-muted-foreground">Про себе</h4>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {student.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Швидка статистика */}
            <div className="pt-3 border-t">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{stats.totalProjects}</div>
                  <div className="text-xs text-muted-foreground">Проєктів</div>
                  {stats.completedProjects > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {stats.completedProjects} завершено
                    </div>
                  )}
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{stats.totalAchievements}</div>
                  <div className="text-xs text-muted-foreground">Досягнень</div>
                  {achievements[0] && (
                    <div className="text-xs text-muted-foreground">
                      {formatDate(achievements[0].date)}
                    </div>
                  )}
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{stats.totalGoals}</div>
                  <div className="text-xs text-muted-foreground">Цілей</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.activeGoals} активних
                  </div>
                </div>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{stats.averageProgress}%</div>
                  <div className="text-xs text-muted-foreground">Прогрес</div>
                  <div className="text-xs text-muted-foreground">
                    Середній
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Вкладка Проєкти */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.slice(0, 6).map((project) => (
                <div key={project.id} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{project.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(project.status)} flex items-center gap-1`}>
                          {getStatusIcon(project.status)}
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-2">
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.startDate)}
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.endDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Проєктів немає</p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка Досягнення */}
        {activeTab === 'achievements' && (
          <div className="space-y-3">
            {achievements.length > 0 ? (
              achievements.slice(0, 6).map((achievement) => (
                <div key={achievement.id} className="p-4 border rounded-lg hover:border-yellow-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(achievement.date)}
                            </Badge>
                            {achievement.type && (
                              <Badge variant="secondary" className="text-xs">
                                {achievement.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {achievement.certificateUrl && (
                          <a 
                            href={achievement.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {achievement.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-2">
                          {achievement.description}
                        </p>
                      )}
                      {achievement.organization && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {achievement.organization}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Досягнень немає</p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка Цілі */}
        {activeTab === 'goals' && (
          <div className="space-y-3">
            {goals.length > 0 ? (
              goals.slice(0, 6).map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-2">{goal.goal}</h4>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className={`text-xs ${getStatusColor(goal.status)} flex items-center gap-1`}>
                          {getStatusIcon(goal.status)}
                          {goal.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {goal.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Прогрес: {goal.progress}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Дедлайн: {formatDate(goal.deadline)}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Цілей немає</p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка Навички */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            {/* Навички студента */}
            {(student.skills && student.skills.length > 0) ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                  <Code className="h-4 w-4" />
                  Навички
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Code className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Навички не вказані</p>
              </div>
            )}

            {/* Інтереси */}
            {(student.interests && student.interests.length > 0) && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Інтереси
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Технології з проєктів */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Використані технології
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(projects.flatMap(project => project.technologies || []))
                  ).map((tech, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-0.5 text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Повертаємо відповідну версію
  return isMobile ? <MobileModal /> : <DesktopModal />;
}

export default StudentProfileModal;