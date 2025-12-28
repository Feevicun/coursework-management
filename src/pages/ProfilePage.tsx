import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  BookOpen, 
  Trophy, 
  Target, 
  Trash2, 
  Edit, 
  Users, 
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  ExternalLink,
  Github,
  Linkedin,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StudentInfo {
  id: string;
  name: string;
  group: string;
  course: number;
  faculty: string;
  department: string;
  email: string;
  bio: string;
  phone?: string;
  specialty?: string;
  specialty_code?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  created_at?: string;
  updated_at?: string;
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

interface StudentStats {
  totalProjects: number;
  completedProjects: number;
  totalAchievements: number;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
}

// Функція для отримання токену
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  }
  return null;
};

// Функція для безпечного парсингу JSON
const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
};

// Функція для безпечного запиту до API
const safeFetch = async (url: string, options: any = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status} for URL: ${url}`);
      return null;
    }

    const text = await response.text();
    
    if (!text.trim()) {
      return null;
    }

    const data = safeJsonParse(text);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};

// Функція для парсингу дат з різних форматів
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Формат DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Формат YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }
  
  // ISO формат
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  
  // Спробувати стандартний парсинг
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Функція для валідації та форматування дати
const validateAndFormatDate = (dateString: string): string | null => {
  if (!dateString) return null;
  
  // Перевірка формату дати
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Якщо формат DD.MM.YYYY, конвертуємо в YYYY-MM-DD
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('.');
      dateString = `${year}-${month}-${day}`;
    } else {
      console.warn(`Invalid date format: ${dateString}`);
      return null;
    }
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateString}`);
    return null;
  }
  
  return date.toISOString().split('T')[0];
};

// Функція для форматування дати в українському форматі
const formatDate = (dateString: string): string => {
  const date = parseDate(dateString);
  if (!date) return 'Не вказано';
  
  try {
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Функція для отримання інформації про студента з API
const getStudentInfo = async (): Promise<StudentInfo | null> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.log('❌ No token found for student info');
      toast.error('Потрібна авторизація');
      return null;
    }

    console.log('🔍 Завантаження інформації про студента з API...');
    
    let studentData = null;
    
    // Спершу пробуємо /api/student/profile
    try {
      const profileResponse = await fetch('/api/student/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('📋 Дані профілю студента з API:', profileData);
        
        studentData = {
          id: profileData.id || profileData.user_id || "",
          name: profileData.name || profileData.full_name || profileData.user?.name || "",
          group: profileData.group || profileData.group_name || profileData.user?.group || "",
          course: parseInt(profileData.course) || parseInt(profileData.year) || 1,
          faculty: profileData.faculty || profileData.faculty_name || profileData.user?.faculty || "",
          department: profileData.department || profileData.department_name || profileData.user?.department || "",
          email: profileData.email || profileData.user?.email || "",
          bio: profileData.bio || profileData.user?.bio || "",
          phone: profileData.phone || profileData.user?.phone || "",
          specialty: profileData.specialty || profileData.specialty_name || profileData.user?.specialty || "",
          specialty_code: profileData.specialty_code || profileData.user?.specialty_code || "",
          avatar_url: profileData.avatar_url || profileData.user?.avatar_url || profileData.avatar,
          linkedin_url: profileData.linkedin_url || profileData.user?.linkedin_url,
          github_url: profileData.github_url || profileData.user?.github_url,
          created_at: profileData.created_at || profileData.user?.created_at,
          updated_at: profileData.updated_at || profileData.user?.updated_at
        };
      } else {
        console.log('⚠️ Profile API недоступний, намагаюся /api/current-user');
        const errorText = await profileResponse.text();
        console.error('Помилка API:', errorText);
      }
    } catch (error) {
      console.error('❌ Помилка при отриманні профілю з API:', error);
    }

    // Якщо не вдалося отримати з /api/student/profile, пробуємо /api/current-user
    if (!studentData) {
      try {
        const response = await fetch('/api/current-user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📋 Дані поточного користувача з API:', data);
          
          studentData = {
            id: data.id || data.user_id || "",
            name: data.user?.name || data.name || data.full_name || "",
            group: data.user?.group || data.group || data.group_name || "",
            course: parseInt(data.user?.course) || parseInt(data.course) || parseInt(data.year) || 1,
            faculty: data.user?.faculty || data.faculty || data.faculty_name || "",
            department: data.user?.department || data.department || data.department_name || "",
            email: data.user?.email || data.email || "",
            bio: data.user?.bio || data.bio || "",
            phone: data.user?.phone || data.phone || "",
            specialty: data.user?.specialty || data.specialty || data.specialty_name || "",
            specialty_code: data.user?.specialty_code || data.specialty_code || "",
            avatar_url: data.user?.avatar_url || data.avatar_url || data.avatar,
            linkedin_url: data.user?.linkedin_url || data.linkedin_url,
            github_url: data.user?.github_url || data.github_url,
            created_at: data.user?.created_at || data.created_at,
            updated_at: data.user?.updated_at || data.updated_at
          };
        } else {
          const errorText = await response.text();
          console.error('Помилка API current-user:', errorText);
        }
      } catch (error) {
        console.error('❌ Помилка при отриманні поточного користувача з API:', error);
      }
    }
    
    if (studentData) {
      console.log('✅ Оброблені дані студента з API:', studentData);
      
      // Оновлюємо localStorage
      try {
        const userData = {
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone || '',
          faculty: studentData.faculty,
          year: studentData.course,
          group: studentData.group || '',
          specialty: studentData.specialty || '',
          specialty_code: studentData.specialty_code || '',
          bio: studentData.bio,
          avatar_url: studentData.avatar_url
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('✅ Оновлено localStorage з даними API');
        
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } catch (e) {
        console.error('Помилка оновлення localStorage:', e);
      }
      
      return studentData;
    } else {
      console.log('❌ Дані студента не знайдено в API');
      toast.error('Не вдалося завантажити дані з сервера');
      return null;
    }
  } catch (error) {
    console.error('❌ Помилка отримання інформації студента з API:', error);
    toast.error('Помилка з\'єднання з сервером');
    return null;
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

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
  }
};

// Main component
export default function StudentProfile() {
  const { t } = useTranslation();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalAchievements: 0,
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<StudentInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Стани для додавання нових елементів
  const [newProject, setNewProject] = useState<Omit<Project, "id" | "createdAt">>({
    title: "",
    type: "",
    status: "",
    description: "",
    technologies: []
  });

  const [newAchievement, setNewAchievement] = useState<Omit<Achievement, "id" | "createdAt">>({
    title: "",
    date: "",
    description: "",
  });

  const [newGoal, setNewGoal] = useState<Omit<Goal, "id" | "createdAt">>({
    goal: "",
    deadline: "",
    description: "",
    status: "active",
    priority: "medium",
    progress: 0
  });

  // Стани для редагування існуючих елементів
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  // Функція оновлення статистики
  const updateStats = () => {
    const completedProjects = projects.filter(p => 
      p.status.toLowerCase().includes('завершено') || 
      p.status.toLowerCase().includes('completed')
    ).length;
    
    const activeGoals = goals.filter(g => 
      g.status.toLowerCase().includes('активно') || 
      g.status.toLowerCase().includes('active') ||
      g.status.toLowerCase().includes('в процесі') ||
      g.status.toLowerCase().includes('in progress')
    ).length;
    
    const completedGoals = goals.filter(g => 
      g.status.toLowerCase().includes('завершено') || 
      g.status.toLowerCase().includes('completed')
    ).length;
    
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
      : 0;

    setStats({
      totalProjects: projects.length,
      completedProjects,
      totalAchievements: achievements.length,
      totalGoals: goals.length,
      activeGoals,
      completedGoals,
      averageProgress: avgProgress
    });
  };

  // Оновлення статистики при зміні даних
  useEffect(() => {
    updateStats();
  }, [projects, achievements, goals]);

  // Завантаження всіх даних з API
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Отримуємо основну інформацію
      const studentInfoData = await getStudentInfo();
      if (studentInfoData) {
        setStudentInfo(studentInfoData);
        setEditedInfo(studentInfoData);
      } else {
        setStudentInfo(null);
      }

      const token = getAuthToken();
      if (!token) {
        toast.error('Потрібна авторизація');
        setLoading(false);
        return;
      }

      // Отримуємо проєкти з API
      try {
        const projectsData = await safeFetch('/api/student/projects');
        if (projectsData && Array.isArray(projectsData)) {
          console.log('📋 Проєкти студента з API:', projectsData);
          setProjects(projectsData);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Помилка завантаження проєктів з API:', error);
        setProjects([]);
      }

      // Отримуємо досягнення з API
      try {
        const achievementsData = await safeFetch('/api/student/achievements');
        if (achievementsData && Array.isArray(achievementsData)) {
          console.log('📋 Досягнення студента з API:', achievementsData);
          setAchievements(achievementsData);
        } else {
          setAchievements([]);
        }
      } catch (error) {
        console.error('Помилка завантаження досягнень з API:', error);
        setAchievements([]);
      }

      // Отримуємо цілі з API
      try {
        const goalsData = await safeFetch('/api/student/goals');
        if (goalsData && Array.isArray(goalsData)) {
          console.log('📋 Цілі студента з API:', goalsData);
          setGoals(goalsData);
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error('Помилка завантаження цілей з API:', error);
        setGoals([]);
      }

    } catch (error) {
      console.error('Помилка завантаження даних студента з API:', error);
      toast.error(t('profile.alerts.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Отримання даних при завантаженні компонента
  useEffect(() => {
    fetchAllData();
  }, [t]);

  // Функція оновлення даних
  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  const handleSaveInfo = async () => {
    if (!editedInfo) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      // Перевіряємо обов'язкові поля
      if (!editedInfo.group || !editedInfo.course) {
        toast.error(t('profile.alerts.fillRequiredFields'));
        return;
      }

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group: editedInfo.group,
          course: editedInfo.course,
          bio: editedInfo.bio,
          phone: editedInfo.phone,
          linkedin_url: editedInfo.linkedin_url,
          github_url: editedInfo.github_url
        }),
      });

      if (response.ok) {
        const updatedInfo = {
          ...studentInfo!,
          group: editedInfo.group,
          course: editedInfo.course,
          bio: editedInfo.bio,
          phone: editedInfo.phone,
          linkedin_url: editedInfo.linkedin_url,
          github_url: editedInfo.github_url
        };
        
        setStudentInfo(updatedInfo);
        setIsEditingInfo(false);
        
        // Оновлюємо localStorage
        try {
          const userData = {
            id: updatedInfo.id,
            name: updatedInfo.name,
            email: updatedInfo.email,
            phone: updatedInfo.phone || '',
            faculty: updatedInfo.faculty,
            year: updatedInfo.course,
            group: updatedInfo.group || '',
            specialty: updatedInfo.specialty || '',
            specialty_code: updatedInfo.specialty_code || '',
            bio: updatedInfo.bio,
            avatar_url: updatedInfo.avatar_url
          };
          
          localStorage.setItem('currentUser', JSON.stringify(userData));
          console.log('✅ Оновлено localStorage після збереження профілю');
          
          window.dispatchEvent(new CustomEvent('profileUpdated'));
          
        } catch (e) {
          console.error('Помилка оновлення localStorage:', e);
        }
        
        toast.success(t('profile.alerts.infoUpdated'));
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення профілю');
      }
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      toast.error(t('profile.alerts.updateError'));
    }
  };

  // Функції для проєктів
  const handleAddProject = async () => {
    if (newProject.title && newProject.type && newProject.status) {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error(t('profile.alerts.loginRequired'));
          return;
        }

        const response = await fetch('/api/student/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        });

        if (response.ok) {
          const savedProject = await response.json();
          setProjects([...projects, savedProject.project]);
          setNewProject({ 
            title: "", 
            type: "", 
            status: "", 
            description: "",
            technologies: []
          });
          setProjectDialogOpen(false);
          toast.success(t('profile.alerts.projectAdded'));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка додавання проєкту');
        }
      } catch (error) {
        console.error('Помилка додавання проєкту:', error);
        toast.error(t('profile.alerts.projectAddError'));
      }
    } else {
      toast.error(t('profile.alerts.fillRequiredFields'));
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      const response = await fetch(`/api/student/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingProject.title,
          type: editingProject.type,
          status: editingProject.status,
          description: editingProject.description,
          technologies: editingProject.technologies,
          projectUrl: editingProject.projectUrl,
          githubUrl: editingProject.githubUrl,
          startDate: editingProject.startDate,
          endDate: editingProject.endDate
        }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(project => 
          project.id === editingProject.id ? updatedProject.project : project
        ));
        setEditingProject(null);
        toast.success(t('profile.alerts.projectUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення проєкту');
      }
    } catch (error) {
      console.error('Помилка оновлення проєкту:', error);
      toast.error(t('profile.alerts.projectUpdateError'));
    }
  };

  // Функції для досягнень
  const handleAddAchievement = async () => {
    if (newAchievement.title && newAchievement.date) {
      const formattedDate = validateAndFormatDate(newAchievement.date);
      if (!formattedDate) {
        toast.error(t('profile.alerts.invalidDate'));
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          toast.error(t('profile.alerts.loginRequired'));
          return;
        }

        const response = await fetch('/api/student/achievements', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newAchievement,
            date: formattedDate
          }),
        });

        if (response.ok) {
          const savedAchievement = await response.json();
          setAchievements([...achievements, savedAchievement.achievement]);
          setNewAchievement({ title: "", date: "", description: "" });
          setAchievementDialogOpen(false);
          toast.success(t('profile.alerts.achievementAdded'));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка додавання досягнення');
        }
      } catch (error) {
        console.error('Помилка додавання досягнення:', error);
        toast.error(t('profile.alerts.achievementAddError'));
      }
    } else {
      toast.error(t('profile.alerts.fillRequiredFields'));
    }
  };

  const handleEditAchievement = async () => {
    if (!editingAchievement) return;

    const formattedDate = validateAndFormatDate(editingAchievement.date);
    if (!formattedDate) {
      toast.error(t('profile.alerts.invalidDate'));
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      const response = await fetch(`/api/student/achievements/${editingAchievement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingAchievement.title,
          date: formattedDate,
          description: editingAchievement.description,
          type: editingAchievement.type,
          organization: editingAchievement.organization,
          certificateUrl: editingAchievement.certificateUrl
        }),
      });

      if (response.ok) {
        const updatedAchievement = await response.json();
        setAchievements(achievements.map(achievement => 
          achievement.id === editingAchievement.id ? updatedAchievement.achievement : achievement
        ));
        setEditingAchievement(null);
        toast.success(t('profile.alerts.achievementUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення досягнення');
      }
    } catch (error) {
      console.error('Помилка оновлення досягнення:', error);
      toast.error(t('profile.alerts.achievementUpdateError'));
    }
  };

  // Функції для цілей
  const handleAddGoal = async () => {
    if (newGoal.goal && newGoal.deadline) {
      const formattedDeadline = validateAndFormatDate(newGoal.deadline);
      if (!formattedDeadline) {
        toast.error(t('profile.alerts.invalidDate'));
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          toast.error(t('profile.alerts.loginRequired'));
          return;
        }

        const response = await fetch('/api/student/goals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newGoal,
            deadline: formattedDeadline
          }),
        });

        if (response.ok) {
          const savedGoal = await response.json();
          setGoals([...goals, savedGoal.goal]);
          setNewGoal({ 
            goal: "", 
            deadline: "", 
            description: "",
            status: "active",
            priority: "medium",
            progress: 0
          });
          setGoalDialogOpen(false);
          toast.success(t('profile.alerts.goalAdded'));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка додавання цілі');
        }
      } catch (error) {
        console.error('Помилка додавання цілі:', error);
        toast.error(t('profile.alerts.goalAddError'));
      }
    } else {
      toast.error(t('profile.alerts.fillRequiredFields'));
    }
  };

  const handleEditGoal = async () => {
    if (!editingGoal) return;

    const formattedDeadline = validateAndFormatDate(editingGoal.deadline);
    if (!formattedDeadline) {
      toast.error(t('profile.alerts.invalidDate'));
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      const response = await fetch(`/api/student/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: editingGoal.goal,
          deadline: formattedDeadline,
          description: editingGoal.description,
          status: editingGoal.status,
          priority: editingGoal.priority,
          progress: editingGoal.progress
        }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(goals.map(goal => 
          goal.id === editingGoal.id ? updatedGoal.goal : goal
        ));
        setEditingGoal(null);
        toast.success(t('profile.alerts.goalUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка оновлення цілі');
      }
    } catch (error) {
      console.error('Помилка оновлення цілі:', error);
      toast.error(t('profile.alerts.goalUpdateError'));
    }
  };

  // Функції видалення
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      let endpoint = '';
      switch (itemToDelete.type) {
        case "project":
          endpoint = `/api/student/projects/${itemToDelete.id}`;
          break;
        case "achievement":
          endpoint = `/api/student/achievements/${itemToDelete.id}`;
          break;
        case "goal":
          endpoint = `/api/student/goals/${itemToDelete.id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        switch (itemToDelete.type) {
          case "project":
            setProjects(projects.filter((p) => p.id !== itemToDelete.id));
            toast.success(t('profile.alerts.projectDeleted'));
            break;
          case "achievement":
            setAchievements(achievements.filter((a) => a.id !== itemToDelete.id));
            toast.success(t('profile.alerts.achievementDeleted'));
            break;
          case "goal":
            setGoals(goals.filter((g) => g.id !== itemToDelete.id));
            toast.success(t('profile.alerts.goalDeleted'));
            break;
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка видалення');
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
      toast.error(t('profile.alerts.deleteError'));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const startEditingProject = (project: Project) => {
    setEditingProject(project);
  };

  const startEditingAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
  };

  const startEditingGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  // Відображення завантаження
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Завантаження даних з сервера...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-destructive/10 p-4 rounded-lg mb-4">
                <p className="text-destructive font-medium">Не вдалося завантажити профіль</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Перевірте підключення до сервера та авторизацію
                </p>
              </div>
              <Button onClick={refreshData} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Спробувати знову
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Кнопки додавання
  const AddProjectButton = () => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setProjectDialogOpen(true)}
    >
      <Plus className="w-4 h-4 mr-2" />
      Додати проєкт
    </Button>
  );

  const AddAchievementButton = () => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setAchievementDialogOpen(true)}
    >
      <Plus className="w-4 h-4 mr-2" />
      Додати досягнення
    </Button>
  );

  const AddGoalButton = () => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setGoalDialogOpen(true)}
    >
      <Plus className="w-4 h-4 mr-2" />
      Додати ціль
    </Button>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar + Overlay */}
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
            <div className="min-h-screen bg-background">
              <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Заголовок та кнопка оновлення */}
                <div className="mb-10 flex justify-between items-center">
                  <div>
                    <h1 className="text-4xl font-bold mb-3 text-foreground">
                      Мій профіль
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Особиста інформація та академічні досягнення
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Оновити дані
                  </Button>
                </div>

                {/* Статистика - показуємо тільки якщо є дані */}
                {(stats.totalProjects > 0 || stats.totalAchievements > 0 || stats.totalGoals > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {stats.totalProjects > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Проєкти</p>
                          <Badge variant="outline" className="text-xs">
                            {stats.completedProjects}/{stats.totalProjects}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.totalProjects}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.completedProjects} завершено
                        </p>
                      </div>
                    )}

                    {stats.totalAchievements > 0 && (
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Досягнення</p>
                          <Badge variant="outline" className="text-xs">
                            Нові: {achievements.filter(a => {
                              const achievementDate = parseDate(a.date);
                              if (!achievementDate) return false;
                              const monthAgo = new Date();
                              monthAgo.setMonth(monthAgo.getMonth() - 1);
                              return achievementDate > monthAgo;
                            }).length}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.totalAchievements}</p>
                        <p className="text-xs text-muted-foreground">
                          Останнє: {achievements[0] ? formatDate(achievements[0].date) : 'немає'}
                        </p>
                      </div>
                    )}

                    {stats.totalGoals > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Активні цілі</p>
                          <Badge variant="outline" className="text-xs">
                            {stats.averageProgress}% прогрес
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{stats.activeGoals}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.completedGoals} завершено
                        </p>
                      </div>
                    )}

                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Загальна активність</p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                        {stats.totalProjects + stats.totalAchievements + stats.totalGoals}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {studentInfo.updated_at ? `Оновлено: ${formatDate(studentInfo.updated_at)}` : 'Профіль активний'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Особиста інформація */}
                <StudentProfileCard
                  title="Особиста інформація"
                  onEdit={() => setIsEditingInfo(true)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Аватар та основна інформація */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                        <AvatarImage src={studentInfo.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-2xl font-bold">
                          {getInitials(studentInfo.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Соціальні мережі */}
                      {(studentInfo.linkedin_url || studentInfo.github_url) && (
                        <div className="flex gap-2 mt-4">
                          {studentInfo.linkedin_url && (
                            <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                              <a href={studentInfo.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {studentInfo.github_url && (
                            <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                              <a href={studentInfo.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Детальна інформація */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-4">{studentInfo.name}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Електронна пошта
                          </p>
                          <p className="text-lg font-semibold text-primary">{studentInfo.email}</p>
                        </div>

                        {studentInfo.phone && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              Телефон
                            </p>
                            <p className="text-lg font-semibold">{studentInfo.phone}</p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Група
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{studentInfo.group || 'Не вказано'}</p>
                            <Badge variant="outline" className="text-xs">
                              {studentInfo.course} курс
                            </Badge>
                          </div>
                        </div>

                        {studentInfo.specialty && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              Спеціальність
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-semibold">
                                {studentInfo.specialty_code && (
                                  <Badge variant="secondary" className="mr-2">
                                    {studentInfo.specialty_code}
                                  </Badge>
                                )}
                                {studentInfo.specialty}
                              </p>
                            </div>
                          </div>
                        )}

                        {studentInfo.faculty && (
                          <div className="space-y-1 md:col-span-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Факультет
                            </p>
                            <p className="text-lg font-semibold">{studentInfo.faculty}</p>
                            {studentInfo.department && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {studentInfo.department}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Біографія */}
                      {studentInfo.bio && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Про себе
                          </p>
                          <p className="text-base leading-relaxed bg-muted/30 p-4 rounded-lg border">
                            {studentInfo.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </StudentProfileCard>

                {/* Проєкти */}
                <StudentProfileCard 
                  title="Мої проєкти"
                  actionButton={<AddProjectButton />}
                >
                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає проєктів</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свій перший проєкт, щоб показати свої навички
                        </p>
                        <AddProjectButton />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="group p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                                    {project.title}
                                  </h4>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {project.type}
                                    </Badge>
                                    <Badge className={`text-xs ${getStatusColor(project.status)} flex items-center gap-1`}>
                                      {getStatusIcon(project.status)}
                                      {project.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingProject(project)}
                                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog("project", project.id)}
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {project.description}
                            </p>
                            
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
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
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              {project.startDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(project.startDate)}
                                </div>
                              )}
                              <div className="flex gap-2">
                                {project.githubUrl && (
                                  <a 
                                    href={project.githubUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                  >
                                    <Github className="h-3 w-3" />
                                  </a>
                                )}
                                {project.projectUrl && (
                                  <a 
                                    href={project.projectUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </StudentProfileCard>

                {/* Досягнення */}
                <StudentProfileCard 
                  title="Мої досягнення"
                  actionButton={<AddAchievementButton />}
                >
                  <div className="space-y-4">
                    {achievements.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає досягнень</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свої досягнення, сертифікати та нагороди
                        </p>
                        <AddAchievementButton />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="group p-4 bg-card rounded-xl border border-border hover:border-yellow-300 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm group-hover:text-yellow-600 transition-colors">
                                    {achievement.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
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
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingAchievement(achievement)}
                                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog("achievement", achievement.id)}
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {achievement.description}
                            </p>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              {achievement.organization && (
                                <span className="font-medium">{achievement.organization}</span>
                              )}
                              {achievement.certificateUrl && (
                                <a 
                                  href={achievement.certificateUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Сертифікат
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </StudentProfileCard>

                {/* Цілі */}
                <StudentProfileCard 
                  title="Мої цілі"
                  actionButton={<AddGoalButton />}
                >
                  <div className="space-y-4">
                    {goals.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає цілей</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Поставте собі цілі для професійного розвитку
                        </p>
                        <AddGoalButton />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            className="group p-4 bg-card rounded-xl border border-border hover:border-green-300 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm group-hover:text-green-600 transition-colors">
                                    {goal.goal}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`text-xs ${getStatusColor(goal.status)} flex items-center gap-1`}>
                                      {getStatusIcon(goal.status)}
                                      {goal.status}
                                    </Badge>
                                    <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>
                                      {goal.priority}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingGoal(goal)}
                                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog("goal", goal.id)}
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Прогрес:</span>
                                <span className="font-medium">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {goal.description}
                            </p>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Дедлайн: {formatDate(goal.deadline)}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Створено: {formatDate(goal.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </StudentProfileCard>

                {/* Edit Info Dialog */}
                <Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Редагування профілю</DialogTitle>
                    </DialogHeader>
                    {editedInfo && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Заблоковані поля */}
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">ПІБ</Label>
                            <Input
                              id="edit-name"
                              value={editedInfo.name}
                              disabled
                              className="bg-muted text-muted-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Електронна пошта</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={editedInfo.email}
                              disabled
                              className="bg-muted text-muted-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-faculty">Факультет</Label>
                            <Input
                              id="edit-faculty"
                              value={editedInfo.faculty}
                              disabled
                              className="bg-muted text-muted-foreground"
                            />
                          </div>

                          {editedInfo.specialty && (
                            <div className="space-y-2">
                              <Label htmlFor="edit-specialty">Спеціальність</Label>
                              <Input
                                id="edit-specialty"
                                value={`${editedInfo.specialty_code || ''} ${editedInfo.specialty}`}
                                disabled
                                className="bg-muted text-muted-foreground"
                              />
                            </div>
                          )}

                          {/* Поля для редагування */}
                          <div className="space-y-2">
                            <Label htmlFor="edit-group">Група *</Label>
                            <Input
                              id="edit-group"
                              placeholder="Наприклад: КН-41"
                              value={editedInfo.group}
                              onChange={(e) =>
                                setEditedInfo({ ...editedInfo, group: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-course">Курс *</Label>
                            <Input
                              id="edit-course"
                              type="number"
                              min="1"
                              max="6"
                              placeholder="1-6"
                              value={editedInfo.course}
                              onChange={(e) =>
                                setEditedInfo({ ...editedInfo, course: parseInt(e.target.value) || 1 })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-phone">Телефон</Label>
                            <Input
                              id="edit-phone"
                              placeholder="+380123456789"
                              value={editedInfo.phone || ""}
                              onChange={(e) =>
                                setEditedInfo({ ...editedInfo, phone: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-linkedin">LinkedIn</Label>
                            <Input
                              id="edit-linkedin"
                              placeholder="https://linkedin.com/in/username"
                              value={editedInfo.linkedin_url || ""}
                              onChange={(e) =>
                                setEditedInfo({ ...editedInfo, linkedin_url: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-github">GitHub</Label>
                            <Input
                              id="edit-github"
                              placeholder="https://github.com/username"
                              value={editedInfo.github_url || ""}
                              onChange={(e) =>
                                setEditedInfo({ ...editedInfo, github_url: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-bio">Про себе</Label>
                          <Textarea
                            id="edit-bio"
                            placeholder="Розкажіть про свої інтереси, навички та досвід..."
                            value={editedInfo.bio}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, bio: e.target.value })
                            }
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-2">
                          <DialogClose asChild>
                            <Button variant="outline" className="flex-1">
                              Скасувати
                            </Button>
                          </DialogClose>
                          <Button onClick={handleSaveInfo} className="flex-1">
                            Зберегти зміни
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Діалог додавання/редагування проєкту */}
                <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProject ? 'Редагувати проєкт' : 'Додати проєкт'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-title">Назва проєкту *</Label>
                        <Input
                          id="project-title"
                          value={editingProject?.title || newProject.title}
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({ ...editingProject, title: e.target.value })
                              : setNewProject({ ...newProject, title: e.target.value })
                          }
                          placeholder="Мій проєкт"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-type">Тип проєкту *</Label>
                        <Input
                          id="project-type"
                          placeholder="Веб-додаток, Мобільний додаток, Дослідження"
                          value={editingProject?.type || newProject.type}
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({ ...editingProject, type: e.target.value })
                              : setNewProject({ ...newProject, type: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-status">Статус *</Label>
                        <select
                          id="project-status"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={editingProject?.status || newProject.status}
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({ ...editingProject, status: e.target.value })
                              : setNewProject({ ...newProject, status: e.target.value })
                          }
                        >
                          <option value="">Виберіть статус</option>
                          <option value="в процесі">В процесі</option>
                          <option value="завершено">Завершено</option>
                          <option value="планується">Планується</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-description">Опис</Label>
                        <Textarea
                          id="project-description"
                          placeholder="Опишіть ваш проєкт..."
                          value={editingProject?.description || newProject.description}
                          onChange={(e) =>
                            editingProject
                              ? setEditingProject({ ...editingProject, description: e.target.value })
                              : setNewProject({ ...newProject, description: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            Скасувати
                          </Button>
                        </DialogClose>
                        <Button 
                          onClick={editingProject ? handleEditProject : handleAddProject} 
                          className="flex-1"
                        >
                          {editingProject ? 'Зберегти зміни' : 'Додати проєкт'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Діалог додавання/редагування досягнення */}
                <Dialog open={achievementDialogOpen} onOpenChange={setAchievementDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAchievement ? 'Редагувати досягнення' : 'Додати досягнення'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="achievement-title">Назва досягнення *</Label>
                        <Input
                          id="achievement-title"
                          value={editingAchievement?.title || newAchievement.title}
                          onChange={(e) =>
                            editingAchievement
                              ? setEditingAchievement({ ...editingAchievement, title: e.target.value })
                              : setNewAchievement({ ...newAchievement, title: e.target.value })
                          }
                          placeholder="Перемога на конкурсі"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="achievement-date">Дата *</Label>
                        <Input
                          id="achievement-date"
                          type="date"
                          value={editingAchievement?.date || newAchievement.date}
                          onChange={(e) =>
                            editingAchievement
                              ? setEditingAchievement({ ...editingAchievement, date: e.target.value })
                              : setNewAchievement({ ...newAchievement, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="achievement-description">Опис</Label>
                        <Textarea
                          id="achievement-description"
                          placeholder="Опишіть ваше досягнення..."
                          value={editingAchievement?.description || newAchievement.description}
                          onChange={(e) =>
                            editingAchievement
                              ? setEditingAchievement({ ...editingAchievement, description: e.target.value })
                              : setNewAchievement({ ...newAchievement, description: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            Скасувати
                          </Button>
                        </DialogClose>
                        <Button 
                          onClick={editingAchievement ? handleEditAchievement : handleAddAchievement} 
                          className="flex-1"
                        >
                          {editingAchievement ? 'Зберегти зміни' : 'Додати досягнення'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Діалог додавання/редагування цілі */}
                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingGoal ? 'Редагувати ціль' : 'Додати ціль'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-name">Назва цілі *</Label>
                        <Input
                          id="goal-name"
                          value={editingGoal?.goal || newGoal.goal}
                          onChange={(e) =>
                            editingGoal
                              ? setEditingGoal({ ...editingGoal, goal: e.target.value })
                              : setNewGoal({ ...newGoal, goal: e.target.value })
                          }
                          placeholder="Вивчити нову технологію"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline">Дедлайн *</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={editingGoal?.deadline || newGoal.deadline}
                          onChange={(e) =>
                            editingGoal
                              ? setEditingGoal({ ...editingGoal, deadline: e.target.value })
                              : setNewGoal({ ...newGoal, deadline: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-progress">Прогрес (%)</Label>
                        <Input
                          id="goal-progress"
                          type="number"
                          min="0"
                          max="100"
                          value={editingGoal?.progress || newGoal.progress}
                          onChange={(e) =>
                            editingGoal
                              ? setEditingGoal({ ...editingGoal, progress: parseInt(e.target.value) || 0 })
                              : setNewGoal({ ...newGoal, progress: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-description">Опис</Label>
                        <Textarea
                          id="goal-description"
                          placeholder="Опишіть вашу ціль..."
                          value={editingGoal?.description || newGoal.description}
                          onChange={(e) =>
                            editingGoal
                              ? setEditingGoal({ ...editingGoal, description: e.target.value })
                              : setNewGoal({ ...newGoal, description: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            Скасувати
                          </Button>
                        </DialogClose>
                        <Button 
                          onClick={editingGoal ? handleEditGoal : handleAddGoal} 
                          className="flex-1"
                        >
                          {editingGoal ? 'Зберегти зміни' : 'Додати ціль'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Підтвердіть видалення</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію не можна скасувати. Елемент буде видалений назавжди.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}