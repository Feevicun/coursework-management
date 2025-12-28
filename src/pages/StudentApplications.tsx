import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare,  
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  X,
  Phone,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Briefcase,
  FileCheck,
  Calendar
} from 'lucide-react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import StudentProfileModal from "../components/StudentProfileModal";

// Типи для заявок
type ApplicationStatus = "pending" | "accepted" | "rejected";
type WorkType = 'coursework' | 'diploma' | 'practice';

interface Application {
  id: number;
  studentName: string;
  studentAvatar: string;
  program: string;
  year: string;
  topic: string;
  workType: WorkType;
  type: 'course' | 'diploma' | 'practice';
  status: ApplicationStatus;
  date: string;
  email: string;
  phone: string;
  description: string;
  expanded: boolean;
  teacherId: string;
  studentId?: string;
  deadline?: string;
  startDate?: string;
  goals?: string;
  requirements?: string;
  rejection_reason?: string;
  created_at?: string;
  application_date?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  course: number;
  faculty: string;
  specialty: string;
  workType: WorkType;
  workTitle: string;
  startDate: string;
  deadline?: string;
  progress: number;
  status: 'active' | 'completed' | 'behind';
  lastActivity: string;
  grade: number;
  unreadComments: number;
  projectType: 'diploma' | 'coursework' | 'practice';
  teacherId?: string;
  confirmedAt?: string;
  applicationId?: number;
  supervisor?: string;
}

// Інтерфейс для інформації про студента з профілю
interface StudentProfileInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  program?: string;
  year?: string;
  bio?: string;
  avatar?: string;
  description?: string;
  studentAvatar?: string;
}

// Інтерфейс для даних проекту
interface ProjectData {
  id: string;
  projectType: WorkType;
  workTitle: string;
  supervisor: string;
  startDate: string;
  deadline: string;
  studentId?: string;
  teacherId: string;
  status: 'active' | 'completed' | 'behind';
  createdAt: string;
  confirmedAt: string;
  applicationId?: number;
  studentName?: string;
  program?: string;
  year?: string;
  workType: WorkType;
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
const safeFetch = async (url: string, options: Record<string, unknown> = {}) => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    } as RequestInit);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
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

// Утилітна функція для безпечного перетворення в рядок
const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

// Функція для отримання інформації про студента за ID
const getStudentProfileInfo = async (studentId?: string): Promise<StudentProfileInfo | null> => {
  if (!studentId) return null;
  
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found for student profile');
      return null;
    }

    const response = await fetch(`/api/students/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Student profile data from API:', data);
      
      return {
        id: data.id || studentId,
        name: safeToString(data.name || data.full_name || 'Студент'),
        email: safeToString(data.email || ''),
        phone: safeToString(data.phone || ''),
        program: safeToString(data.program || data.specialization || ''),
        year: safeToString(data.year || data.course || ''),
        bio: safeToString(data.bio || ''),
        avatar: safeToString(data.avatar || data.avatarUrl || '')
      };
    } else {
      console.log('⚠️ Student API not available, trying current-user');
      
      const currentUserResponse = await fetch('/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (currentUserResponse.ok) {
        const userData = await currentUserResponse.json();
        console.log('📋 Current user data for student profile:', userData);
        
        return {
          id: userData.user?.id || userData.id || studentId,
          name: safeToString(userData.user?.name || userData.name || userData.user?.full_name || userData.full_name || 'Студент'),
          email: safeToString(userData.user?.email || userData.email || ''),
          phone: safeToString(userData.user?.phone || userData.phone || ''),
          program: safeToString(userData.user?.program?.name || userData.program || userData.user?.program_name || userData.user?.specialization || ''),
          year: safeToString(userData.user?.year || userData.year || userData.user?.course || ''),
          bio: safeToString(userData.user?.bio || userData.bio || ''),
          avatar: safeToString(userData.user?.avatar || userData.avatar || userData.user?.avatarUrl || userData.avatarUrl || '')
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching student profile info:', error);
    return null;
  }
};

// Функція для отримання інформації про викладача
const getTeacherProfileInfo = async (teacherId?: string): Promise<StudentProfileInfo | null> => {
  if (!teacherId) return null;
  
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found for teacher profile');
      return null;
    }

    const response = await fetch(`/api/teachers/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Teacher profile data from API:', data);
      
      return {
        id: data.id || teacherId,
        name: safeToString(data.name || data.full_name || 'Викладач'),
        email: safeToString(data.email || ''),
        phone: safeToString(data.phone || ''),
        program: safeToString(data.department || data.faculty || ''),
        year: '',
        bio: safeToString(data.bio || ''),
        avatar: safeToString(data.avatar || data.avatarUrl || '')
      };
    } else {
      const currentUserResponse = await fetch('/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (currentUserResponse.ok) {
        const userData = await currentUserResponse.json();
        console.log('📋 Current user data for teacher profile:', userData);
        
        return {
          id: userData.user?.id || userData.id || teacherId,
          name: safeToString(userData.user?.name || userData.name || userData.user?.full_name || userData.full_name || 'Викладач'),
          email: safeToString(userData.user?.email || userData.email || ''),
          phone: safeToString(userData.user?.phone || userData.phone || ''),
          program: safeToString(userData.user?.department || userData.department || userData.user?.faculty || userData.faculty || ''),
          year: '',
          bio: safeToString(userData.user?.bio || userData.bio || ''),
          avatar: safeToString(userData.user?.avatar || userData.avatar || userData.user?.avatarUrl || userData.avatarUrl || '')
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching teacher profile info:', error);
    return null;
  }
};

// Функції для роботи з типами робіт
const getWorkTypeLabel = (workType: WorkType): string => {
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

const getWorkTypeIcon = (workType: WorkType) => {
  switch(workType) {
    case 'coursework':
      return BookOpen;
    case 'diploma':
      return GraduationCap;
    case 'practice':
      return Briefcase;
    default:
      return BookOpen;
  }
};

const getWorkTypeColor = (workType: WorkType): string => {
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

// Функція для отримання дат проекту за типом
const getProjectDatesByType = (workType: WorkType) => {
  const now = new Date();
  const startDate = now.toISOString().split('T')[0];
  
  const deadline = new Date(now);
  
  switch(workType) {
    case 'practice':
      deadline.setMonth(now.getMonth() + 1);
      break;
    case 'diploma':
      deadline.setMonth(now.getMonth() + 6);
      break;
    case 'coursework':
    default:
      deadline.setMonth(now.getMonth() + 3);
      break;
  }
  
  return {
    startDate,
    deadline: deadline.toISOString().split('T')[0]
  };
};

// Функція для форматування дати
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Не вказано';
  
  try {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// Функція для збереження проекту в localStorage
const saveProjectToLocalStorage = async (projectData: ProjectData): Promise<void> => {
  try {
    const existingProjects = JSON.parse(localStorage.getItem('studentProjects') || '[]');
    
    const existingProjectIndex = existingProjects.findIndex((project: ProjectData) => 
      project.studentId === projectData.studentId && project.status === 'active'
    );

    let updatedProjects;
    if (existingProjectIndex !== -1) {
      existingProjects[existingProjectIndex] = projectData;
      updatedProjects = existingProjects;
    } else {
      updatedProjects = [...existingProjects, projectData];
    }
    
    localStorage.setItem('studentProjects', JSON.stringify(updatedProjects));
    console.log('💾 Project saved to localStorage:', projectData);
  } catch (error) {
    console.error('❌ Error saving project to localStorage:', error);
    throw error;
  }
};

// Допоміжна функція для отримання факультету з програми
const getFacultyFromProgram = (program: string): string => {
  if (program.includes('комп\'ютер') || program.includes('програм') || program.includes('інформацій')) {
    return "Факультет інформаційних технологій";
  } else if (program.includes('кібербезпека')) {
    return "Факультет кібербезпеки";
  } else if (program.includes('математик')) {
    return "Факультет математики та інформатики";
  } else if (program.includes('штучний інтелект')) {
    return "Факультет штучного інтелекту";
  } else {
    return "Факультет інформаційних технологій";
  }
};

// Функція для отримання стандартних глав за типом проекту
const getDefaultChaptersForProject = (workType: WorkType): Array<{key: string, title: string}> => {
  const chapters = {
    coursework: [
      { key: 'introduction', title: 'Вступ' },
      { key: 'literatureReview', title: 'Огляд літератури' },
      { key: 'methodology', title: 'Методологія дослідження' },
      { key: 'analysis', title: 'Аналіз результатів' },
      { key: 'conclusion', title: 'Висновки та рекомендації' }
    ],
    diploma: [
      { key: 'introduction', title: 'Вступ' },
      { key: 'literatureReview', title: 'Огляд літератури' },
      { key: 'methodology', title: 'Методологія дослідження' },
      { key: 'research', title: 'Експериментальна частина' },
      { key: 'results', title: 'Результати дослідження' },
      { key: 'discussion', title: 'Обговорення результатів' },
      { key: 'conclusion', title: 'Висновки та перспективи' }
    ],
    practice: [
      { key: 'introduction', title: 'Вступ' },
      { key: 'tasks', title: 'Завдання практики' },
      { key: 'process', title: 'Хід виконання роботи' },
      { key: 'results', title: 'Отримані результати' },
      { key: 'conclusion', title: 'Висновки та рекомендації' }
    ]
  };
  
  return chapters[workType] || chapters.coursework;
};

// Допоміжні функції для отримання ID користувачів
const getUserIdFromStudentId = async (studentId: string): Promise<number | null> => {
  try {
    // Якщо studentId вже є числовим ID, повертаємо його
    if (!isNaN(Number(studentId))) {
      return Number(studentId);
    }
    
    // Інакше шукаємо користувача за email або іншим ідентифікатором
    const response = await safeFetch(`/api/users/find?studentId=${studentId}`);
    return response?.id || null;
  } catch (error) {
    console.error('Error getting user ID from student ID:', error);
    return null;
  }
};

const getUserIdFromTeacherId = async (teacherId: string): Promise<number | null> => {
  try {
    // Якщо teacherId вже є числовим ID, повертаємо його
    if (!isNaN(Number(teacherId))) {
      return Number(teacherId);
    }
    
    // Для викладача використовуємо current user ID
    const currentUserId = getCurrentUserId();
    if (currentUserId && !isNaN(Number(currentUserId))) {
      return Number(currentUserId);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID from teacher ID:', error);
    return null;
  }
};

// Функція для створення глав проекту в БД
const createProjectChapters = async (projectData: ProjectData): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token || !projectData.studentId) {
      console.log('❌ Missing token or studentId');
      return false;
    }

    // Отримуємо ID користувача з studentId
    const userId = await getUserIdFromStudentId(projectData.studentId);
    if (!userId) {
      console.log('❌ Could not find user ID for student:', projectData.studentId);
      return false;
    }

    // Визначаємо глави залежно від типу проекту
    const chapters = getDefaultChaptersForProject(projectData.workType);
    
    console.log(`📝 Creating ${chapters.length} chapters for work type: ${projectData.workType}`);

    // Створюємо кожну главу в БД
    for (const chapter of chapters) {
      const chapterData = {
        user_id: userId,
        project_type: projectData.workType,
        chapter_key: chapter.key,
        progress: 0,
        status: 'pending',
        student_note: '',
        title: chapter.title,
        project_title: projectData.workTitle,
        supervisor: projectData.supervisor,
        project_start_date: projectData.startDate,
        project_deadline: projectData.deadline,
        application_id: projectData.applicationId
      };

      const response = await safeFetch('/api/user-chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(chapterData)
      });

      if (!response || !response.id) {
        console.error(`❌ Failed to create chapter ${chapter.key}`, response);
        return false;
      }
      
      console.log(`✅ Chapter created: ${chapter.key}`);
    }
    
    console.log('✅ All project chapters created in database');
    return true;
  } catch (error) {
    console.error('❌ Error creating project chapters:', error);
    return false;
  }
};

// Функція для створення або оновлення запису teacher_students в БД
const createOrUpdateTeacherStudentRecord = async (application: Application): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const teacherId = getCurrentUserId();
    if (!token || !application.studentId || !teacherId) {
      console.log('❌ Missing required data for teacher student record');
      return false;
    }

    // Отримуємо ID користувачів
    const teacherUserId = await getUserIdFromTeacherId(teacherId);
    const studentUserId = await getUserIdFromStudentId(application.studentId);
    
    if (!teacherUserId || !studentUserId) {
      console.log('❌ Could not find user IDs:', { teacherUserId, studentUserId });
      return false;
    }

    // Отримуємо інформацію про студента та викладача
    const studentProfileInfo = await getStudentProfileInfo(application.studentId);
    const teacherInfo = await getTeacherProfileInfo(teacherId);

    // Безпечна обробка числових полів
    const courseValue = parseInt(
      studentProfileInfo?.year?.toString() || 
      application.year?.toString() || 
      '3'
    );

    // Визначаємо дати за типом роботи
    const dates = application.deadline && application.startDate 
      ? { startDate: application.startDate, deadline: application.deadline }
      : getProjectDatesByType(application.workType);

    const studentRecord = {
      teacher_id: teacherUserId,
      student_id: studentUserId,
      student_name: safeToString(studentProfileInfo?.name || application.studentName || ''),
      student_email: safeToString(studentProfileInfo?.email || application.email || ''),
      student_phone: safeToString(studentProfileInfo?.phone || application.phone || ''),
      student_avatar: safeToString(studentProfileInfo?.avatar || application.studentAvatar || ''),
      course: courseValue,
      faculty: getFacultyFromProgram(safeToString(studentProfileInfo?.program || application.program || '')),
      specialty: safeToString(studentProfileInfo?.program || application.program || ''),
      work_type: application.workType,
      work_title: safeToString(application.topic),
      start_date: dates.startDate,
      deadline: dates.deadline,
      progress: 0,
      status: 'active',
      application_id: application.id,
      grade: 0,
      unread_comments: 0,
      last_activity: new Date().toISOString(),
      student_bio: safeToString(studentProfileInfo?.bio || ''),
      confirmed_at: new Date().toISOString(),
      supervisor: safeToString(teacherInfo?.name || 'Викладач'),
      program: safeToString(studentProfileInfo?.program || application.program || ''),
      year: safeToString(studentProfileInfo?.year || application.year || '')
    };

    console.log('📦 Creating teacher student record:', studentRecord);

    // Спочатку перевіряємо, чи запис вже існує
    const existingRecord = await safeFetch(`/api/teacher-students?teacher_id=${teacherUserId}&student_id=${studentUserId}`);
    
    let response;
    if (existingRecord && existingRecord.id) {
      // Оновлюємо існуючий запис
      response = await safeFetch(`/api/teacher-students/${existingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentRecord)
      });
      console.log('✅ Teacher student record updated in database');
    } else {
      // Створюємо новий запис
      response = await safeFetch('/api/teacher-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentRecord)
      });
      console.log('✅ Teacher student record created in database');
    }

    if (response && response.id) {
      return true;
    }
    
    console.error('❌ Failed to create/update teacher student record', response);
    return false;
  } catch (error) {
    console.error('❌ Error creating teacher student record:', error);
    return false;
  }
};

// Функція для збереження проекту в БД
const saveProjectToDatabase = async (application: Application): Promise<boolean> => {
  try {
    const teacherId = getCurrentUserId();
    const teacherInfo = await getTeacherProfileInfo();
    const studentProfileInfo = await getStudentProfileInfo(application.studentId);
    
    // Визначаємо дати за типом роботи
    const dates = application.deadline && application.startDate 
      ? { startDate: application.startDate, deadline: application.deadline }
      : getProjectDatesByType(application.workType);

    const projectData: ProjectData = {
      id: `project-${application.id}-${Date.now()}`,
      projectType: application.workType,
      workTitle: safeToString(application.topic),
      supervisor: safeToString(teacherInfo?.name || 'Викладач'),
      startDate: dates.startDate,
      deadline: dates.deadline,
      studentId: application.studentId,
      teacherId: teacherId || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      applicationId: application.id,
      studentName: safeToString(studentProfileInfo?.name || application.studentName),
      program: safeToString(studentProfileInfo?.program || application.program),
      year: safeToString(studentProfileInfo?.year || application.year),
      workType: application.workType
    };

    // Спочатку створюємо глави для проекту
    const chaptersCreated = await createProjectChapters(projectData);
    
    // Потім створюємо/оновлюємо запис у teacher_students
    const studentRecordCreated = await createOrUpdateTeacherStudentRecord(application);
    
    return chaptersCreated && studentRecordCreated;
  } catch (error) {
    console.error('❌ Error saving project to database:', error);
    return false;
  }
};

// Функція для створення проекту для студента
const createStudentProject = async (application: Application): Promise<boolean> => {
  try {
    const teacherId = getCurrentUserId();
    
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }

    // Отримуємо інформацію про викладача
    const teacherInfo = await getTeacherProfileInfo(teacherId);
    const supervisorName = teacherInfo?.name || 'Викладач';

    // Отримуємо інформацію про студента
    const studentProfileInfo = await getStudentProfileInfo(application.studentId);

    // Визначаємо дати проекту за типом роботи
    const dates = application.deadline && application.startDate 
      ? { startDate: application.startDate, deadline: application.deadline }
      : getProjectDatesByType(application.workType);

    const projectData: ProjectData = {
      id: `project-${application.id}-${Date.now()}`,
      projectType: application.workType,
      workTitle: safeToString(application.topic),
      supervisor: safeToString(supervisorName),
      startDate: dates.startDate,
      deadline: dates.deadline,
      studentId: application.studentId,
      teacherId: teacherId,
      status: 'active',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      applicationId: application.id,
      studentName: safeToString(studentProfileInfo?.name || application.studentName),
      program: safeToString(studentProfileInfo?.program || application.program),
      year: safeToString(studentProfileInfo?.year || application.year),
      workType: application.workType
    };

    console.log('🚀 Creating project with data:', projectData);

    // Спершу зберігаємо в БД
    const dbSuccess = await saveProjectToDatabase(application);
    
    if (dbSuccess) {
      console.log('✅ Project successfully saved to database');
      // Дублюємо в localStorage для швидкого доступу
      await saveProjectToLocalStorage(projectData);
    } else {
      console.warn('⚠️ Database save failed, using localStorage only');
      await saveProjectToLocalStorage(projectData);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating student project:', error);
    
    // Fallback: зберігаємо тільки в localStorage
    try {
      console.log('🔄 Using localStorage fallback...');
      const teacherId = getCurrentUserId();
      const dates = getProjectDatesByType(application.workType);
      
      const projectData: ProjectData = {
        id: `project-${application.id}-${Date.now()}`,
        projectType: application.workType,
        workTitle: safeToString(application.topic),
        supervisor: 'Викладач',
        startDate: dates.startDate,
        deadline: dates.deadline,
        studentId: application.studentId,
        teacherId: teacherId || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
        applicationId: application.id,
        studentName: safeToString(application.studentName),
        program: safeToString(application.program),
        year: safeToString(application.year),
        workType: application.workType
      };
      
      await saveProjectToLocalStorage(projectData);
      console.log('✅ Project created in localStorage fallback');
      return true;
    } catch (localError) {
      console.error('❌ Error creating project in localStorage:', localError);
      return false;
    }
  }
};

// Функція для створення студента при прийнятті заявки
const createStudentFromApplication = async (application: Application): Promise<boolean> => {
  try {
    const token = getAuthToken();
    const teacherId = getCurrentUserId();
    
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }

    const studentProfileInfo = await getStudentProfileInfo(application.studentId);
    const teacherInfo = await getTeacherProfileInfo(teacherId);

    // Визначаємо дати проекту за типом роботи
    const dates = application.deadline && application.startDate 
      ? { startDate: application.startDate, deadline: application.deadline }
      : getProjectDatesByType(application.workType);

    // Безпечна обробка числових полів
    const courseValue = parseInt(
      studentProfileInfo?.year?.toString() || 
      application.year?.toString() || 
      '3'
    );
    
    const studentRecord = {
      teacher_id: teacherId,
      student_name: safeToString(studentProfileInfo?.name || application.studentName),
      student_email: safeToString(studentProfileInfo?.email || application.email),
      student_phone: safeToString(studentProfileInfo?.phone || application.phone),
      student_avatar: safeToString(studentProfileInfo?.avatar || application.studentAvatar),
      course: courseValue,
      faculty: getFacultyFromProgram(safeToString(studentProfileInfo?.program || application.program)),
      specialty: safeToString(studentProfileInfo?.program || application.program),
      work_type: application.workType,
      work_title: safeToString(application.topic),
      start_date: dates.startDate,
      deadline: dates.deadline,
      progress: 0,
      status: 'active',
      application_id: application.id,
      grade: 0,
      unread_comments: 0,
      last_activity: new Date().toISOString(),
      student_bio: safeToString(studentProfileInfo?.bio || ''),
      confirmed_at: new Date().toISOString(),
      supervisor: safeToString(teacherInfo?.name || 'Викладач'),
      program: safeToString(studentProfileInfo?.program || application.program),
      year: safeToString(studentProfileInfo?.year || application.year)
    };

    let newStudentId: string;

    if (token) {
      const response = await safeFetch('/api/teacher/students', {
        method: 'POST',
        body: JSON.stringify(studentRecord)
      });

      if (response && response.id) {
        newStudentId = response.id;
        console.log('✅ Student created via API:', newStudentId);
      } else {
        throw new Error('API request failed');
      }
    } else {
      newStudentId = `student-${application.id}-${Date.now()}`;
    }

    const existingStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
    
    // Безпечна обробка для localStorage
    const newStudent: Student = {
      id: newStudentId,
      name: safeToString(studentProfileInfo?.name || application.studentName),
      email: safeToString(studentProfileInfo?.email || application.email),
      phone: safeToString(studentProfileInfo?.phone || application.phone),
      avatar: safeToString(studentProfileInfo?.avatar || application.studentAvatar),
      course: courseValue,
      faculty: getFacultyFromProgram(safeToString(studentProfileInfo?.program || application.program)),
      specialty: safeToString(studentProfileInfo?.program || application.program),
      workType: application.workType,
      workTitle: safeToString(application.topic),
      startDate: dates.startDate,
      deadline: dates.deadline,
      progress: 0,
      status: 'active',
      lastActivity: new Date().toISOString(),
      grade: 0,
      unreadComments: 0,
      projectType: application.workType,
      teacherId: teacherId,
      confirmedAt: new Date().toISOString(),
      applicationId: application.id,
      supervisor: safeToString(teacherInfo?.name || 'Викладач')
    };
    
    const existingStudentIndex = existingStudents.findIndex((student: Student) => 
      student.id === newStudentId || student.email === newStudent.email
    );

    let updatedStudents;
    if (existingStudentIndex !== -1) {
      existingStudents[existingStudentIndex] = newStudent;
      updatedStudents = existingStudents;
    } else {
      updatedStudents = [...existingStudents, newStudent];
    }
    
    localStorage.setItem('teacherStudents', JSON.stringify(updatedStudents));
    
    const projectCreated = await createStudentProject(application);
    
    if (projectCreated) {
      console.log('✅ Student project created successfully');
    } else {
      console.warn('⚠️ Student project creation had issues, but student was created');
    }
    
    window.dispatchEvent(new CustomEvent('studentsUpdated'));
    window.dispatchEvent(new CustomEvent('studentUpdated', { 
      detail: { 
        studentId: newStudentId,
        applicationData: application 
      } 
    }));
    
    window.dispatchEvent(new CustomEvent('projectsUpdated'));
    
    console.log('✅ Student created with all data and events dispatched:', newStudentId);
    return true;
  } catch (error) {
    console.error('❌ Error creating student:', error);
    
    try {
      const teacherId = getCurrentUserId();
      const existingStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
      
      // Визначаємо дати проекту для fallback
      const dates = getProjectDatesByType(application.workType);
      
      // Безпечна обробка для fallback
      const fallbackCourse = parseInt(application.year?.toString() || '3');
      
      const newStudent: Student = {
        id: `student-${application.id}-${Date.now()}`,
        name: safeToString(application.studentName),
        email: safeToString(application.email),
        phone: safeToString(application.phone),
        avatar: safeToString(application.studentAvatar),
        course: fallbackCourse,
        faculty: getFacultyFromProgram(safeToString(application.program)),
        specialty: safeToString(application.program),
        workType: application.workType,
        workTitle: safeToString(application.topic),
        startDate: dates.startDate,
        deadline: dates.deadline,
        progress: 0,
        status: 'active',
        lastActivity: new Date().toISOString(),
        grade: 0,
        unreadComments: 0,
        projectType: application.workType,
        teacherId: teacherId || undefined,
        confirmedAt: new Date().toISOString(),
        applicationId: application.id,
        supervisor: 'Викладач'
      };
      
      const existingStudentIndex = existingStudents.findIndex((student: Student) => 
        student.email === newStudent.email
      );

      let updatedStudents;
      if (existingStudentIndex !== -1) {
        existingStudents[existingStudentIndex] = newStudent;
        updatedStudents = existingStudents;
      } else {
        updatedStudents = [...existingStudents, newStudent];
      }
      
      localStorage.setItem('teacherStudents', JSON.stringify(updatedStudents));
      
      await createStudentProject(application);
      
      window.dispatchEvent(new CustomEvent('studentsUpdated'));
      window.dispatchEvent(new CustomEvent('studentUpdated', { 
        detail: { 
          studentId: newStudent.id,
          applicationData: application 
        } 
      }));
      
      window.dispatchEvent(new CustomEvent('projectsUpdated'));
      
      console.log('✅ Student created in localStorage with all data:', newStudent.id);
      return true;
    } catch (localError) {
      console.error('❌ Error creating student in localStorage:', localError);
      return false;
    }
  }
};

const TeacherApplications = () => {
  const { t } = useTranslation();
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkType | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState<number | null>(null);
  
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileInfo | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loadingStudentProfile, setLoadingStudentProfile] = useState<string | null>(null);

  // Завантаження заявок з API
  useEffect(() => {
    const teacherId = getCurrentUserId();
    setCurrentTeacherId(teacherId);
    
    if (teacherId) {
      fetchApplications(teacherId);
    } else {
      setIsLoading(false);
      toast.error('Не вдалося ідентифікувати викладача');
    }

    // Додаємо слухач події для оновлення заявок при створенні нової
    const handleApplicationCreated = (event: CustomEvent) => {
      const { teacherId: eventTeacherId } = event.detail;
      
      // Перевіряємо, чи це заявка для поточного викладача
      if (currentTeacherId && eventTeacherId && 
          currentTeacherId.toString() === eventTeacherId.toString()) {
        
        console.log('🔄 New application created, refreshing list...');
        
        // Оновлюємо список заявок
        fetchApplications(currentTeacherId);
        
        // Показуємо сповіщення
        setTimeout(() => {
          toast.info('Отримано нову заявку від студента!');
        }, 500);
      }
    };

    // Додаємо слухач подій
    window.addEventListener('applicationCreated', handleApplicationCreated as EventListener);

    return () => {
      window.removeEventListener('applicationCreated', handleApplicationCreated as EventListener);
    };
  }, []);

  const fetchApplications = async (teacherId: string) => {
    try {
      setIsLoading(true);
      
      // Використовуємо правильний ендпоінт з параметром teacher_id
      const data = await safeFetch(`/api/teacher/applications?teacher_id=${teacherId}`);
      
      console.log('📋 Fetched applications for teacher:', teacherId, data);
      
      let apiApplications: unknown[] = [];

      if (data && data.applications) {
        apiApplications = Array.isArray(data.applications) ? data.applications : [];
      } else if (Array.isArray(data)) {
        apiApplications = data;
      } else if (data && typeof data === 'object' && data.data) {
        apiApplications = Array.isArray(data.data) ? data.data : [];
      }

      console.log(`📊 Found ${apiApplications.length} applications for teacher ${teacherId}`);

      const formattedApplications: Application[] = apiApplications.map((app: unknown) => {
        const appData = app as Record<string, unknown>;
        
        console.log('📄 Processing application:', appData);
        
        // КОНВЕРТУЄМО ТИПИ ДЛЯ СУМІСНОСТІ
        const workType: WorkType = (() => {
          const type = appData.work_type || appData.workType || appData.type;
          if (type === 'diploma' || type === 'Дипломна' || type === 'diploma') return 'diploma';
          if (type === 'practice' || type === 'Практика' || type === 'practice') return 'practice';
          return 'coursework';
        })();
        
        // КОНВЕРТУЄМО STATUS
        const status: ApplicationStatus = (() => {
          const stat = appData.status || 'pending';
          if (stat === 'accepted' || stat === 'прийнято' || stat === 'accepted') return 'accepted';
          if (stat === 'rejected' || stat === 'відхилено' || stat === 'rejected') return 'rejected';
          return 'pending';
        })();

        // ФОРМАТУЄМО ДАТУ
        let formattedDate = 'Не вказано';
        try {
          if (appData.created_at || appData.application_date || appData.date) {
            const dateStr = appData.created_at as string || 
                           appData.application_date as string || 
                           appData.date as string;
            formattedDate = new Date(dateStr).toLocaleDateString('uk-UA', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        } catch (dateError) {
          console.error('Date formatting error:', dateError);
        }

        // СТВОРЮЄМО ОБ'ЄКТ ЗАЯВКИ З УРАХУВАННЯМ ВСІХ ПОЛІВ
        return {
          id: Number(appData.id) || 0,
          studentName: safeToString(
            appData.student_name || 
            appData.studentName || 
            appData.student_full_name || 
            'Студент'
          ),
          studentAvatar: safeToString(
            appData.student_avatar || 
            appData.avatar || 
            appData.studentAvatar || 
            ''
          ),
          program: safeToString(
            appData.student_program || 
            appData.program || 
            appData.student_specialty_name || 
            'Не вказано'
          ),
          year: safeToString(
            appData.student_year || 
            appData.year || 
            appData.course || 
            'Не вказано'
          ),
          topic: safeToString(appData.topic || 'Без назви'),
          workType: workType,
          type: workType === 'coursework' ? 'course' : 
                workType === 'diploma' ? 'diploma' : 'practice',
          status: status,
          date: formattedDate,
          email: safeToString(
            appData.student_email || 
            appData.email || 
            appData.student_mail || 
            'Не вказано'
          ),
          phone: safeToString(
            appData.student_phone || 
            appData.phone || 
            appData.student_phone_number || 
            ''
          ),
          description: safeToString(
            appData.description || 
            appData.project_description || 
            'Опис відсутній'
          ),
          expanded: false,
          teacherId: safeToString(appData.teacher_id || teacherId),
          studentId: safeToString(
            appData.student_id || 
            appData.studentId || 
            appData.user_id || 
            ''
          ),
          deadline: safeToString(appData.deadline),
          startDate: safeToString(appData.start_date || appData.startDate),
          goals: safeToString(appData.goals || ''),
          requirements: safeToString(appData.requirements || ''),
          rejection_reason: safeToString(appData.rejection_reason || appData.rejectionReason || ''),
          created_at: safeToString(appData.created_at),
          application_date: safeToString(appData.application_date)
        };
      });

      console.log(`✅ Formatted ${formattedApplications.length} applications`);
      setApplications(formattedApplications);
      
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      toast.error('Помилка завантаження заявок');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функція для відкриття профілю студента
  const openStudentProfile = async (application: Application) => {
    setLoadingStudentProfile(application.studentId || application.id.toString());
    
    try {
      const studentProfileInfo = await getStudentProfileInfo(application.studentId);
      
      if (studentProfileInfo) {
        setSelectedStudent({
          id: studentProfileInfo.id,
          name: studentProfileInfo.name || application.studentName,
          email: studentProfileInfo.email || application.email,
          phone: studentProfileInfo.phone || application.phone,
          program: studentProfileInfo.program || application.program,
          year: studentProfileInfo.year || application.year,
          bio: studentProfileInfo.bio || 'Біографія не вказана',
          avatar: studentProfileInfo.avatar || application.studentAvatar
        });
      } else {
        setSelectedStudent({
          id: application.studentId || `student-${application.id}`,
          name: application.studentName,
          email: application.email,
          phone: application.phone,
          program: application.program,
          year: application.year,
          bio: 'Біографія не доступна',
          avatar: application.studentAvatar
        });
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      setSelectedStudent({
        id: application.studentId || `student-${application.id}`,
        name: application.studentName,
        email: application.email,
        phone: application.phone,
        program: application.program,
        year: application.year,
        bio: 'Не вдалося завантажити біографію',
        avatar: application.studentAvatar
      });
    } finally {
      setLoadingStudentProfile(null);
      setIsProfileModalOpen(true);
    }
  };

  // Функція для закриття профілю
  const closeStudentProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedStudent(null);
  };

  const toggleApplication = (id: number) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  // Функція для прийнятті студента
  const acceptStudent = async (application: Application) => {
    setIsProcessing(application.id);
    try {
      const token = getAuthToken();
      
      if (token) {
        const response = await safeFetch(`/api/teacher/applications/${application.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
        });

        if (!response) {
          throw new Error('Failed to update application status');
        }
      }

      const studentCreated = await createStudentFromApplication(application);
      
      if (studentCreated) {
        updateApplicationStatus(application.id, "accepted");
        
        window.dispatchEvent(new CustomEvent('studentsUpdated'));
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        
        const teacherInfo = await getTeacherProfileInfo(currentTeacherId || undefined);
        const supervisorName = teacherInfo?.name || 'Викладач';
        const dates = getProjectDatesByType(application.workType);
        
        const WorkTypeIcon = getWorkTypeIcon(application.workType);
        
        toast.success(`Студент ${application.studentName} успішно прийнятий! 🎉`, {
          description: (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <WorkTypeIcon className="w-4 h-4" />
                <span><strong>Тип роботи:</strong> {getWorkTypeLabel(application.workType)}</span>
              </div>
              <div><strong>Тема:</strong> {application.topic}</div>
              <div><strong>Керівник:</strong> {supervisorName}</div>
              <div><strong>Початок:</strong> {formatDate(dates.startDate)}</div>
              <div><strong>Дедлайн:</strong> {formatDate(dates.deadline)}</div>
              <div className="pt-1">Студент тепер з'явиться у вашому списку на головній панелі.</div>
            </div>
          ),
          duration: 8000
        });
        
        if (currentTeacherId) {
          setTimeout(() => {
            fetchApplications(currentTeacherId);
          }, 1000);
        }
      } else {
        throw new Error('Failed to create student record');
      }
    } catch (error) {
      console.error('❌ Error accepting student:', error);
      toast.error('Сталася помилка при прийнятті студента');
    } finally {
      setIsProcessing(null);
    }
  };

  // Функція для відхилення заявки
  const rejectStudent = async (application: Application, comment?: string) => {
    setIsProcessing(application.id);
    try {
      const token = getAuthToken();
      
      if (token) {
        const response = await safeFetch(`/api/teacher/applications/${application.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'rejected',
            rejection_reason: comment || 'Заявка відхилена викладачем',
            rejected_at: new Date().toISOString()
          })
        });

        if (!response) {
          throw new Error('Failed to update application status');
        }
      }

      updateApplicationStatus(application.id, "rejected");
      toast.success(`Заявку студента ${application.studentName} відхилено`);
      
      setShowRejectionDialog(null);
      setRejectionComment("");
      
      if (currentTeacherId) {
        setTimeout(() => {
          fetchApplications(currentTeacherId);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      toast.error('Сталася помилка при відхиленні заявки');
    } finally {
      setIsProcessing(null);
    }
  };

  // Функція для відкриття діалогу відхилення
  const openRejectionDialog = (applicationId: number) => {
    setShowRejectionDialog(applicationId);
    setRejectionComment("");
  };

  // Функція для закриття діалогу відхилення
  const closeRejectionDialog = () => {
    setShowRejectionDialog(null);
    setRejectionComment("");
  };

  const updateApplicationStatus = (id: number, status: ApplicationStatus) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status } : app
    ));
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesWorkType = workTypeFilter === "all" || app.workType === workTypeFilter;
    
    return matchesSearch && matchesStatus && matchesWorkType;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    accepted: applications.filter(app => app.status === "accepted").length,
    rejected: applications.filter(app => app.status === "rejected").length
  };

  const workTypeStats = {
    coursework: applications.filter(app => app.workType === 'coursework').length,
    diploma: applications.filter(app => app.workType === 'diploma').length,
    practice: applications.filter(app => app.workType === 'practice').length
  };

  const refreshApplications = () => {
    if (currentTeacherId) {
      fetchApplications(currentTeacherId);
      toast.info('Оновлення списку заявок...');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    let config;
    
    switch (status) {
      case 'pending': {
        config = { variant: 'secondary' as const, text: 'На розгляді', icon: Clock };
        break;
      }
      case 'accepted': {
        config = { variant: 'default' as const, text: 'Прийнято', icon: CheckCircle };
        break;
      }
      case 'rejected': {
        config = { variant: 'destructive' as const, text: 'Відхилено', icon: AlertCircle };
        break;
      }
      default: {
        config = { variant: 'secondary' as const, text: 'На розгляді', icon: Clock };
      }
    }
    
    const { variant, text, icon: Icon } = config;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
    );
  };

  const getWorkTypeBadge = (workType: WorkType) => {
    const Icon = getWorkTypeIcon(workType);
    
    return (
      <Badge className={`flex items-center gap-1 ${getWorkTypeColor(workType)}`}>
        <Icon className="w-3 h-3" />
        {getWorkTypeLabel(workType)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{t('studentapplications', { defaultValue: "Заявки студентів" })}</h1>
                <p className="text-muted-foreground mt-1">
                  Керуйте заявками студентів на керівництво роботами
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Пошук заявок..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі статуси</SelectItem>
                    <SelectItem value="pending">Очікують</SelectItem>
                    <SelectItem value="accepted">Прийняті</SelectItem>
                    <SelectItem value="rejected">Відхилені</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={workTypeFilter} onValueChange={(value) => setWorkTypeFilter(value as WorkType | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Тип роботи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі типи</SelectItem>
                    <SelectItem value="coursework">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Курсова</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="diploma">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Дипломна</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="practice">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Практика</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={refreshApplications}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Всього заявок
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Очікують
                      </p>
                      <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Прийняті
                      </p>
                      <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Відхилені
                      </p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Успішність
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                      </p>
                    </div>
                    <FileCheck className="h-6 w-6 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Статистика за типами робіт */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Курсові</p>
                        <p className="text-xl font-bold text-green-700">{workTypeStats.coursework}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {workTypeStats.coursework > 0 ? Math.round((workTypeStats.coursework / stats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Дипломні</p>
                        <p className="text-xl font-bold text-purple-700">{workTypeStats.diploma}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {workTypeStats.diploma > 0 ? Math.round((workTypeStats.diploma / stats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Практики</p>
                        <p className="text-xl font-bold text-blue-700">{workTypeStats.practice}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {workTypeStats.practice > 0 ? Math.round((workTypeStats.practice / stats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Список заявок */}
            <div className="space-y-4">
              {isLoading ? (
                <Card className="bg-card text-center py-8 border">
                  <CardContent>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Завантаження заявок...</p>
                  </CardContent>
                </Card>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <Card key={application.id} className="bg-card overflow-hidden border hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div 
                        className={`p-4 cursor-pointer transition-colors ${
                          expandedApplication === application.id ? "bg-muted/50 border-b" : "hover:bg-muted/30"
                        }`}
                        onClick={() => toggleApplication(application.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4 flex-1">
                            <div 
                              className="relative cursor-pointer hover:scale-105 transition-transform group"
                              onClick={(e) => {
                                e.stopPropagation();
                                openStudentProfile(application);
                              }}
                              title="Переглянути профіль студента"
                            >
                              <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                <AvatarImage src={application.studentAvatar} />
                                <AvatarFallback className="bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  {loadingStudentProfile === (application.studentId || application.id.toString()) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  ) : (
                                    getInitials(application.studentName)
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 
                                  className="font-semibold text-lg truncate hover:text-primary transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openStudentProfile(application);
                                  }}
                                  title="Переглянути профіль студента"
                                >
                                  {application.studentName}
                                </h3>
                                {getStatusBadge(application.status)}
                                {getWorkTypeBadge(application.workType)}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                                <span>{application.program}</span>
                                <span>•</span>
                                <span>{application.year}</span>
                              </div>
                              <p className="text-sm font-medium line-clamp-2">{application.topic}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{application.date}</span>
                            {application.deadline && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>до {formatDate(application.deadline)}</span>
                              </div>
                            )}
                            {expandedApplication === application.id ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedApplication === application.id && (
                        <div className="px-4 pb-4 space-y-4 mt-2 animate-in fade-in duration-200">
                          {/* Інформація про тип роботи та дати */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-muted/20 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                {getWorkTypeBadge(application.workType)}
                              </div>
                              <div className="space-y-1 text-sm">
                                {application.startDate && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span><strong>Початок:</strong> {formatDate(application.startDate)}</span>
                                  </div>
                                )}
                                {application.deadline && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span><strong>Дедлайн:</strong> {formatDate(application.deadline)}</span>
                                  </div>
                                )}
                                {!application.deadline && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span><strong>Пропонований дедлайн:</strong> {formatDate(getProjectDatesByType(application.workType).deadline)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-muted/20 p-3 rounded-lg">
                              <h4 className="font-medium mb-2 text-sm">Деталі заявки</h4>
                              {application.goals && (
                                <div className="mb-2">
                                  <p className="text-xs text-muted-foreground mb-1">Цілі:</p>
                                  <p className="text-sm">{application.goals}</p>
                                </div>
                              )}
                              {application.requirements && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Вимоги:</p>
                                  <p className="text-sm">{application.requirements}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <h4 className="font-medium mb-2 text-lg">
                              Опис проекту
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {application.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                              <Mail className="h-4 w-4 text-primary" />
                              <span className="text-sm">{application.email}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                              <Phone className="h-4 w-4 text-primary" />
                              <span className="text-sm">{application.phone || 'Не вказано'}</span>
                            </div>
                          </div>
                          
                          {application.rejection_reason && application.status === 'rejected' && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <h4 className="font-medium text-red-700 dark:text-red-300">Причина відхилення:</h4>
                              </div>
                              <p className="text-sm text-red-600 dark:text-red-400">{application.rejection_reason}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                            {application.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={() => acceptStudent(application)}
                                  disabled={isProcessing === application.id}
                                >
                                  {isProcessing === application.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Прийняти заявку
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => openRejectionDialog(application.id)}
                                  disabled={isProcessing === application.id}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Відхилити заявку
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                              onClick={() => openStudentProfile(application)}
                              disabled={loadingStudentProfile === (application.studentId || application.id.toString())}
                            >
                              {loadingStudentProfile === (application.studentId || application.id.toString()) ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                                  Завантаження...
                                </>
                              ) : (
                                'Переглянути профіль'
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                              asChild
                            >
                              <a href={`mailto:${application.email}?subject=Відповідь на заявку щодо ${application.workType === 'coursework' ? 'курсової роботи' : application.workType === 'diploma' ? 'дипломного проєкту' : 'звіту з практики'}&body=Шановний(а) ${application.studentName},%0D%0A%0D%0AЩодо вашої заявки на тему "${application.topic}"%0D%0AТип роботи: ${getWorkTypeLabel(application.workType)}%0D%0A%0D%0A`}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Написати студенту
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-card text-center py-12 border">
                  <CardContent>
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      Заявок не знайдено
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter !== "all" || workTypeFilter !== "all" 
                        ? "Спробуйте змінити параметри пошуку або фільтрації"
                        : "Наразі немає заявок від студентів. Нові заявки з'являться тут автоматично."
                      }
                    </p>
                    {(searchTerm || statusFilter !== "all" || workTypeFilter !== "all") && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setWorkTypeFilter('all');
                        }}
                      >
                        Скинути фільтри
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Діалог відхилення заявки */}
      {showRejectionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Відхилити заявку</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeRejectionDialog}
                  disabled={isProcessing === showRejectionDialog}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Чи бажаєте додати коментар щодо причини відхилення? (необов'язково)
                </p>
                
                <Textarea
                  placeholder="Введіть коментар до відхилення..."
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  rows={4}
                  disabled={isProcessing === showRejectionDialog}
                />
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={closeRejectionDialog}
                    disabled={isProcessing === showRejectionDialog}
                  >
                    Скасувати
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const application = applications.find(app => app.id === showRejectionDialog);
                      if (application) {
                        rejectStudent(application, rejectionComment);
                      }
                    }}
                    disabled={isProcessing === showRejectionDialog}
                  >
                    {isProcessing === showRejectionDialog ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Обробка...
                      </>
                    ) : (
                      'Відхилити заявку'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Модальне вікно профілю студента */}
      <StudentProfileModal
        open={isProfileModalOpen}
        onOpenChange={(open) => {
          if (!open) closeStudentProfile();
        }}
        studentId={selectedStudent?.id || ''}
        initialData={
          selectedStudent ? {
            name: selectedStudent.name,
            email: selectedStudent.email,
            phone: selectedStudent.phone || '',
            program: selectedStudent.program || '',
            year: selectedStudent.year || '',
            bio: selectedStudent.bio || 'Біографія не вказана',
            avatar: selectedStudent.avatar || selectedStudent.studentAvatar || ''
          } : undefined
        }
      />
    </div>
  );
};

export default TeacherApplications;