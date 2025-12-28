// AIAssistant.tsx
import { useState, useEffect } from 'react';
import {
  Zap,
  FileText,
  Lightbulb,
  Search,
  CheckCircle,
  Copy,
  Sparkles,
  Crown,
  User,
  BookOpen,
  Target,
  Send,
  X,
  BarChart3,
  AlertTriangle,
  ThumbsUp,
  Edit3,
  GraduationCap,
  Star,
  Mail,
  Clock,
  Info,
  Users,
  Calendar,
  Phone,
  Building,
  Eye,
  Maximize2,
  Minimize2,
  Award,
  Check,
  Info as InfoIcon,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { TeacherProfileModal } from '@/components/TeacherProfileModal';

// Імпорт типів
import type { 
  SuggestedTopic, 
  AIFeature, 
  StructureItem,
  TextAnalysisResult 
} from '../types/types';

// Тип для форми заявки
interface ApplicationFormData {
  topic: string;
  description: string;
  goals: string;
  requirements: string;
  teacherId?: string;
  deadline: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_program?: string;
  student_year?: string;
  student_group?: string;
  student_id?: string;
  workType: 'coursework' | 'diploma' | 'practice';
  student_specialty_id?: number;
  student_specialty_code?: string;
  student_faculty_id?: number;
}

// Типи для пошуку викладачів
interface AvailablePlaceDetail {
  id: string;
  type: 'coursework' | 'diploma' | 'practice';
  availableSpots: number;
  course: number;
  specialty_id: number;
  specialty_name?: string;
  specialty_code?: string;
  faculty_id?: number;
  faculty_name?: string;
  max_students?: number;
  current_students?: number;
  requirements?: string;
  description?: string;
  matchScore?: number;
  isExactMatch?: boolean;
  available_spots?: number;
}

interface TeacherAvailablePlaces {
  totalAvailable: number;
  coursework: number;
  diploma: number;
  practice?: number;
  details?: AvailablePlaceDetail[];
}

interface TeacherMatch {
  teacher: {
    id: string;
    name: string;
    title: string;
    department: string;
    faculty: string;
    facultyId?: number;
    bio: string;
    avatarUrl: string | null;
    email: string;
    officeHours: string;
    phone: string;
    website: string;
    skills: string[];
    rating: number;
    studentCount: number;
    projectsCompleted: number;
    isAvailable: boolean;
    expertise: string[];
  };
  relevanceScore: number;
  matchCount: number;
  searchResults: Array<{
    type: 'skill' | 'work' | 'direction' | 'future_topic';
    id: string;
    title: string;
    description: string;
    subtype?: string;
    year?: number;
  }>;
  matchBreakdown: {
    skills: number;
    works: number;
    directions: number;
    topics: number;
  };
  detailedRelevance: {
    skills: number;
    works: number;
    directions: number;
    topics: number;
  };
  availablePlaces?: TeacherAvailablePlaces;
  studentFilters?: {
    specialtyId?: number;
    specialtyCode?: string;
    course?: number;
    facultyId?: number;
  };
}

// Розширений тип для теми з рекомендованими викладачами
interface SuggestedTopicWithTeachers extends SuggestedTopic {
  teacherMatches?: TeacherMatch[];
  showTeachers?: boolean;
  error?: string;
  workType?: 'coursework' | 'diploma' | 'practice';
  originalTitle?: string;
  topicComplexity?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  prerequisites?: string[];
  technologies?: string[];
}

// Тип для PremiumSuggestion
interface PremiumSuggestion {
  id: string;
  type: string;
  title: string;
  description?: string;
  topic_description?: string;
  relevance: number;
  url?: string;
  work_type?: string;
  year?: number;
  workType?: 'coursework' | 'diploma' | 'practice';
  teacherId?: string;
  teacherName?: string;
}

// Тип для інформації про студента
interface StudentInfo {
  name: string;
  email: string;
  phone?: string;
  program?: string;
  year?: string;
  group?: string;
  id?: string;
  bio?: string;
  specialty_id?: number;
  specialty_code?: string;
  specialty_name?: string;
  faculty_id?: number;
  faculty_name?: string;
}

// Тип для детальної інформації про студента
interface CompleteStudentInfo extends StudentInfo {
  course?: number;
}

// Функція для отримання токену автентифікації
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token');
  }
  return null;
};

// Функція для перевірки автентифікації
const checkAuthentication = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return true;
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      return false;
    }
  } catch {
    return false;
  }
};

// Функція для отримання faculty_id з токена
const getFacultyIdFromToken = (): number | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const facultyId = payload.facultyId || 
                     payload.faculty_id || 
                     payload.faculty ||
                     payload.user?.faculty_id ||
                     payload.user?.facultyId;
    
    if (facultyId) {
      return parseInt(facultyId);
    }
    
    return null;
  } catch {
    return null;
  }
};

// Функція для отримання назви факультету
const getFacultyName = async (facultyId: number): Promise<string> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/faculties/${facultyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.faculty?.name || `Факультет #${facultyId}`;
    }
    return `Факультет #${facultyId}`;
  } catch {
    return `Факультет #${facultyId}`;
  }
};

// Функція для отримання повних даних користувача
const getCurrentUserWithFaculty = async (): Promise<{ faculty_id: number } | null> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch('/api/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    
    const data = await response.json();
    const facultyId = data.user?.faculty_id || 
                     data.user?.facultyId || 
                     data.faculty_id ||
                     data.facultyId ||
                     data.user?.department?.faculty_id ||
                     data.department?.faculty_id;

    if (facultyId) {
      return { faculty_id: parseInt(facultyId) };
    }
    
    return null;
  } catch {
    return null;
  }
};

// Функція для отримання повної інформації про студента
const getCompleteStudentInfo = async (): Promise<CompleteStudentInfo | null> => {
  try {
    // Спочатку пробуємо отримати з localStorage (оновленого з ProfilePage)
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        if (userData.name && userData.name.trim() !== '') {
          console.log('📋 Дані студента з localStorage:', userData);
          const completeInfo: CompleteStudentInfo = {
            name: userData.name,
            email: userData.email || '',
            phone: userData.phone || '',
            program: userData.program || userData.specialization || '',
            year: userData.year || userData.course || '',
            course: userData.course ? parseInt(userData.course) : 
                   userData.year ? parseInt(userData.year) : undefined,
            group: userData.group || '',
            id: userData.id || userData.userId || '',
            bio: userData.bio || '',
            specialty_id: userData.specialty_id || undefined,
            specialty_code: userData.specialty_code || '',
            specialty_name: userData.specialty_name || userData.specialty || '',
            faculty_id: userData.faculty_id || undefined,
            faculty_name: userData.faculty_name || userData.faculty || ''
          };
          
          return completeInfo;
        }
      }
    } catch {
      console.log('LocalStorage data not available or invalid');
    }

    // Якщо в localStorage немає даних, робимо API запит
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    console.log('🔍 Fetching complete student info from API...');
    
    // Спершу пробуємо /api/student/profile (як у ProfilePage)
    let studentData = null;
    
    try {
      const profileResponse = await fetch('/api/student/profile', {
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
          specialty_id: profileData.specialty_id || profileData.user?.specialty_id || undefined,
          faculty_id: profileData.faculty_id || profileData.user?.faculty_id || undefined,
          faculty_name: profileData.faculty || profileData.faculty_name || profileData.user?.faculty_name || ""
        };
      }
    } catch (error) {
      console.error('❌ Помилка при отриманні профілю з API:', error);
    }

    // Якщо не вдалося отримати з /api/student/profile, пробуємо /api/current-user
    if (!studentData) {
      try {
        const response = await fetch('/api/current-user', {
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
            specialty_id: data.user?.specialty_id || data.specialty_id || undefined,
            faculty_id: data.user?.faculty_id || data.faculty_id || undefined,
            faculty_name: data.user?.faculty || data.faculty || data.faculty_name || ""
          };
        }
      } catch (error) {
        console.error('❌ Помилка при отриманні поточного користувача з API:', error);
      }
    }
    
    if (studentData) {
      console.log('✅ Оброблені дані студента з API:', studentData);
      
      // Формуємо повну інформацію
      const completeInfo: CompleteStudentInfo = {
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone || '',
        program: studentData.specialty || '',
        year: studentData.course ? studentData.course.toString() : '',
        course: studentData.course,
        group: studentData.group || '',
        id: studentData.id,
        bio: studentData.bio || '',
        specialty_id: studentData.specialty_id,
        specialty_code: studentData.specialty_code || '',
        specialty_name: studentData.specialty || '',
        faculty_id: studentData.faculty_id,
        faculty_name: studentData.faculty_name || studentData.faculty || ''
      };

      // Зберігаємо в localStorage для подальшого використання
      try {
        localStorage.setItem('currentUser', JSON.stringify(completeInfo));
        console.log('✅ Оновлено localStorage з даними API');
      } catch (e) {
        console.error('Помилка збереження в localStorage:', e);
      }
      
      return completeInfo;
    } else {
      console.log('❌ Дані студента не знайдено в API');
      return null;
    }
  } catch (error) {
    console.error('❌ Помилка отримання інформації студента:', error);
    return null;
  }
};

// Функція для отримання оновлених даних студента
const getUpdatedStudentInfo = async (): Promise<CompleteStudentInfo | null> => {
  try {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        if (userData.name && userData.name !== 'Студент' && userData.name.trim() !== '') {
          return {
            ...userData,
            course: userData.course ? parseInt(userData.course) : undefined,
            specialty_id: userData.specialty_id ? parseInt(userData.specialty_id) : undefined,
            faculty_id: userData.faculty_id ? parseInt(userData.faculty_id) : undefined
          };
        }
      }
    } catch {
      console.log('LocalStorage data not available or invalid');
    }

    return await getCompleteStudentInfo();
  } catch (error) {
    console.error('❌ Error fetching updated student info:', error);
    return null;
  }
};


// API клієнт для обробки запитів
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(endpoint, config);
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    throw new Error('Authentication required. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Функція для отримання дедлайну за замовчуванням за типом роботи
const getDefaultDeadlineByType = (workType: 'coursework' | 'diploma' | 'practice'): string => {
  const date = new Date();
  
  switch(workType) {
    case 'practice':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'coursework':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'diploma':
      date.setMonth(date.getMonth() + 6);
      break;
    default:
      date.setMonth(date.getMonth() + 3);
  }
  
  // Повертаємо у форматі YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Функція для форматування дати в українському форматі
const formatDateUA = (dateString: string): string => {
  if (!dateString) return 'Не вказано';
  
  try {
    // Перевірка формату
    let date: Date;
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Формат YYYY-MM-DD
      date = new Date(dateString);
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      // Формат DD.MM.YYYY
      const [day, month, year] = dateString.split('.');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // Спробуємо стандартний парсинг
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'Не вказано';
    }
    
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Помилка форматування дати:', error);
    return 'Не вказано';
  }
};

// Функція для визначення типу роботи за темою
const determineWorkTypeFromTopic = (topic: string): 'coursework' | 'diploma' | 'practice' => {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('практик') || topicLower.includes('звіт') || 
      topicLower.includes('стажування') || topicLower.includes('впровадження') ||
      topicLower.includes('відділ') || topicLower.includes('компані')) {
    return 'practice';
  } else if (topicLower.includes('диплом') || topicLower.includes('магістер') || 
             topicLower.includes('кваліфікаційна') || topicLower.includes('випускна') ||
             topicLower.includes('бакалавр') || topicLower.includes('випускна кваліфікаційна')) {
    return 'diploma';
  } else {
    return 'coursework';
  }
};

// Функція для очищення заголовка теми від зайвих частин
const cleanTopicTitle = (title: string): string => {
  if (!title) return title;
  
  let cleanTitle = title;
  
  const patterns = [
    /^Курсова робота\s*(Дедлайн:\s*\d{4}-\d{2}-\d{2})?\s*[-—:]\s*/i,
    /^Курсова робота:\s*/i,
    /^Курсова робота\s*[-—]\s*/i,
    /^Дипломний проект\s*(Дедлайн:\s*\d{4}-\d{2}-\d{2})?\s*[-—:]\s*/i,
    /^Дипломний проект:\s*/i,
    /^Дипломний проект\s*[-—]\s*/i,
    /^Дипломна робота\s*(Дедлайн:\s*\d{4}-\d{2}-\d{2})?\s*[-—:]\s*/i,
    /^Дипломна робота:\s*/i,
    /^Звіт з практики\s*(Дедлайн:\s*\d{4}-\d{2}-\d{2})?\s*[-—:]\s*/i,
    /^Звіт з практики:\s*/i,
    /^Звіт з практики\s*[-—]\s*/i,
    /^Бакалаврська робота\s*(Дедлайн:\s*\d{4}-\d{2}-\d{2})?\s*[-—:]\s*/i,
    /^Магістерська робота\s*(Дедлайн:\s*\d{4}-\d{2}-\d{2})?\s*[-—:]\s*/i,
    /^Тема:\s*/i,
    /^Тема\s*[-—]\s*/i,
  ];
  
  patterns.forEach(pattern => {
    cleanTitle = cleanTitle.replace(pattern, '');
  });
  
  cleanTitle = cleanTitle.replace(/\s*Дедлайн:\s*\d{4}-\d{2}-\d{2}$/i, '');
  cleanTitle = cleanTitle.replace(/\s*\(Дедлайн:\s*\d{4}-\d{2}-\d{2}\)\s*/i, '');
  cleanTitle = cleanTitle.replace(/\s*\[Дедлайн:\s*\d{4}-\d{2}-\d{2}\]\s*/i, '');
  
  cleanTitle = cleanTitle.replace(/^[\s\-—:]+/, '').replace(/[\s\-—:]+$/, '');
  
  return cleanTitle.trim() || title;
};

// Функція для отримання мітки типу роботи
const getWorkTypeLabel = (workType: 'coursework' | 'diploma' | 'practice'): string => {
  switch(workType) {
    case 'coursework':
      return 'Курсова робота';
    case 'diploma':
      return 'Дипломний проєкт';
    case 'practice':
      return 'Звіт з практики';
    default:
      return 'Курсова робота';
  }
};

// Функція для отримання кольору типу роботи
const getWorkTypeColor = (workType: 'coursework' | 'diploma' | 'practice'): string => {
  switch(workType) {
    case 'coursework':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
    case 'diploma':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
    case 'practice':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
  }
};

// ОНОВЛЕНИЙ КОМПОНЕНТ КАРТКИ ВИКЛАДАЧА
const EnhancedTeacherCard = ({ 
  match, 
  topic,
  onSelect,
  onViewProfile,
  showAvailability = true,
  studentInfo,
}: { 
  match: TeacherMatch;
  topic: SuggestedTopicWithTeachers;
  onSelect: () => void;
  onViewProfile: (teacherId: string) => void;
  showAvailability?: boolean;
  studentInfo: CompleteStudentInfo | null;
  showAllPlaces?: boolean;
}) => {
  const { t } = useTranslation();
  const teacher = match.teacher;
  const [showDetails, setShowDetails] = useState(false);
  
  const getInitials = (name: string): string => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTeacherEmail = () => {
    if (teacher.email && teacher.email.includes('@') && teacher.email.includes('.')) {
      return teacher.email;
    }
    return 'email@lnu.edu.ua';
  };

  const getTeacherTitle = () => {
    return teacher.title || t('aiAssistant.teachers.defaultTitle');
  };

  const getTeacherDepartment = () => {
    return teacher.department || t('aiAssistant.teachers.defaultDepartment');
  };

  // Отримуємо інформацію про доступні місця
  const availableSpots = (() => {
    if (!match.availablePlaces || !match.availablePlaces.details) return null;
    
    const type = topic.workType || 'coursework';
    const filteredDetails = match.availablePlaces.details.filter(detail => 
      detail.type === type
    );
    
    const totalSpots = filteredDetails.reduce((sum, detail) => sum + detail.availableSpots, 0);
    
    return {
      count: totalSpots,
      type: type === 'coursework' ? 'курсових' : 
            type === 'diploma' ? 'дипломних' : 
            'звітів з практики',
      label: getWorkTypeLabel(type),
      details: filteredDetails
    };
  })();

  const hasAnyAvailableSpots = availableSpots && availableSpots.count > 0;

  const handleViewFullProfile = () => {
    if (!teacher.id) {
      toast.error(t('aiAssistant.teachers.profileError'));
      return;
    }
    
    const cleanTeacherId = teacher.id.toString().replace(/[^a-zA-Z0-9-_]/g, '');
    
    if (!cleanTeacherId) {
      toast.error('Некоректний ID викладача');
      return;
    }

    console.log('Відкриття профілю викладача з ID:', cleanTeacherId);
    onViewProfile(cleanTeacherId);
  };

  return (
    <Card key={teacher.id} className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="w-16 h-16 border-2 border-primary/20 cursor-pointer" onClick={handleViewFullProfile}>
              <AvatarImage src={teacher.avatarUrl || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg hover:bg-primary/20 transition-colors">
                {getInitials(teacher.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="font-bold text-xl text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={handleViewFullProfile}
                >
                  {teacher.name}
                </h3>
                <div className={`w-2 h-2 rounded-full ${
                  teacher.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <Badge variant="secondary" className="ml-2">
                  {match.relevanceScore}%
                </Badge>
              </div>
              
              <p className="text-primary font-medium mb-1">{getTeacherTitle()}</p>
              <p className="text-sm text-muted-foreground truncate">
                {getTeacherDepartment()}
              </p>
            </div>
          </div>
        </div>

        {/* Навички */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {teacher.expertise.slice(0, 3).map((exp, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {exp}
              </Badge>
            ))}
            {teacher.expertise.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{teacher.expertise.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
              <Star className="w-4 h-4 text-yellow-500" />
              {teacher.rating}/5
            </div>
            <p className="text-xs text-muted-foreground">Рейтинг</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
              <Users className="w-4 h-4 text-blue-500" />
              {teacher.studentCount}
            </div>
            <p className="text-xs text-muted-foreground">Студентів</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {teacher.projectsCompleted}
            </div>
            <p className="text-xs text-muted-foreground">Проектів</p>
          </div>
        </div>

        {/* Доступні місця */}
        {showAvailability && availableSpots && (
          <div className="mb-4 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Доступні місця:</span>
              </div>
              <Badge variant={hasAnyAvailableSpots ? "default" : "secondary"}>
                {hasAnyAvailableSpots ? `${availableSpots.count} ${availableSpots.type}` : 'Немає'}
              </Badge>
            </div>
            
            {studentInfo && hasAnyAvailableSpots && (
              <div className="text-xs text-muted-foreground">
                {availableSpots.details.some(d => 
                  d.specialty_id === studentInfo.specialty_id && 
                  d.course === studentInfo.course
                ) ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" />
                    Є місця для вашої спеціальності та курсу
                  </div>
                ) : (
                  <div className="text-amber-600">
                    Можливо, потрібно обговорити з викладачем
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Контакти */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{getTeacherEmail()}</span>
          </div>
          {teacher.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{teacher.phone}</span>
            </div>
          )}
          {teacher.officeHours && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{teacher.officeHours}</span>
            </div>
          )}
        </div>

        {/* Кнопки дій */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleViewFullProfile}
          >
            Переглянути профіль
          </Button>
          <Button
            className="flex-1"
            onClick={onSelect}
          >
            Обрати
          </Button>
        </div>

        {/* Кнопка деталей */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs text-muted-foreground hover:text-primary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <Minimize2 className="w-3 h-3 mr-1" />
              Приховати деталі
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 mr-1" />
              Показати більше
            </>
          )}
        </Button>

        {/* Детальна інформація */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {/* Детальні навички */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <Award className="w-4 h-4" />
                Експертиза
              </h5>
              <div className="flex flex-wrap gap-1">
                {teacher.expertise.map((exp: string, expIndex: number) => (
                  <Badge 
                    key={expIndex} 
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary"
                  >
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Навички */}
            {teacher.skills && teacher.skills.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Навички
                </h5>
                <div className="flex flex-wrap gap-1">
                  {teacher.skills.map((skill: string, skillIndex: number) => (
                    <Badge 
                      key={skillIndex} 
                      variant="outline"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AIAssistant = () => {
  const { t } = useTranslation();

  const [ideaInput, setIdeaInput] = useState<string>('');
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopicWithTeachers[]>([]);
  const [premiumSuggestions, setPremiumSuggestions] = useState<PremiumSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState<boolean>(false);
  const [loadingTeachersForTopic, setLoadingTeachersForTopic] = useState<string | null>(null);
  const [userFacultyId, setUserFacultyId] = useState<number | null>(null);
  const [userFacultyName, setUserFacultyName] = useState<string>('');
  const [studentInfo, setStudentInfo] = useState<CompleteStudentInfo | null>(null);

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [generatedStructure, setGeneratedStructure] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [analysisText, setAnalysisText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
  const [applicationFormData, setApplicationFormData] = useState<ApplicationFormData>({
    topic: '',
    description: '',
    goals: '',
    requirements: '',
    deadline: getDefaultDeadlineByType('coursework'),
    student_name: '',
    student_email: '',
    student_phone: '',
    student_program: '',
    student_year: '',
    student_group: '',
    student_id: '',
    workType: 'coursework',
    student_specialty_id: undefined,
    student_specialty_code: '',
    student_faculty_id: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState<boolean>(false);

  const [sortBy] = useState<'relevance' | 'availability' | 'rating'>('relevance');

  const aiFeatures: AIFeature[] = [
    {
      icon: FileText,
      title: t('aiAssistant.features.structure.title'),
      description: t('aiAssistant.features.structure.description'),
      status: 'active'
    },
    {
      icon: Lightbulb,
      title: t('aiAssistant.features.topics.title'),
      description: t('aiAssistant.features.topics.description'),
      status: 'active'
    },
    {
      icon: BarChart3,
      title: t('aiAssistant.features.analysis.title'),
      description: t('aiAssistant.features.analysis.description'),
      status: 'active'
    }
  ];

  // Функція для відкриття модального вікна викладача
  const openTeacherModal = (teacherId: string) => {
    console.log('Відкриття профілю викладача з ID:', teacherId);
    setSelectedTeacherId(teacherId);
    setTeacherModalOpen(true);
  };

  // Перевірка автентифікації та отримання даних при завантаженні компонента
  useEffect(() => {
    const initializeUserData = async () => {
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        return;
      }

      // Отримуємо повну інформацію про студента
      const studentData = await getUpdatedStudentInfo();
      if (studentData) {
        setStudentInfo(studentData);
      }

      const facultyIdFromToken = getFacultyIdFromToken();
      if (facultyIdFromToken) {
        setUserFacultyId(facultyIdFromToken);
        const facultyName = await getFacultyName(facultyIdFromToken);
        setUserFacultyName(facultyName);
        return;
      }

      const userData = await getCurrentUserWithFaculty();
      if (userData && userData.faculty_id) {
        setUserFacultyId(userData.faculty_id);
        const facultyName = await getFacultyName(userData.faculty_id);
        setUserFacultyName(facultyName);
      } else {
        setUserFacultyName(t('aiAssistant.faculty.notSet'));
      }
    };
    
    initializeUserData();
  }, []);

  // Синхронізація даних профілю при відкритті форми
  useEffect(() => {
    const loadStudentProfileForForm = async () => {
      if (showApplicationForm) {
        try {
          const studentInfo = await getUpdatedStudentInfo();
          if (studentInfo) {
            setApplicationFormData(prev => ({
              ...prev,
              student_name: studentInfo.name,
              student_email: studentInfo.email,
              student_phone: studentInfo.phone || '',
              student_program: studentInfo.program || '',
              student_year: studentInfo.year || '',
              student_group: studentInfo.group || '',
              student_id: studentInfo.id || '',
              student_specialty_id: studentInfo.specialty_id,
              student_specialty_code: studentInfo.specialty_code || '',
              student_faculty_id: studentInfo.faculty_id
            }));
          }
        } catch (error) {
          console.error('Помилка завантаження профілю студента:', error);
        }
      }
    };

    loadStudentProfileForForm();
  }, [showApplicationForm]);

  // Оновлення дедлайну при зміні типу роботи
  useEffect(() => {
    if (showApplicationForm && applicationFormData.workType) {
      const newDeadline = getDefaultDeadlineByType(applicationFormData.workType);
      setApplicationFormData(prev => ({
        ...prev,
        deadline: newDeadline
      }));
    }
  }, [applicationFormData.workType, showApplicationForm]);

  // Слухач для оновлення профілю
  useEffect(() => {
    const handleProfileUpdate = () => {
      getUpdatedStudentInfo().then(studentInfo => {
        if (studentInfo) {
          setStudentInfo(studentInfo);
          if (showApplicationForm) {
            setApplicationFormData(prev => ({
              ...prev,
              student_name: studentInfo.name,
              student_email: studentInfo.email,
              student_phone: studentInfo.phone || '',
              student_program: studentInfo.program || '',
              student_year: studentInfo.year || '',
              student_group: studentInfo.group || '',
              student_specialty_id: studentInfo.specialty_id,
              student_specialty_code: studentInfo.specialty_code || '',
              student_faculty_id: studentInfo.faculty_id
            }));
          }
          toast.info('Дані профілю оновлено');
        }
      });
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [showApplicationForm]);

  // Функція для сортування викладачів
  const sortTeachers = (teachers: TeacherMatch[], workType?: 'coursework' | 'diploma' | 'practice') => {
    return [...teachers].sort((a, b) => {
      const type = workType || 'coursework';
      
      // Якщо у обох релевантність 0, сортуємо за іншими критеріями
      if (a.relevanceScore === 0 && b.relevanceScore === 0) {
        // Спершу за доступними місцями
        const getAvailableSpots = (teacher: TeacherMatch) => {
          if (!teacher.availablePlaces || !teacher.availablePlaces.details) return 0;
          return teacher.availablePlaces.details
            .filter(detail => detail.type === type)
            .reduce((sum, detail) => sum + detail.availableSpots, 0);
        };
        
        const aSpots = getAvailableSpots(a);
        const bSpots = getAvailableSpots(b);
        
        if (bSpots !== aSpots) return bSpots - aSpots;
        
        // Потім за рейтингом
        return (b.teacher.rating || 0) - (a.teacher.rating || 0);
      }
      
      switch(sortBy) {
        case 'availability': {
          // Спершу за кількістю доступних місць
          const getAvailableSpots = (teacher: TeacherMatch) => {
            if (!teacher.availablePlaces || !teacher.availablePlaces.details) return 0;
            
            const filteredDetails = teacher.availablePlaces.details.filter(detail => 
              detail.type === type && detail.availableSpots > 0
            );
            
            // Якщо є студент, рахуємо точні співпадіння
            if (studentInfo && studentInfo.specialty_id && studentInfo.course) {
              const exactMatches = filteredDetails.filter(detail => 
                detail.specialty_id === studentInfo.specialty_id && detail.course === studentInfo.course
              );
              if (exactMatches.length > 0) {
                return exactMatches.reduce((sum, detail) => sum + detail.availableSpots, 0) * 100;
              }
            }
            
            return filteredDetails.reduce((sum, detail) => sum + detail.availableSpots, 0);
          };
          
          const aSpots = getAvailableSpots(a);
          const bSpots = getAvailableSpots(b);
          
          if (bSpots !== aSpots) return bSpots - aSpots;
          
          // Потім за релевантністю
          return b.relevanceScore - a.relevanceScore;
        }
          
        case 'rating': {
          // За рейтингом
          const aRating = a.teacher.rating || 0;
          const bRating = b.teacher.rating || 0;
          
          if (bRating !== aRating) return bRating - aRating;
          
          // Потім за доступними місцями
          return b.relevanceScore - a.relevanceScore;
        }
          
        default: { // 'relevance'
          // За релевантністю (навіть якщо 0)
          if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
          
          // Потім за доступними місцями
          const getTotalSpots = (teacher: TeacherMatch) => {
            if (!teacher.availablePlaces || !teacher.availablePlaces.details) return 0;
            return teacher.availablePlaces.details
              .filter(detail => detail.type === type)
              .reduce((sum, detail) => sum + detail.availableSpots, 0);
          };
          
          return getTotalSpots(b) - getTotalSpots(a);
        }
      }
    });
  };

  // Функція для пошуку відповідних викладачів для конкретної теми
  const handleFindTeachersForTopic = async (topic: string, topicIndex: number): Promise<void> => {
    setLoadingTeachersForTopic(topic);
    
    try {
      const isAuthenticated = await checkAuthentication();
      
      if (!isAuthenticated) {
        throw new Error(t('aiAssistant.teachers.authenticationRequired'));
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен автентифікації не знайдено');
      }

      // Отримуємо оновлену інформацію про студента
      const studentInfo = await getUpdatedStudentInfo();
      
      // Отримуємо оригінальну тему (без очищення) для пошуку
      const originalTopic = suggestedTopics[topicIndex]?.originalTitle || topic;

      const requestBody = {
        topic: originalTopic,
        facultyId: studentInfo?.faculty_id || userFacultyId,
        workType: suggestedTopics[topicIndex]?.workType || 'coursework',
        includeAvailablePlaces: true,
        studentInfo: {
          specialty_id: studentInfo?.specialty_id,
          specialty_code: studentInfo?.specialty_code,
          course: studentInfo?.course,
          faculty_id: studentInfo?.faculty_id,
          faculty_name: studentInfo?.faculty_name
        },
        filters: {
          exactMatchOnly: false,
          includeAllPlaces: true
        },
        includePlaceDetails: true
      };

      console.log('🔍 Searching teachers for topic with request:', requestBody);

      const response = await fetch('/api/teachers/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Помилка сервера: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Found teachers with data:', {
        count: data.teachers?.length || 0,
        hasAvailablePlaces: data.teachers?.some((t: TeacherMatch) => t.availablePlaces),
        teachers: data.teachers?.map((t: TeacherMatch) => ({
          name: t.teacher.name,
          hasPlaces: !!t.availablePlaces,
          placeCount: t.availablePlaces?.totalAvailable || 0,
          placeDetails: t.availablePlaces?.details?.length || 0
        }))
      });

      // Обробляємо деталі доступних місць
      const processedTeachers = (data.teachers || []).map((teacher: TeacherMatch) => {
        // Якщо є деталі доступних місць, обробляємо їх
        if (teacher.availablePlaces && teacher.availablePlaces.details) {
          // Позначаємо точні співпадіння для студента
          const processedDetails = teacher.availablePlaces.details.map(detail => ({
            ...detail,
            isExactMatch: studentInfo?.specialty_id && studentInfo?.course 
              ? detail.specialty_id === studentInfo.specialty_id && detail.course === studentInfo.course
              : false
          }));
          
          // Перераховуємо загальну кількість доступних місць
          const totalAvailable = processedDetails.reduce((sum, detail) => sum + detail.availableSpots, 0);
          
          return {
            ...teacher,
            availablePlaces: {
              ...teacher.availablePlaces,
              details: processedDetails,
              totalAvailable
            }
          };
        }
        
        return teacher;
      });

      // Оновлюємо стан з результатами пошуку
      setSuggestedTopics(prev => prev.map((t, index) => 
        index === topicIndex 
          ? { 
              ...t, 
              teacherMatches: processedTeachers || [],
              showTeachers: true,
              error: undefined
            }
          : t
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('aiAssistant.teachers.unknownError');
      
      console.error('❌ Error finding teachers:', err);
      
      setSuggestedTopics(prev => prev.map((t, index) => 
        index === topicIndex 
          ? { 
              ...t, 
              teacherMatches: [],
              showTeachers: true,
              error: errorMessage
            }
          : t
      ));
    } finally {
      setLoadingTeachersForTopic(null);
    }
  };

  // Функція для перемикання відображення викладачів для теми
  const toggleTeachersForTopic = (topicIndex: number, topicTitle: string): void => {
    const topic = suggestedTopics[topicIndex];
    
    if (loadingTeachersForTopic === topicTitle) return;
    
    if (!topic.teacherMatches && !topic.showTeachers && !topic.error) {
      handleFindTeachersForTopic(topicTitle, topicIndex);
    } else {
      setSuggestedTopics(prev => prev.map((t, index) => 
        index === topicIndex 
          ? { ...t, showTeachers: !t.showTeachers }
          : t
      ));
    }
  };

  // Функція для аналізу тексту з використанням API
  const handleAnalyzeText = async (): Promise<void> => {
    if (!analysisText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const data = await apiRequest('/api/analyze-text', {
        method: 'POST',
        body: JSON.stringify({ text: analysisText })
      });

      setAnalysisResult(data);
    } catch {
      const fallbackResult = generateClientSideFallback(analysisText);
      setAnalysisResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Client-side fallback
  const generateClientSideFallback = (text: string): TextAnalysisResult => {
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    return {
      metrics: {
        wordCount: words,
        sentenceCount: sentences,
        paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        characterCount: text.length,
        averageSentenceLength: sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0,
        averageWordLength: words > 0 ? Math.round((text.replace(/\s/g, '').length / words) * 10) / 10 : 0,
        readabilityScore: Math.max(30, Math.min(80, words * 0.5)),
        coherenceScore: Math.max(30, Math.min(75, words * 0.4))
      },
      strengths: [t('aiAssistant.analysis.fallback.strength')],
      issues: [t('aiAssistant.analysis.fallback.issue')],
      suggestions: [t('aiAssistant.analysis.fallback.suggestion')],
      overallScore: 50
    };
  };

  const handleGenerateStructure = async (): Promise<void> => {
    if (!selectedTopic.trim()) return;

    setIsGenerating(true);

    try {
      const requestBody = { 
        idea: ideaInput || selectedTopic,
        topic: selectedTopic 
      };

      const data = await apiRequest('/api/generate-structure', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (data.structure && Array.isArray(data.structure)) {
        const formattedStructure = formatStructureForDisplay(data.structure);
        setGeneratedStructure(formattedStructure);
      } else {
        setGeneratedStructure(generateFallbackStructure(selectedTopic));
      }
    } catch {
      setGeneratedStructure(generateFallbackStructure(selectedTopic));
    } finally {
      setIsGenerating(false);
    }
  };

  // Функція для форматування структури у читабельний вигляд
  const formatStructureForDisplay = (structure: StructureItem[]): string => {
    return structure
      .map((item: StructureItem) => {
        return `${t('aiAssistant.structure.section')} ${item.id}: ${getSectionTitle(item.key)}\n${item.content}`;
      })
      .join('\n\n');
  };

  // Функція для отримання заголовків розділів
  const getSectionTitle = (key: string): string => {
    const titles: { [key: string]: string } = {
      intro: t('aiAssistant.structure.sections.intro'),
      theory: t('aiAssistant.structure.sections.theory'),
      analysis: t('aiAssistant.structure.sections.analysis'),
      design: t('aiAssistant.structure.sections.design'),
      development: t('aiAssistant.structure.sections.development'),
      testing: t('aiAssistant.structure.sections.testing'),
      implementation: t('aiAssistant.structure.sections.implementation'),
      results: t('aiAssistant.structure.sections.results'),
      sources: t('aiAssistant.structure.sections.sources'),
      appendix: t('aiAssistant.structure.sections.appendix')
    };
    
    return titles[key] || key;
  };

  // Fallback функція для генерації структури
  const generateFallbackStructure = (topic: string): string => {
    return `${t('aiAssistant.structure.fallback.title')} "${topic}"

1. ${t('aiAssistant.structure.sections.intro')}
   - ${t('aiAssistant.structure.fallback.intro.relevance')}
   - ${t('aiAssistant.structure.fallback.intro.goals')}
   - ${t('aiAssistant.structure.fallback.intro.object')}

2. ${t('aiAssistant.structure.fallback.theoretical')}
   - ${t('aiAssistant.structure.fallback.theoretical.literature')}
   - ${t('aiAssistant.structure.fallback.theoretical.concepts')}
   - ${t('aiAssistant.structure.fallback.theoretical.approaches')}

3. ${t('aiAssistant.structure.fallback.practical')}
   - ${t('aiAssistant.structure.fallback.practical.methodology')}
   - ${t('aiAssistant.structure.fallback.practical.experimental')}
   - ${t('aiAssistant.structure.fallback.practical.results')}

4. ${t('aiAssistant.structure.fallback.conclusions')}
   - ${t('aiAssistant.structure.fallback.conclusions.results')}
   - ${t('aiAssistant.structure.fallback.conclusions.recommendations')}
   - ${t('aiAssistant.structure.fallback.conclusions.perspectives')}

5. ${t('aiAssistant.structure.fallback.sources')}
6. ${t('aiAssistant.structure.sections.appendix')}`;
  };

  const handleGenerateSuggestions = async (): Promise<void> => {
    if (!ideaInput.trim()) return;
    setIsLoadingSuggestions(true);
    setIsLoadingPremium(true);

    try {
      // Отримуємо інформація про студента для персоналізованих рекомендацій
      const studentInfo = await getUpdatedStudentInfo();
      
      const topicsData = await apiRequest('/api/generate-topics', {
        method: 'POST',
        body: JSON.stringify({ 
          idea: ideaInput,
          studentInfo: {
            specialty_id: studentInfo?.specialty_id,
            specialty_code: studentInfo?.specialty_code,
            course: studentInfo?.course,
            faculty_id: studentInfo?.faculty_id
          }
        })
      });

      if (Array.isArray(topicsData.topics)) {
        const formatted: SuggestedTopicWithTeachers[] = topicsData.topics.map((item: any, index: number) => {
          // Спочатку очищаємо заголовок
          const rawTitle = item.title || t('aiAssistant.suggestions.defaultTitle');
          const cleanedTitle = cleanTopicTitle(rawTitle);
          
          console.log(`Topic ${index}: Raw: "${rawTitle}" → Cleaned: "${cleanedTitle}"`);

          const workType = determineWorkTypeFromTopic(cleanedTitle);

          return {
            title: cleanedTitle,
            relevance: Math.floor(Math.random() * 21) + 80,
            category: item.category || 'AI',
            description: item.description || t('aiAssistant.suggestions.defaultDescription'),
            teacherMatches: undefined,
            showTeachers: false,
            error: undefined,
            workType: workType,
            originalTitle: rawTitle,
          };
        });
        
        setSuggestedTopics(formatted);
      }

      try {
        const premiumData = await apiRequest(`/api/teacher/premium-suggestions?idea=${encodeURIComponent(ideaInput)}`);
        if (premiumData.suggestions) {
          const formattedPremium: PremiumSuggestion[] = premiumData.suggestions.map((suggestion: any) => {
            // Очищаємо заголовок для преміум-рекомендацій
            const rawTitle = suggestion.title || '';
            const cleanedTitle = cleanTopicTitle(rawTitle);
            
            return {
              ...suggestion,
              title: cleanedTitle || suggestion.title || '',
              workType: suggestion.work_type ? 
                (suggestion.work_type === 'diploma' ? 'diploma' : 
                 suggestion.work_type === 'practice' ? 'practice' : 'coursework') : 
                determineWorkTypeFromTopic(suggestion.title || ''),
              teacherId: suggestion.teacher_id,
              teacherName: suggestion.teacher_name
            };
          });
          
          setPremiumSuggestions(formattedPremium);
        }
      } catch (error) {
        console.log('Premium suggestions not available:', error);
      }

    } catch (error) {
      console.error('❌ Error generating suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
      setIsLoadingPremium(false);
    }
  };

  const copyToClipboard = async (): Promise<void> => {
    if (generatedStructure) {
      try {
        await navigator.clipboard.writeText(generatedStructure);
        toast.success(t('aiAssistant.structure.copied'));
      } catch {
        toast.error(t('aiAssistant.structure.copyError'));
      }
    }
  };

  // Функція для обробки вибору теми
  const handleTopicSelect = async (topic: string, teacherId?: string, workType?: 'coursework' | 'diploma' | 'practice') => {
    const cleanedTopic = cleanTopicTitle(topic);
    
    setSelectedTopic(cleanedTopic);
    
    const determinedWorkType = workType || determineWorkTypeFromTopic(topic);
    
    const studentInfo = await getUpdatedStudentInfo();
    
    setApplicationFormData(prev => ({
      ...prev,
      topic: cleanedTopic,
      teacherId: teacherId,
      workType: determinedWorkType,
      deadline: getDefaultDeadlineByType(determinedWorkType),
      student_name: studentInfo?.name || prev.student_name,
      student_email: studentInfo?.email || prev.student_email,
      student_phone: studentInfo?.phone || prev.student_phone,
      student_program: studentInfo?.program || prev.student_program,
      student_year: studentInfo?.year || prev.student_year,
      student_group: studentInfo?.group || prev.student_group,
      student_id: studentInfo?.id || prev.student_id,
      student_specialty_id: studentInfo?.specialty_id,
      student_specialty_code: studentInfo?.specialty_code || '',
      student_faculty_id: studentInfo?.faculty_id,
      description: '',
      goals: '',
      requirements: ''
    }));
    
    if (!ideaInput.trim()) {
      setIdeaInput(cleanedTopic);
    }
    
    setShowApplicationForm(true);
  };

  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
    setApplicationFormData(prev => ({
      ...prev,
      topic: '',
      description: '',
      goals: '',
      requirements: '',
      deadline: getDefaultDeadlineByType(prev.workType),
      workType: 'coursework',
      teacherId: undefined
    }));
  };

  // ПОКРАЩЕНА ФУНКЦІЯ ДЛЯ ДЕБАГУ
  const debugApplicationData = (): {
    hasAllRequiredFields: boolean;
    missingFields: string[];
    isValid: boolean;
    issues: string[];
  } => {
    const requiredFields = [
      { field: 'topic', value: applicationFormData.topic.trim() },
      { field: 'description', value: applicationFormData.description.trim() },
      { field: 'goals', value: applicationFormData.goals.trim() },
      { field: 'requirements', value: applicationFormData.requirements.trim() },
      { field: 'student_name', value: applicationFormData.student_name.trim() },
      { field: 'student_email', value: applicationFormData.student_email.trim() },
      { field: 'workType', value: applicationFormData.workType }
    ];

    const missingFields = requiredFields
      .filter(f => !f.value)
      .map(f => f.field);

    const issues: string[] = [];
    
    if (!applicationFormData.teacherId) {
      issues.push('Не вибрано викладача');
    }
    
    if (!studentInfo?.specialty_id) {
      issues.push('Не вказано спеціальність студента');
    }
    
    if (!studentInfo?.course) {
      issues.push('Не вказано курс студента');
    }

    const token = getAuthToken();
    if (!token) {
      issues.push('Токен автентифікації відсутній');
    }

    console.log('🔍 ДЕТАЛЬНИЙ АНАЛІЗ ДАНИХ ЗАЯВКИ:');
    console.log('--- СТАТУС ПОЛІВ ---');
    requiredFields.forEach(f => {
      console.log(`${f.field}: "${f.value}" (${f.value ? '✅ OK' : '❌ ПУСТЕ'})`);
    });
    
    console.log('--- ДАНІ СТУДЕНТА ---');
    console.log('Ім\'я:', studentInfo?.name);
    console.log('ID студента:', studentInfo?.id);
    console.log('Спеціальність ID:', studentInfo?.specialty_id);
    console.log('Курс:', studentInfo?.course);
    console.log('Email:', studentInfo?.email);
    
    console.log('--- ID ВИКЛАДАЧА ---');
    console.log('Teacher ID:', applicationFormData.teacherId, 
      applicationFormData.teacherId ? '✅ Вказано' : '❌ НЕ ВКАЗАНО');
    
    console.log('--- ТОКЕН АВТЕНТИФІКАЦІЇ ---');
    console.log('Токен присутній?', token ? '✅ Так' : '❌ Ні');
    if (token) {
      console.log('Довжина токена:', token.length);
    }
    
    console.log('--- ПРОБЛЕМИ ---');
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`❌ ${issue}`));
    } else {
      console.log('✅ Всі перевірки пройдено');
    }
    
    console.log('--- ПОВНІ ДАНІ ДЛЯ ВІДПРАВКИ ---');
    console.log('Дані для відправки:', {
      topic: applicationFormData.topic.trim(),
      description: applicationFormData.description.trim(),
      goals: applicationFormData.goals.trim(),
      requirements: applicationFormData.requirements.trim(),
      teacherId: applicationFormData.teacherId,
      deadline: applicationFormData.deadline,
      student_name: applicationFormData.student_name.trim(),
      student_email: applicationFormData.student_email.trim(),
      student_phone: applicationFormData.student_phone?.trim() || '',
      student_program: applicationFormData.student_program?.trim() || '',
      student_year: studentInfo?.course?.toString() || applicationFormData.student_year,
      student_group: applicationFormData.student_group?.trim() || '',
      student_id: studentInfo?.id || '',
      workType: applicationFormData.workType,
      type: applicationFormData.workType === 'coursework' ? 'course' : 
            applicationFormData.workType === 'diploma' ? 'diploma' : 'practice',
      student_specialty_id: studentInfo?.specialty_id,
      student_specialty_code: studentInfo?.specialty_code || '',
      student_faculty_id: studentInfo?.faculty_id
    });

    return {
      hasAllRequiredFields: missingFields.length === 0,
      missingFields,
      isValid: missingFields.length === 0 && issues.length === 0,
      issues
    };
  };

  // ПОКРАЩЕНА ФУНКЦІЯ ВІДПРАВКИ ЗАЯВКИ
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🟡 Початок відправки заявки...');
    
    // Перевірка даних перед відправкою
    const debugInfo = debugApplicationData();
    
    if (!debugInfo.hasAllRequiredFields) {
      toast.error(`Будь ласка, заповніть обов'язкові поля: ${debugInfo.missingFields.join(', ')}`);
      return;
    }
    
    // Перевірка наявності teacherId
    if (!applicationFormData.teacherId) {
      toast.error('Будь ласка, виберіть викладача');
      return;
    }

    // Перевірка спеціальності та курсу
    if (!studentInfo?.specialty_id || !studentInfo?.course) {
      toast.error('Будь ласка, заповніть інформацію про спеціальність та курс у вашому профілі');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Помилка автентифікації. Будь ласка, увійдіть знову.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Підготуємо дані для відправки
      const applicationData = {
  topic: applicationFormData.topic.trim(),
  description: applicationFormData.description.trim(),
  goals: applicationFormData.goals.trim(),
  requirements: applicationFormData.requirements.trim(),
  teacherId: applicationFormData.teacherId,
  deadline: applicationFormData.deadline,
  student_name: applicationFormData.student_name.trim(),
  student_email: applicationFormData.student_email.trim(),
  student_phone: applicationFormData.student_phone?.trim() || '',
  student_program: applicationFormData.student_program?.trim() || '',
  student_year: String(studentInfo?.course || ''),
  student_group: applicationFormData.student_group?.trim() || '',
  student_id: studentInfo?.id || '',
  student_id_number: String(studentInfo?.id || ''),
  workType: applicationFormData.workType,
  type: applicationFormData.workType === 'coursework' ? 'course' : 
        applicationFormData.workType === 'diploma' ? 'diploma' : 'practice',
  student_specialty_id: studentInfo?.specialty_id,
  student_specialty_code: studentInfo?.specialty_code || '',
  student_faculty_id: studentInfo?.faculty_id
};

      console.log('📤 Відправляємо заявку викладачу:', {
        endpoint: '/api/student/applications',
        data: applicationData
      });

      // Використовуємо правильний ендпоінт
      const response = await fetch('/api/student/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

      const responseText = await response.text();
      console.log('📥 Відповідь сервера:', {
        status: response.status,
        statusText: response.statusText,
        text: responseText
      });

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Помилка парсингу відповіді:', e);
        responseData = { message: responseText };
      }

      if (!response.ok) {
        console.error('❌ Помилка відправки заявки:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        // Обробка специфічних помилок
        if (response.status === 400) {
          const errorMessage = responseData.message || 'Помилка валідації';
          
          if (responseData.missingFields) {
            toast.error(`Будь ласка, заповніть: ${responseData.missingFields.join(', ')}`);
          } else if (errorMessage.includes('максимальну кількість заявок')) {
            toast.error('Ви вже маєте максимальну кількість заявок (3). Видаліть або очікуйте відповідь на існуючі заявки.');
          } else if (errorMessage.includes('вже є активна заявка')) {
            toast.error('У вас вже є активна заявка до цього викладача. Ви можете подати заявку лише до одного викладача одночасно.');
          } else if (errorMessage.includes('немає доступних місць')) {
            toast.error('На жаль, у викладача немає доступних місць для вашої спеціальності та курсу.');
          } else {
            toast.error(errorMessage);
          }
        } else if (response.status === 401) {
          toast.error('Помилка автентифікації. Будь ласка, увійдіть знову.');
        } else if (response.status === 403) {
          toast.error('Доступ заборонено. Користувач не є студентом.');
        } else if (response.status === 404) {
          toast.error('Викладача не знайдено.');
        } else if (response.status === 500) {
          toast.error(`Помилка сервера: ${responseData.details || responseData.message || 'Невідома помилка'}`);
        } else {
          toast.error(`Помилка: ${response.status} - ${responseData.message || 'Невідома помилка'}`);
        }
        return;
      }

      // Успішна відповідь
      console.log('✅ Заявка успішно створена:', responseData);
      
      const successMessage = `Заявка успішно подана!${
        responseData.remainingApplications ? 
        ` Залишилось заявок: ${responseData.remainingApplications}` : 
        ''
      }`;
      
      const description = `Тип роботи: ${getWorkTypeLabel(applicationFormData.workType)}\nДедлайн: ${applicationFormData.deadline}\n\n✅ Кількість доступних місць у викладача оновлено`;
      
      toast.success(successMessage, {
        duration: 7000,
        description: description
      });

      // ВІДПРАВЛЯЄМО ПОДІЮ ДЛЯ ОНОВЛЕННЯ TeacherApplications
      window.dispatchEvent(new CustomEvent('applicationCreated', {
        detail: { 
          teacherId: applicationFormData.teacherId,
          applicationData: responseData
        }
      }));

      // Оновлення UI - оновлюємо кількість доступних місць у картках викладачів
      setSuggestedTopics(prev => prev.map(topic => {
        if (topic.teacherMatches && applicationFormData.teacherId) {
          return {
            ...topic,
            teacherMatches: topic.teacherMatches.map(teacherMatch => {
              if (teacherMatch.teacher.id === applicationFormData.teacherId) {
                // Оновлюємо кількість доступних місць для цього викладача
                const updatedPlaces = teacherMatch.availablePlaces?.details?.map(place => {
                  if (place.type === applicationFormData.workType && 
                      place.specialty_id === studentInfo?.specialty_id &&
                      place.course === studentInfo?.course) {
                    return {
                      ...place,
                      availableSpots: Math.max(0, place.availableSpots - 1),
                      current_students: (place.current_students || 0) + 1,
                      isExactMatch: true
                    };
                  }
                  return place;
                }) || [];
                
                // Перераховуємо загальну статистику
                const totalAvailable = updatedPlaces.reduce((sum, p) => sum + p.availableSpots, 0);
                const courseworkSpots = updatedPlaces
                  .filter(p => p.type === 'coursework')
                  .reduce((sum, p) => sum + p.availableSpots, 0);
                const diplomaSpots = updatedPlaces
                  .filter(p => p.type === 'diploma')
                  .reduce((sum, p) => sum + p.availableSpots, 0);
                const practiceSpots = updatedPlaces
                  .filter(p => p.type === 'practice')
                  .reduce((sum, p) => sum + p.availableSpots, 0);
                
                return {
                  ...teacherMatch,
                  availablePlaces: {
                    ...teacherMatch.availablePlaces,
                    details: updatedPlaces,
                    totalAvailable,
                    coursework: courseworkSpots,
                    diploma: diplomaSpots,
                    practice: practiceSpots
                  }
                };
              }
              return teacherMatch;
            })
          };
        }
        return topic;
      }));

      // Закриваємо форму та скидаємо дані
      setShowApplicationForm(false);
      setApplicationFormData({
        topic: '',
        description: '',
        goals: '',
        requirements: '',
        deadline: getDefaultDeadlineByType('coursework'),
        student_name: '',
        student_email: '',
        student_phone: '',
        student_program: '',
        student_year: '',
        student_group: '',
        student_id: '',
        workType: 'coursework',
        student_specialty_id: undefined,
        student_specialty_code: '',
        student_faculty_id: undefined
      });
      
      setSelectedTopic('');
      
      // Оновлюємо інформацію про студента (може змінитися кількість заявок)
      setTimeout(async () => {
        const updatedStudentInfo = await getUpdatedStudentInfo();
        if (updatedStudentInfo) {
          setStudentInfo(updatedStudentInfo);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Помилка підключення до сервера:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Проблема з підключенням до сервера. Перевірте інтернет-з\'єднання.');
      } else if (error instanceof SyntaxError) {
        toast.error('Помилка обробки відповіді сервера.');
      } else {
        toast.error('Невідома помилка підключення. Спробуйте ще раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функція для тестової відправки (для дебагу)
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🧪 ТЕСТОВА ВІДПРАВКА ЗАЯВКИ');
    debugApplicationData();
    
    // Симулюємо успішну відповідь
    toast.success('Тест: Заявка успішно відправлена! (ТЕСТОВИЙ РЕЖИМ)', {
      duration: 5000,
      description: 'Це тестова відповідь. Реальна заявка не була відправлена.'
    });
    
    // Оновлюємо UI без реального запиту
    setShowApplicationForm(false);
    setApplicationFormData({
      topic: '',
      description: '',
      goals: '',
      requirements: '',
      deadline: getDefaultDeadlineByType('coursework'),
      student_name: '',
      student_email: '',
      student_phone: '',
      student_program: '',
      student_year: '',
      student_group: '',
      student_id: '',
      workType: 'coursework',
      student_specialty_id: undefined,
      student_specialty_code: '',
      student_faculty_id: undefined
    });
  };

  // Функція для оновлення даних форми
  const handleFormDataChange = (field: keyof ApplicationFormData, value: string) => {
    setApplicationFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Функція для обробки вибору довільного викладача
  const handleChooseRandomTeacher = (topicTitle: string, workType: 'coursework' | 'diploma' | 'practice' = 'coursework') => {
    const chooseTeacherUrl = '/choose-teacher';
    
    const urlParams = new URLSearchParams({
      topic: topicTitle,
      faculty: userFacultyId?.toString() || '',
      facultyName: userFacultyName || '',
      workType: workType,
      specialty: studentInfo?.specialty_code || '',
      course: studentInfo?.course?.toString() || '',
      exactMatchOnly: 'false'
    });
    
    const fullUrl = `${chooseTeacherUrl}?${urlParams.toString()}`;
    
    window.location.href = fullUrl;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <BookOpen className="w-4 h-4" />;
      case 'direction':
        return <Target className="w-4 h-4" />;
      case 'future_topic':
        return <Lightbulb className="w-4 h-4" />;
      case 'skill':
        return <Star className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'work':
        return t('aiAssistant.premium.types.work');
      case 'direction':
        return t('aiAssistant.premium.types.direction');
      case 'future_topic':
        return t('aiAssistant.premium.types.future_topic');
      case 'skill':
        return t('aiAssistant.premium.types.skill');
      default:
        return type;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'direction':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'future_topic':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
      case 'skill':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  // ОНОВЛЕНА ФУНКЦІЯ ДЛЯ ВІДОБРАЖЕННЯ ВИКЛАДАЧІВ (БЕЗ ФІЛЬТРІВ)
  const renderTeacherMatchesForTopic = (topic: SuggestedTopicWithTeachers, topicIndex: number) => {
    if (!topic.showTeachers) return null;

    // Сортуємо викладачів
    const allTeachers = topic.teacherMatches || [];
    const sortedTeachers = sortTeachers(allTeachers, topic.workType);
    const hasAvailableTeachers = sortedTeachers.length > 0;

    // Підраховуємо статистику
    const exactMatchesCount = sortedTeachers.filter(teacher => 
      teacher.availablePlaces?.details?.some(detail => detail.isExactMatch)
    ).length;

    // Рахуємо загальну кількість доступних місць
    const totalAvailableSpots = sortedTeachers.reduce((total, teacher) => {
      if (!teacher.availablePlaces || !teacher.availablePlaces.details) return total;
      const matchingDetails = teacher.availablePlaces.details.filter(detail => 
        detail.type === (topic.workType || 'coursework')
      );
      return total + matchingDetails.reduce((sum, detail) => sum + detail.availableSpots, 0);
    }, 0);

    // Рахуємо середню релевантність
    const avgRelevance = sortedTeachers.length > 0 
      ? Math.round(sortedTeachers.reduce((sum, t) => sum + t.relevanceScore, 0) / sortedTeachers.length)
      : 0;

    return (
      <div className="mt-6 border-t border-border pt-6">
        <div className="space-y-6">
          {/* Заголовок з статистикою */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="text-primary w-6 h-6" />
                Рекомендовані викладачі
              </h4>
              <p className="text-muted-foreground">
                {topic.title}
              </p>
            </div>
            
            <Badge variant="outline" className="text-sm">
              {sortedTeachers.length} викладачів
            </Badge>
          </div>

          {/* Інформація про результат пошуку */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {sortedTeachers.length === 0 
                    ? 'Викладачів не знайдено за вашими критеріями' 
                    : `Знайдено ${sortedTeachers.length} викладачів`}
                </p>
                <p className="text-blue-600 dark:text-blue-400 mt-1">
                  {sortedTeachers.length > 0 && avgRelevance === 0 
                    ? 'Пошук за ключовими словами не дав результатів. Показано всіх викладачів факультету.'
                    : `Середня релевантність: ${avgRelevance}%`}
                </p>
              </div>
            </div>
          </div>

          {/* Статистика */}
          {sortedTeachers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{sortedTeachers.length}</div>
                  <p className="text-sm text-muted-foreground">Викладачів</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{exactMatchesCount}</div>
                  <p className="text-sm text-muted-foreground">Точних співпадінь</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {avgRelevance}%
                  </div>
                  <p className="text-sm text-muted-foreground">Середня релевантність</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getWorkTypeLabel(topic.workType || 'coursework')}
                  </div>
                  <p className="text-sm text-muted-foreground">Тип роботи</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Debug інформація про студента */}
          {studentInfo && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Інформація про пошук:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Студент:</span>
                  <span className="font-medium">{studentInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Спеціальність:</span>
                  <Badge variant="secondary" className="text-sm">
                    {studentInfo.specialty_code || 'Не вказано'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Курс:</span>
                  <Badge variant="outline" className="text-sm">
                    {studentInfo.course ? `${studentInfo.course} курс` : 'Не вказано'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Факультет:</span>
                  <span className="font-medium">{studentInfo.faculty_name || 'Не вказано'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Доступних місць:</span>
                  <span className="font-medium text-green-600">{totalAvailableSpots}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Точних співпадінь:</span>
                  <span className="font-medium text-green-600">{exactMatchesCount}</span>
                </div>
              </div>
            </div>
          )}

          {loadingTeachersForTopic === topic.title ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Пошук викладачів...</span>
            </div>
          ) : topic.error ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Помилка пошуку</h3>
                <p className="text-muted-foreground mb-6">
                  {topic.error}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => handleFindTeachersForTopic(topic.title, topicIndex)}
                >
                  Спробувати ще раз
                </Button>
              </CardContent>
            </Card>
          ) : hasAvailableTeachers ? (
            <div>
              {/* Інформація про пошук */}
              {avgRelevance === 0 && sortedTeachers.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-700 dark:text-amber-300">
                        Не знайдено співпадінь за ключовими словами
                      </p>
                      <p className="text-amber-600 dark:text-amber-400 mt-1">
                        Показано всіх викладачів вашого факультету. Ви можете звернутися до будь-якого з них.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Список викладачів у сітці - як в AllTeachersPage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedTeachers.map((match) => (
                  <EnhancedTeacherCard 
                    key={match.teacher.id} 
                    match={match} 
                    topic={topic}
                    onSelect={() => handleTopicSelect(topic.title, match.teacher.id, topic.workType)}
                    onViewProfile={openTeacherModal}
                    showAvailability={false}
                    studentInfo={studentInfo}
                    showAllPlaces={true}
                  />
                ))}
              </div>

              {/* Кнопка для вибору довільного викладача */}
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => handleChooseRandomTeacher(topic.title, topic.workType || 'coursework')}
                  className="flex items-center gap-2 mx-auto"
                >
                  <GraduationCap className="w-4 h-4" />
                  Переглянути всіх викладачів
                </Button>
              </div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Викладачів не знайдено</h3>
                <p className="text-muted-foreground mb-6">
                  Не знайдено викладачів за вашими критеріями
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => handleChooseRandomTeacher(topic.title, topic.workType || 'coursework')}
                  >
                    Переглянути всіх викладачів
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // Функція для відображення результатів аналізу
  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600 dark:text-green-400';
      if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    };

    const getScoreBadge = (score: number) => {
      if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getScoreLabel = (score: number) => {
      if (score >= 80) return t('aiAssistant.analysis.scores.excellent');
      if (score >= 60) return t('aiAssistant.analysis.scores.good');
      return t('aiAssistant.analysis.scores.needsImprovement');
    };

    return (
      <div className="space-y-6">
        {/* Загальна оцінка */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary w-5 h-5" />
              {t('aiAssistant.analysis.overallScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">
                <span className={getScoreColor(analysisResult.overallScore)}>
                  {analysisResult.overallScore}%
                </span>
              </div>
              <Badge className={`${getScoreBadge(analysisResult.overallScore)} text-lg px-3 py-1`}>
                {getScoreLabel(analysisResult.overallScore)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Метрики */}
        <Card>
          <CardHeader>
            <CardTitle>{t('aiAssistant.analysis.metrics.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-primary">{analysisResult.metrics.wordCount}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.words')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analysisResult.metrics.sentenceCount}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.sentences')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysisResult.metrics.paragraphCount}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.paragraphs')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysisResult.metrics.averageSentenceLength}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.wordsPerSentence')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{analysisResult.metrics.readabilityScore}%</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.readability')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analysisResult.metrics.coherenceScore}%</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.coherence')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Рекомендації та покращення */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Сильні сторони */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <ThumbsUp className="w-5 h-5" />
                {t('aiAssistant.analysis.strengths')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Проблеми */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                {t('aiAssistant.analysis.issues')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Рекомендації щодо покращення */}
        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                {t('aiAssistant.analysis.suggestions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="bg-primary/10 text-primary rounded-full p-1">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="text-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Функція для відображення преміальних рекомендацій
  const renderPremiumSuggestions = () => {
    if (premiumSuggestions.length === 0 && !isLoadingPremium) return null;

    return (
      <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 dark:border-yellow-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Crown className="w-5 h-5" />
            {t('aiAssistant.premium.title')}
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white dark:from-yellow-600 dark:to-amber-600">
              {t('aiAssistant.premium.badge')}
            </Badge>
          </CardTitle>
          <CardDescription className="text-yellow-600 dark:text-yellow-400">
            {t('aiAssistant.premium.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPremium ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-yellow-600 dark:text-yellow-400">{t('aiAssistant.premium.loading')}</span>
            </div>
          ) : premiumSuggestions.length > 0 ? (
            premiumSuggestions.map((suggestion) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className="border border-yellow-300 dark:border-yellow-600 rounded-lg p-4 bg-background hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSuggestionIcon(suggestion.type)}
                      <Badge 
                        variant="outline" 
                        className={`${getSuggestionColor(suggestion.type)} text-xs`}
                      >
                        {getSuggestionTypeLabel(suggestion.type)}
                      </Badge>
                      {suggestion.workType && (
                        <Badge className={getWorkTypeColor(suggestion.workType)}>
                          {getWorkTypeLabel(suggestion.workType)}
                        </Badge>
                      )}
                      {suggestion.teacherName && (
                        <Badge variant="secondary" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          {suggestion.teacherName}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description || suggestion.topic_description}
                    </p>
                    
                    {/* Додаткова інформація для робіт */}
                    {suggestion.work_type && suggestion.year && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {suggestion.work_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {suggestion.year}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{suggestion.relevance}%</div>
                    <p className="text-xs text-muted-foreground">{t('aiAssistant.premium.relevance')}</p>
                  </div>
                </div>
                
                {/* Кнопки дій */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Crown className="w-3 h-3" />
                    {t('aiAssistant.premium.fromTeacher')}
                  </div>
                  
                  <div className="flex gap-2">
                    {suggestion.url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(suggestion.url, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {t('aiAssistant.premium.view')}
                      </Button>
                    )}
                    <Button 
                      size="sm"
                      onClick={() => handleTopicSelect(
                        suggestion.title, 
                        suggestion.teacherId, 
                        suggestion.workType || determineWorkTypeFromTopic(suggestion.title)
                      )}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      {t('aiAssistant.suggestions.choose')}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p>{t('aiAssistant.premium.noResults')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ПОКРАЩЕНА ФУНКЦІЯ ДЛЯ ВІДОБРАЖЕННЯ ФОРМИ ЗАЯВКИ
  const renderApplicationForm = () => {
    if (!showApplicationForm) return null;

    const getStudentProfileData = (): CompleteStudentInfo & { group?: string } => {
      return {
        name: studentInfo?.name || "Студент",
        email: studentInfo?.email || "",
        phone: studentInfo?.phone || "",
        program: studentInfo?.program || "",
        year: studentInfo?.year || "",
        course: studentInfo?.course,
        group: studentInfo?.group || "",
        id: studentInfo?.id || "",
        bio: studentInfo?.bio || "",
        specialty_id: studentInfo?.specialty_id,
        specialty_code: studentInfo?.specialty_code || "",
        specialty_name: studentInfo?.specialty_name || "",
        faculty_id: studentInfo?.faculty_id,
        faculty_name: studentInfo?.faculty_name || ""
      };
    };

    const studentProfile = getStudentProfileData();
    
    // Перевірка готовності форми до відправки
    const isFormReady = () => {
      const requiredFields = [
        applicationFormData.topic.trim(),
        applicationFormData.description.trim(),
        applicationFormData.goals.trim(),
        applicationFormData.requirements.trim(),
        applicationFormData.student_name.trim(),
        applicationFormData.student_email.trim()
      ];
      
      return requiredFields.every(field => field.length > 0) && 
             applicationFormData.teacherId && 
             studentInfo?.specialty_id && 
             studentInfo?.course;
    };

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                {t('aiAssistant.application.title')}
                {applicationFormData.workType && (
                  <Badge className={getWorkTypeColor(applicationFormData.workType)}>
                    {getWorkTypeLabel(applicationFormData.workType)}
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseApplicationForm}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              {t('aiAssistant.application.description')}
              {applicationFormData.teacherId && (
                <span className="block mt-1 text-blue-600">
                  Заявка буде надіслана вибраному викладачу
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              {/* Тип роботи */}
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Тип роботи *
                </label>
                <Select
                  value={applicationFormData.workType}
                  onValueChange={(value: 'coursework' | 'diploma' | 'practice') => 
                    handleFormDataChange('workType', value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть тип роботи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coursework">Курсова робота</SelectItem>
                    <SelectItem value="diploma">Дипломний проєкт</SelectItem>
                    <SelectItem value="practice">Звіт з практики</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Оберіть тип роботи для коректного планування та дедлайну
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.topic')} *
                </label>
                <Input
                  value={applicationFormData.topic}
                  onChange={(e) => handleFormDataChange('topic', e.target.value)}
                  placeholder={t('aiAssistant.application.topicPlaceholder')}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.description')} *
                </label>
                <Textarea
                  value={applicationFormData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  placeholder={t('aiAssistant.application.descriptionPlaceholder')}
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Опишіть деталі вашого проекту, технології, які плануєте використовувати, та очікувані результати
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.goals')} *
                </label>
                <Textarea
                  value={applicationFormData.goals}
                  onChange={(e) => handleFormDataChange('goals', e.target.value)}
                  placeholder={t('aiAssistant.application.goalsPlaceholder')}
                  rows={2}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.requirements')} *
                </label>
                <Textarea
                  value={applicationFormData.requirements}
                  onChange={(e) => handleFormDataChange('requirements', e.target.value)}
                  placeholder={t('aiAssistant.application.requirementsPlaceholder')}
                  rows={2}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
  <label className="text-sm font-medium mb-2 block text-foreground">
    {t('aiAssistant.application.deadline')} *
  </label>
  <Input
    type="date"
    value={applicationFormData.deadline}
    onChange={(e) => {
      const value = e.target.value;
      if (value && value !== 'Invalid Date') {
        handleFormDataChange('deadline', value);
      }
    }}
    required
    disabled={isSubmitting}
    min={new Date().toISOString().split('T')[0]}
  />
  <p className="text-xs text-muted-foreground mt-1">
    Дедлайн: {applicationFormData.deadline && applicationFormData.deadline !== 'Invalid Date' 
      ? formatDateUA(applicationFormData.deadline) 
      : 'Не вказано'}
  </p>
</div>

              {/* Інформація про студента */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Інформація про студента
                  </h4>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      const studentInfo = await getUpdatedStudentInfo();
                      if (studentInfo) {
                        setApplicationFormData(prev => ({
                          ...prev,
                          student_name: studentInfo.name,
                          student_email: studentInfo.email,
                          student_phone: studentInfo.phone || '',
                          student_program: studentInfo.program || '',
                          student_year: studentInfo.year || '',
                          student_group: studentInfo.group || '',
                          student_specialty_id: studentInfo.specialty_id,
                          student_specialty_code: studentInfo.specialty_code || '',
                          student_faculty_id: studentInfo.faculty_id
                        }));
                        toast.success('Дані профілю оновлено');
                      } else {
                        toast.error('Не вдалося отримати дані профілю');
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Оновити з профілю
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">ПІБ:</span>
                    <p className="font-medium">{studentProfile.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{studentProfile.email || 'Не вказано'}</p>
                  </div>
                  
                  {studentProfile.specialty_code && (
                    <div>
                      <span className="text-muted-foreground">Спеціальність:</span>
                      <p className="font-medium">
                        {studentProfile.specialty_code}
                        {studentProfile.specialty_name && ` - ${studentProfile.specialty_name}`}
                      </p>
                    </div>
                  )}
                  
                  {studentProfile.course && (
                    <div>
                      <span className="text-muted-foreground">Курс:</span>
                      <p className="font-medium">{studentProfile.course}</p>
                    </div>
                  )}
                  
                  {studentProfile.phone && (
                    <div>
                      <span className="text-muted-foreground">Телефон:</span>
                      <p className="font-medium">{studentProfile.phone}</p>
                    </div>
                  )}
                  
                  {studentProfile.program && (
                    <div>
                      <span className="text-muted-foreground">Програма:</span>
                      <p className="font-medium">{studentProfile.program}</p>
                    </div>
                  )}
                  
                  {studentProfile.group && (
                    <div>
                      <span className="text-muted-foreground">Група:</span>
                      <p className="font-medium">{studentProfile.group}</p>
                    </div>
                  )}
                  
                  {studentProfile.id && (
                    <div>
                      <span className="text-muted-foreground">ID студента:</span>
                      <p className="font-medium text-xs">{studentProfile.id}</p>
                    </div>
                  )}
                  
                  {studentProfile.faculty_name && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Факультет:</span>
                      <p className="font-medium">{studentProfile.faculty_name}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <InfoIcon className="w-3 h-3" />
                  Ця інформація автоматично заповнюється з вашого профілю. 
                  Для редагування перейдіть у розділ "Профіль".
                </div>
              </div>

              {applicationFormData.teacherId && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Вибраний викладач:
                    </p>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Заявка буде надіслана обраному викладачу з урахуванням вашої спеціальності та курсу
                  </p>
                </div>
              )}

              {/* Дебаг панель (тільки для розробників) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Режим розробника
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        debugApplicationData();
                        toast.info('Дані форми проаналізовано (див. консоль)');
                      }}
                      className="w-full"
                    >
                      🔍 Проаналізувати дані форми
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestSubmit}
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      🧪 Тестова відправка (без API)
                    </Button>
                    <div className="text-amber-600 dark:text-amber-400 text-xs">
                      Статус: {isFormReady() ? '✅ Форма готова до відправки' : '❌ Форма не заповнена'}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseApplicationForm}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {t('aiAssistant.application.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isSubmitting || !isFormReady()}
                  title={!isFormReady() ? 'Заповніть всі обов\'язкові поля та виберіть викладача' : ''}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('aiAssistant.application.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('aiAssistant.application.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="text-primary w-7 h-7" />
                {t('aiAssistant.title')}
              </h1>
              <p className="text-muted-foreground">{t('aiAssistant.description')}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Card key={i} className="hover:shadow-lg transition-all border-border hover:border-primary/30">
                    <CardHeader className="flex items-start justify-between pb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <Badge variant={feature.status === 'active' ? 'default' : 'outline'}>
                        {feature.status === 'active' ? t('aiAssistant.status.active') : t('aiAssistant.status.comingSoon')}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="topics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="topics" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {t('aiAssistant.tabs.topics')}
                </TabsTrigger>
                <TabsTrigger value="structure" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('aiAssistant.tabs.structure')}
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('aiAssistant.tabs.analysis')}
                </TabsTrigger>
              </TabsList>

              {/* Topics Tab */}
              <TabsContent value="topics" className="space-y-6">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      {t('aiAssistant.suggestions.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('aiAssistant.suggestions.inputdesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder={t('aiAssistant.suggestions.inputPlaceholder')}
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleGenerateSuggestions}
                        disabled={isLoadingSuggestions || !ideaInput.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {isLoadingSuggestions ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {t('aiAssistant.suggestions.generate')}
                      </Button>
                    </div>
                    
                    {studentInfo && (
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <InfoIcon className="w-3 h-3" />
                        Пошук враховуватиме вашу спеціальність ({studentInfo.specialty_code}) та курс ({studentInfo.course})
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Suggested Topics */}
                {suggestedTopics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        {t('aiAssistant.suggestions.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('aiAssistant.suggestions.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {suggestedTopics.map((topic, index) => (
                        <Card key={index} className="border-border">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg text-foreground">
                                    {topic.title}
                                  </h3>
                                  <Badge variant="secondary">
                                    {topic.relevance}%
                                  </Badge>
                                  <Badge variant="outline">
                                    {topic.category}
                                  </Badge>
                                  {topic.workType && (
                                    <Badge className={getWorkTypeColor(topic.workType)}>
                                      {getWorkTypeLabel(topic.workType)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-4">
                                  {topic.description}
                                </p>
                                
                                {/* Додаткова інформація про тему */}
                                {(topic.topicComplexity || topic.estimatedTime || topic.technologies) && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {topic.topicComplexity && (
                                      <Badge variant="outline" className="text-xs">
                                        <Target className="w-3 h-3 mr-1" />
                                        {topic.topicComplexity === 'beginner' ? 'Початковий' : 
                                         topic.topicComplexity === 'intermediate' ? 'Середній' : 'Просунутий'} рівень
                                      </Badge>
                                    )}
                                    {topic.estimatedTime && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {topic.estimatedTime}
                                      </Badge>
                                    )}
                                    {topic.technologies && topic.technologies.slice(0, 3).map((tech, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                onClick={() => handleTopicSelect(topic.title, undefined, topic.workType)}
                                className="ml-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              >
                                <Target className="w-4 h-4 mr-2" />
                                {t('aiAssistant.suggestions.choose')}
                              </Button>
                            </div>

                            {/* Кнопка для перегляду викладачів */}
                            <div className="flex justify-between items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTeachersForTopic(index, topic.title)}
                                disabled={loadingTeachersForTopic === topic.title}
                                className="flex items-center gap-2"
                              >
                                {loadingTeachersForTopic === topic.title ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    {t('aiAssistant.teachers.searching')}
                                  </>
                                ) : (
                                  <>
                                    <GraduationCap className="w-3 h-3" />
                                    {topic.showTeachers 
                                      ? t('aiAssistant.teachers.hide') 
                                      : t('aiAssistant.teachers.find')
                                    }
                                  </>
                                )}
                              </Button>

                              {/* Статус викладачів */}
                              {topic.teacherMatches && (
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  {studentInfo && topic.teacherMatches.some(t => 
                                    t.availablePlaces?.details?.some(d => d.isExactMatch)
                                  ) && (
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                      <Check className="w-3 h-3 mr-1" />
                                      Є точні співпадіння
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Відображення рекомендованих викладачів */}
                            {renderTeacherMatchesForTopic(topic, index)}
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Premium Suggestions */}
                {renderPremiumSuggestions()}

                {/* Loading State */}
                {isLoadingSuggestions && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('aiAssistant.suggestions.loading')}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Генеруємо персоналізовані рекомендації з урахуванням вашої спеціальності та курсу...
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Structure Tab */}
              <TabsContent value="structure" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {t('aiAssistant.structure.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('aiAssistant.structure.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder={t('aiAssistant.structure.placeholder')}
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleGenerateStructure}
                        disabled={isGenerating || !selectedTopic.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        {t('aiAssistant.structure.generate')}
                      </Button>
                    </div>

                    {generatedStructure && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{t('aiAssistant.structure.generated')}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            {t('aiAssistant.structure.copy')}
                          </Button>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/50 border-border">
                          <pre className="whitespace-pre-wrap text-sm text-foreground">
                            {generatedStructure}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {t('aiAssistant.analysis.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('aiAssistant.analysis.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder={t('aiAssistant.analysis.placeholder')}
                        value={analysisText}
                        onChange={(e) => setAnalysisText(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <Button 
                        onClick={handleAnalyzeText}
                        disabled={isAnalyzing || !analysisText.trim()}
                        className="w-full flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        {t('aiAssistant.analysis.analyze')}
                      </Button>
                    </div>

                    {analysisResult && renderAnalysisResults()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Application Form Modal */}
      {renderApplicationForm()}

      {/* Teacher Profile Modal */}
      <TeacherProfileModal
        teacherId={selectedTeacherId || ''}
        open={teacherModalOpen}
        onOpenChange={setTeacherModalOpen}
      />
    </div>
  );
};

export default AIAssistant;