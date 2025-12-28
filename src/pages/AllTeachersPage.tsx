import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { To } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Mail, 
  Phone, 
  Building, 
  Star, 
  Users, 
  CheckCircle,
  X,
  Send,
  Target,
  User,
  Loader2 as Spinner
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeacherProfileModal } from '@/components/TeacherProfileModal';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Teacher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  departmentId: number;
  faculty: string;
  facultyId: number;
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
}

interface FilterTeacher {
  faculty_id?: number;
  facultyId?: number;
  id: number;
  name?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  department?: string;
  department_name?: string;
  departmentId?: number;
  department_id?: number;
  faculty?: string;
  faculty_name?: string;
  bio?: string;
  avatar_url?: string;
  avatarUrl?: string | null;
  email?: string;
  office_hours?: string;
  officeHours?: string;
  phone?: string;
  website?: string;
  skills?: string[] | string;
  rating?: number | string;
  student_count?: number;
  studentCount?: number;
  projects_completed?: number;
  projectsCompleted?: number;
  is_available?: boolean;
  isAvailable?: boolean;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  program?: string;
  year?: string;
  course?: number;
  group?: string;
  specialty_id?: number;
  specialty_code?: string;
  specialty_name?: string;
  faculty_id?: number;
  faculty_name?: string;
  bio?: string;
}

interface ApplicationFormData {
  topic: string;
  description: string;
  goals: string;
  requirements: string;
  teacherId: string;
  deadline: string;
  workType: 'coursework' | 'diploma' | 'practice';
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_program?: string;
  student_year?: string;
  student_group?: string;
  student_id?: string;
  student_specialty_id?: number;
  student_specialty_code?: string;
  student_faculty_id?: number;
}

const AllTeachersPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [currentUserFacultyId, setCurrentUserFacultyId] = useState<number | null>(null);

  // НОВІ СТАНІ ДЛЯ ЗАЯВКИ
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationFormData, setApplicationFormData] = useState<ApplicationFormData>({
    topic: '',
    description: '',
    goals: '',
    requirements: '',
    teacherId: '',
    deadline: '',
    workType: 'coursework',
    student_name: '',
    student_email: '',
    student_phone: '',
    student_program: '',
    student_year: '',
    student_group: '',
    student_id: '',
    student_specialty_id: undefined,
    student_specialty_code: '',
    student_faculty_id: undefined
  });
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacherForApplication, setSelectedTeacherForApplication] = useState<Teacher | null>(null);

  const topic = searchParams.get('topic');
  const facultyId = searchParams.get('faculty');

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

  // Функція для отримання інформації про студента
  const getStudentInfo = async (): Promise<StudentInfo | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('❌ No token found');
        return null;
      }

      // Спершу пробуємо з localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser.name && currentUser.name !== 'Студент') {
            return {
              id: currentUser.id || '',
              name: currentUser.name,
              email: currentUser.email || '',
              phone: currentUser.phone || '',
              program: currentUser.program || currentUser.specialization || '',
              year: currentUser.year || currentUser.course || '',
              course: currentUser.course ? parseInt(currentUser.course) : 
                     currentUser.year ? parseInt(currentUser.year) : undefined,
              group: currentUser.group || '',
              specialty_id: currentUser.specialty_id,
              specialty_code: currentUser.specialty_code || '',
              specialty_name: currentUser.specialty_name || currentUser.specialty || '',
              faculty_id: currentUser.faculty_id,
              faculty_name: currentUser.faculty_name || currentUser.faculty || ''
            };
          }
        } catch {
          console.log('LocalStorage data not available or invalid');
        }
      }

      // Якщо в localStorage немає, робимо API запит
      const response = await fetch('/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        let studentName = '';
        
        if (data.user?.full_name) studentName = data.user.full_name;
        else if (data.user?.name) studentName = data.user.name;
        else if (data.user?.first_name && data.user?.last_name) {
          studentName = `${data.user.first_name} ${data.user.last_name}`.trim();
        }
        else if (data.full_name) studentName = data.full_name;
        else if (data.name) studentName = data.name;
        else if (data.email) {
          const emailPart = data.email.split('@')[0];
          studentName = emailPart.split('.').map((part: string) => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
        } else {
          studentName = 'Студент';
        }

        const specialtyId = data.user?.specialty_id || 
                           data.specialty_id || 
                           data.user?.specialty?.id || 
                           data.specialty?.id;
        
        const specialtyCode = data.user?.specialty_code || 
                             data.specialty_code || 
                             data.user?.specialty?.code || 
                             data.specialty?.code;
        
        const specialtyName = data.user?.specialty_name || 
                             data.specialty_name || 
                             data.user?.specialty?.name || 
                             data.specialty?.name;
        
        const course = data.user?.course || 
                       data.course || 
                       data.user?.year || 
                       data.year;
        
        const facultyId = data.user?.faculty_id || 
                         data.faculty_id || 
                         data.user?.faculty?.id || 
                         data.faculty?.id;
        
        const facultyName = data.user?.faculty_name || 
                           data.faculty_name || 
                           data.user?.faculty?.name || 
                           data.faculty?.name;

        const studentInfoData: StudentInfo = {
          id: data.user?.id || data.id || '',
          name: studentName,
          email: data.user?.email || data.email || '',
          phone: data.user?.phone || data.phone || '',
          program: data.user?.program?.name || data.program || data.user?.program_name || data.user?.specialization || '',
          year: data.user?.year || data.year || data.user?.course || '',
          course: course ? parseInt(course) : undefined,
          group: data.user?.group || data.group || data.user?.student_group || data.student_group || '',
          specialty_id: specialtyId ? parseInt(specialtyId) : undefined,
          specialty_code: specialtyCode || '',
          specialty_name: specialtyName || '',
          faculty_id: facultyId ? parseInt(facultyId) : undefined,
          faculty_name: facultyName || ''
        };

        // Зберігаємо в localStorage для майбутнього використання
        try {
          localStorage.setItem('currentUser', JSON.stringify(studentInfoData));
        } catch {
          console.log('⚠️ Could not update localStorage');
        }

        return studentInfoData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching student info:', error);
      return null;
    }
  };

  // Отримання факультету поточного користувача
  useEffect(() => {
    const getCurrentUserFaculty = async () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          console.log('❌ No token found');
          toast.error('Будь ласка, увійдіть в систему');
          setIsLoading(false);
          return;
        }

        // Спершу пробуємо отримати з localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          try {
            const currentUser = JSON.parse(currentUserStr);
            console.log('📋 Current user from localStorage:', currentUser);
            
            if (currentUser.facultyId || currentUser.faculty_id) {
              const facultyId = currentUser.facultyId || currentUser.faculty_id;
              setCurrentUserFacultyId(facultyId);
              console.log('🎯 Setting faculty_id from localStorage:', facultyId);
              return;
            }
          } catch {
            console.error('Error parsing currentUser from localStorage');
          }
        }

        // Якщо не знайшли в localStorage, запитуємо API
        // Спробуємо отримати з API студентського профілю
        try {
          const response = await fetch('/api/student/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Student profile data:', data);
            
            if (data.faculty_id) {
              setCurrentUserFacultyId(data.faculty_id);
              console.log('🎯 Setting faculty_id from student profile API:', data.faculty_id);
              
              // Оновлюємо localStorage
              try {
                const updatedUser = {
                  ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
                  facultyId: data.faculty_id,
                  faculty_id: data.faculty_id
                };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              } catch {
                console.error('Error updating localStorage');
              }
              return;
            }
          }
        } catch {
          console.log('⚠️ Student profile API not available, trying current-user...');
        }

        // Якщо не вдалося, пробуємо current-user endpoint
        try {
          const currentUserResponse = await fetch('/api/current-user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (currentUserResponse.ok) {
            const data = await currentUserResponse.json();
            console.log('📋 Current user from API:', data);
            
            const facultyId = data.faculty_id || data.user?.faculty_id || data.facultyId;
            if (facultyId) {
              setCurrentUserFacultyId(facultyId);
              console.log('🎯 Setting faculty_id from current-user API:', facultyId);
            }
          }
        } catch {
          console.error('Error fetching current user');
        }
      } catch (error) {
        console.error('Error getting current user faculty:', error);
      }
    };

    getCurrentUserFaculty();
  }, []);

  // Завантаження викладачів
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        const token = getAuthToken();
        
        if (!token) {
          toast.error('Будь ласка, увійдіть в систему');
          setIsLoading(false);
          return;
        }

        // Якщо facultyId передано через параметри URL, використовуємо його
        // Інакше використовуємо faculty_id поточного користувача
        const targetFacultyId = facultyId || currentUserFacultyId;

        if (!targetFacultyId) {
          console.log('⚠️ No faculty ID available yet');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Fetching teachers for faculty_id:', targetFacultyId);

        // Запит до API для отримання всіх викладачів факультету
        const response = await fetch(`/api/faculty/${targetFacultyId}/teachers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Teachers data:', data);
          
          // Трансформація даних з API
          const transformedTeachers: Teacher[] = data.map((teacher: any) => ({
            id: teacher.id.toString(),
            name: teacher.name || teacher.full_name || 'Невідомий викладач',
            firstName: teacher.firstName || '',
            lastName: teacher.lastName || '',
            title: teacher.title || 'Викладач',
            department: teacher.department || teacher.department_name || 'Невідома кафедра',
            departmentId: teacher.departmentId || teacher.department_id || 0,
            faculty: teacher.faculty || teacher.faculty_name || 'Невідомий факультет',
            facultyId: teacher.facultyId || teacher.faculty_id || 0,
            bio: teacher.bio || 'Опис відсутній.',
            avatarUrl: teacher.avatarUrl || teacher.avatar_url || null,
            email: teacher.email || '',
            officeHours: teacher.officeHours || teacher.office_hours || 'Не вказано',
            phone: teacher.phone || '',
            website: teacher.website || '',
            skills: Array.isArray(teacher.skills) ? teacher.skills : 
                    (typeof teacher.skills === 'string' ? 
                      (teacher.skills.includes(',') ? teacher.skills.split(',').map((s: string) => s.trim()) : 
                      (teacher.skills.startsWith('[') ? JSON.parse(teacher.skills) : [teacher.skills])) : []),
            rating: typeof teacher.rating === 'number' ? teacher.rating : 
                    (typeof teacher.rating === 'string' ? parseFloat(teacher.rating) : 4.5),
            studentCount: teacher.studentCount || teacher.student_count || 0,
            projectsCompleted: teacher.projectsCompleted || teacher.projects_completed || 0,
            isAvailable: teacher.isAvailable !== false && teacher.is_available !== false,
          }));

          setTeachers(transformedTeachers);
          setFilteredTeachers(transformedTeachers);
        } else if (response.status === 404) {
          // Якщо ендпоінт не знайдено, використовуємо альтернативний спосіб
          console.log('⚠️ Faculty teachers endpoint not found, trying alternative...');
          await fetchTeachersAlternative(targetFacultyId.toString(), token);
        } else {
          const errorData = await response.json();
          console.error('Error fetching teachers from API:', response.status, errorData);
          toast.error(errorData.message || 'Не вдалося завантажити список викладачів');
          setTeachers([]);
          setFilteredTeachers([]);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Помилка при завантаженні викладачів');
        setTeachers([]);
        setFilteredTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTeachersAlternative = async (facultyId: string, token: string) => {
      try {
        // Альтернативний спосіб: отримати всіх користувачів з ролью teacher і відфільтрувати
        const response = await fetch('/api/users?role=teacher', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const allTeachers = await response.json() as FilterTeacher[];
          
          // Фільтруємо за faculty_id
          const facultyTeachers = allTeachers.filter((teacher: FilterTeacher) => 
            (teacher.faculty_id?.toString() === facultyId || teacher.facultyId?.toString() === facultyId)
          );

          console.log('✅ Filtered teachers for faculty:', facultyTeachers);
          
          const transformedTeachers: Teacher[] = facultyTeachers.map((teacher: FilterTeacher) => {
            // Обробляємо skills
            let skills: string[] = [];
            if (teacher.skills) {
              if (Array.isArray(teacher.skills)) {
                skills = teacher.skills;
              } else if (typeof teacher.skills === 'string') {
                try {
                  skills = JSON.parse(teacher.skills);
                } catch {
                  skills = teacher.skills.split(',').map(s => s.trim());
                }
              }
            }

            return {
              id: teacher.id.toString(),
              name: teacher.name || teacher.full_name || 'Невідомий викладач',
              firstName: teacher.firstName || '',
              lastName: teacher.lastName || '',
              title: teacher.title || 'Викладач',
              department: teacher.department_name || teacher.department || 'Невідома кафедра',
              departmentId: teacher.department_id || teacher.departmentId || 0,
              faculty: teacher.faculty_name || teacher.faculty || 'Невідомий факультет',
              facultyId: teacher.faculty_id || teacher.facultyId || 0,
              bio: teacher.bio || 'Опис відсутній.',
              avatarUrl: teacher.avatar_url || teacher.avatarUrl || null,
              email: teacher.email || '',
              officeHours: teacher.office_hours || teacher.officeHours || 'Не вказано',
              phone: teacher.phone || '',
              website: teacher.website || '',
              skills: skills,
              rating: typeof teacher.rating === 'string' ? parseFloat(teacher.rating) : (teacher.rating || 4.5),
              studentCount: teacher.student_count || teacher.studentCount || 0,
              projectsCompleted: teacher.projects_completed || teacher.projectsCompleted || 0,
              isAvailable: teacher.is_available !== false,
            };
          });

          setTeachers(transformedTeachers);
          setFilteredTeachers(transformedTeachers);
        } else {
          throw new Error('Failed to fetch teachers');
        }
      } catch (error) {
        console.error('Error in alternative teacher fetch:', error);
        setTeachers([]);
        setFilteredTeachers([]);
      }
    };

    // Завантажуємо викладачів тільки коли ми маємо faculty_id
    if (currentUserFacultyId || facultyId) {
      fetchTeachers();
    } else {
      // Якщо faculty_id ще не завантажено, чекаємо
      const timer = setTimeout(() => {
        if (!currentUserFacultyId && !facultyId) {
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUserFacultyId, facultyId]);

  // Фільтрація викладачів
  useEffect(() => {
    let filtered = teachers;

    // Фільтр за пошуком
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Фільтр за кафедрою
    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.department === departmentFilter);
    }

    // Фільтр за доступністю
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(teacher => teacher.isAvailable);
    } else if (availabilityFilter === 'busy') {
      filtered = filtered.filter(teacher => !teacher.isAvailable);
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, departmentFilter, availabilityFilter]);

  // НОВІ ФУНКЦІЇ ДЛЯ РОБОТИ З ЗАЯВКАМИ

  // Функція для відкриття форми заявки
  const handleOpenApplicationForm = async (teacher: Teacher) => {
    // Завантажуємо інформацію про студента
    const studentData = await getStudentInfo();
    setStudentInfo(studentData);

    // Отримуємо дедлайн за замовчуванням за типом роботи
    const getDefaultDeadline = () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3); // За замовчуванням курсова - 3 місяці
      return date.toISOString().split('T')[0];
    };

    // Встановлюємо тему з параметрів URL або залишаємо порожньою
    const topicFromURL = topic || '';

    setSelectedTeacherForApplication(teacher);
    
    setApplicationFormData({
      topic: topicFromURL,
      description: '',
      goals: '',
      requirements: '',
      teacherId: teacher.id,
      deadline: getDefaultDeadline(),
      workType: 'coursework',
      student_name: studentData?.name || '',
      student_email: studentData?.email || '',
      student_phone: studentData?.phone || '',
      student_program: studentData?.program || '',
      student_year: studentData?.year || '',
      student_group: studentData?.group || '',
      student_id: studentData?.id || '',
      student_specialty_id: studentData?.specialty_id,
      student_specialty_code: studentData?.specialty_code || '',
      student_faculty_id: studentData?.faculty_id
    });

    setShowApplicationForm(true);
  };

  // Функція для закриття форми заявки
  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
    setSelectedTeacherForApplication(null);
    setApplicationFormData({
      topic: '',
      description: '',
      goals: '',
      requirements: '',
      teacherId: '',
      deadline: '',
      workType: 'coursework',
      student_name: '',
      student_email: '',
      student_phone: '',
      student_program: '',
      student_year: '',
      student_group: '',
      student_id: '',
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

  // Функція для відправки заявки
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🟡 Початок відправки заявки...');
    
    setIsSubmitting(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Помилка автентифікації. Будь ласка, увійдіть знову.');
        return;
      }

      // Підготуємо дані для відправки
      const applicationData = {
        topic: applicationFormData.topic.trim(),
        description: applicationFormData.description.trim(),
        goals: applicationFormData.goals.trim(),
        requirements: applicationFormData.requirements.trim(),
        teacherId: applicationFormData.teacherId,
        deadline: applicationFormData.deadline,
        workType: applicationFormData.workType,
        student_name: applicationFormData.student_name.trim(),
        student_email: applicationFormData.student_email.trim(),
        student_phone: applicationFormData.student_phone?.trim() || '',
        student_program: applicationFormData.student_program?.trim() || '',
        student_year: String(studentInfo?.course || ''),
        student_group: applicationFormData.student_group?.trim() || '',
        student_id: studentInfo?.id || '',
        student_id_number: String(studentInfo?.id || ''),
        student_specialty_id: studentInfo?.specialty_id,
        student_specialty_code: studentInfo?.specialty_code || '',
        student_faculty_id: studentInfo?.faculty_id
      };

      console.log('📤 Відправляємо заявку викладачу:', {
        endpoint: '/api/student/applications',
        data: applicationData
      });

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
      
      const getWorkTypeLabel = (type: 'coursework' | 'diploma' | 'practice') => {
        switch(type) {
          case 'coursework': return 'Курсова робота';
          case 'diploma': return 'Дипломний проєкт';
          case 'practice': return 'Звіт з практики';
          default: return 'Курсова робота';
        }
      };

      const description = `Тип роботи: ${getWorkTypeLabel(applicationFormData.workType)}\nДедлайн: ${applicationFormData.deadline}\n\n✅ Кількість доступних місць у викладача оновлено`;
      
      toast.success(successMessage, {
        duration: 7000,
        description: description
      });

      // Відправляємо подію для оновлення TeacherApplications
      window.dispatchEvent(new CustomEvent('applicationCreated', {
        detail: { 
          teacherId: applicationFormData.teacherId,
          applicationData: responseData
        }
      }));

      // Закриваємо форму та скидаємо дані
      handleCloseApplicationForm();
      
      // Оновлюємо інформацію про студента
      setTimeout(async () => {
        const updatedStudentInfo = await getStudentInfo();
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

  // Функція для отримання дедлайну за типом роботи
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
    
    return date.toISOString().split('T')[0];
  };

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

  // Отримання унікальних кафедр
  const departments = [...new Set(teachers.map(teacher => teacher.department))];

  const handleSelectTeacher = (teacherId: string) => {
    if (topic) {
      // Повертаємося на попередню сторінку з обраним викладачем
      navigate(-1 as To, { 
        state: { 
          selectedTeacherId: teacherId,
          topic: topic 
        } 
      });
    } else {
      // Відкриваємо модальне вікно профілю
      setSelectedTeacherId(teacherId);
      setTeacherModalOpen(true);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setAvailabilityFilter('all');
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Отримуємо назву факультету для відображення
  const getFacultyName = () => {
    if (teachers.length > 0 && teachers[0].faculty) {
      return teachers[0].faculty;
    }
    if (facultyId) {
      return `факультету з ID: ${facultyId}`;
    }
    return 'вашого факультету';
  };

  // Скасування завантаження при розмонтуванні
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  // Рендер форми заявки
  const renderApplicationForm = () => {
    if (!showApplicationForm || !selectedTeacherForApplication) return null;

    const getWorkTypeLabel = (type: 'coursework' | 'diploma' | 'practice') => {
      switch(type) {
        case 'coursework': return 'Курсова робота';
        case 'diploma': return 'Дипломний проєкт';
        case 'practice': return 'Звіт з практики';
        default: return 'Курсова робота';
      }
    };

    const getWorkTypeColor = (type: 'coursework' | 'diploma' | 'practice') => {
      switch(type) {
        case 'coursework': return 'bg-green-100 text-green-800 border-green-200';
        case 'diploma': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'practice': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

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
                Заявка на керівництво
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
              Заповніть форму для подачі заявки на керівництво
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <GraduationCap className="w-4 h-4" />
                <span>Викладач: {selectedTeacherForApplication.name}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              {/* Тип роботи */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Тип роботи *
                </Label>
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
              </div>

              {/* Тема */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Тема роботи *
                </Label>
                <Input
                  value={applicationFormData.topic}
                  onChange={(e) => handleFormDataChange('topic', e.target.value)}
                  placeholder="Введіть тему вашої роботи"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Опис */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Опис проекту *
                </Label>
                <Textarea
                  value={applicationFormData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  placeholder="Детально опишіть ваш проект, технології, які плануєте використовувати, очікувані результати"
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Цілі */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Цілі роботи *
                </Label>
                <Textarea
                  value={applicationFormData.goals}
                  onChange={(e) => handleFormDataChange('goals', e.target.value)}
                  placeholder="Сформулюйте основні цілі та завдання роботи"
                  rows={2}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Вимоги */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Вимоги до керівництва *
                </Label>
                <Textarea
                  value={applicationFormData.requirements}
                  onChange={(e) => handleFormDataChange('requirements', e.target.value)}
                  placeholder="Вкажіть ваші очікування від керівництва (консультації, частота зустрічей тощо)"
                  rows={2}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Дедлайн */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Дедлайн *
                </Label>
                <Input
                  type="date"
                  value={applicationFormData.deadline}
                  onChange={(e) => handleFormDataChange('deadline', e.target.value)}
                  required
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Інформація про студента */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Ваші дані
                  </h4>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      const updatedStudentInfo = await getStudentInfo();
                      if (updatedStudentInfo) {
                        setStudentInfo(updatedStudentInfo);
                        setApplicationFormData(prev => ({
                          ...prev,
                          student_name: updatedStudentInfo.name,
                          student_email: updatedStudentInfo.email,
                          student_phone: updatedStudentInfo.phone || '',
                          student_program: updatedStudentInfo.program || '',
                          student_year: updatedStudentInfo.year || '',
                          student_group: updatedStudentInfo.group || '',
                          student_specialty_id: updatedStudentInfo.specialty_id,
                          student_specialty_code: updatedStudentInfo.specialty_code || '',
                          student_faculty_id: updatedStudentInfo.faculty_id
                        }));
                        toast.success('Дані профілю оновлено');
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
                    <p className="font-medium">{studentInfo?.name || 'Не вказано'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{studentInfo?.email || 'Не вказано'}</p>
                  </div>
                  
                  {studentInfo?.specialty_code && (
                    <div>
                      <span className="text-muted-foreground">Спеціальність:</span>
                      <p className="font-medium">
                        {studentInfo.specialty_code}
                        {studentInfo.specialty_name && ` - ${studentInfo.specialty_name}`}
                      </p>
                    </div>
                  )}
                  
                  {studentInfo?.course && (
                    <div>
                      <span className="text-muted-foreground">Курс:</span>
                      <p className="font-medium">{studentInfo.course}</p>
                    </div>
                  )}
                  
                  {studentInfo?.phone && (
                    <div>
                      <span className="text-muted-foreground">Телефон:</span>
                      <p className="font-medium">{studentInfo.phone}</p>
                    </div>
                  )}
                  
                  {studentInfo?.faculty_name && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Факультет:</span>
                      <p className="font-medium">{studentInfo.faculty_name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">
                    Вибраний викладач: {selectedTeacherForApplication.name}
                  </p>
                </div>
                <p className="text-sm text-blue-600">
                  Заявка буде надіслана викладачу з урахуванням вашої спеціальності та курсу
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseApplicationForm}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isSubmitting || !isFormReady()}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2 animate-spin" />
                      Надсилання...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Надіслати заявку
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
          <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="text-primary w-7 h-7" />
                    Викладачі {getFacultyName()}
                  </h1>
                  <p className="text-muted-foreground">
                    {topic && `Обрати викладача для теми: "${topic}"`}
                    {!topic && 'Знайдіть викладача для вашого проекту'}
                  </p>
                </div>
              </div>
              
              <Badge variant="outline" className="text-sm">
                {filteredTeachers.length} викладачів
              </Badge>
            </div>

            {/* Фільтри */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Фільтри пошуку
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Пошук за ім'ям, кафедрою, навичками..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всі кафедри" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі кафедри</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Статус доступності" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі статуси</SelectItem>
                      <SelectItem value="available">Доступні</SelectItem>
                      <SelectItem value="busy">Зайняті</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || departmentFilter !== 'all' || availabilityFilter !== 'all') && (
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                      Знайдено: {filteredTeachers.length} викладачів
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Очистити фільтри
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Список викладачів */}
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <Spinner className="h-8 w-8 animate-spin text-primary mb-4" />
                <span className="text-muted-foreground">Завантаження викладачів...</span>
                {!currentUserFacultyId && !facultyId && (
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                    Отримання інформації про ваш факультет...
                  </p>
                )}
              </div>
            ) : filteredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTeachers.map((teacher) => (
                  <Card key={teacher.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="w-16 h-16 border-2 border-primary/20">
                            <AvatarImage src={teacher.avatarUrl || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                              {getInitials(teacher.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-xl text-foreground truncate">
                                {teacher.name}
                              </h3>
                              <div className={`w-2 h-2 rounded-full ${
                                teacher.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            <p className="text-primary font-medium mb-1">{teacher.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {teacher.department}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Навички */}
                      {teacher.skills && teacher.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {teacher.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{teacher.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Статистика */}
                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {teacher.rating.toFixed(1)}/5
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

                      {/* Контакти */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">{teacher.email}</span>
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
                          onClick={() => {
                            setSelectedTeacherId(teacher.id);
                            setTeacherModalOpen(true);
                          }}
                        >
                          Переглянути профіль
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleOpenApplicationForm(teacher)}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Подати заявку
                        </Button>
                        {topic && (
                          <Button
                            variant="secondary"
                            onClick={() => handleSelectTeacher(teacher.id)}
                          >
                            Обрати
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    {teachers.length === 0 ? 'Викладачів не знайдено' : 'Викладачів за вашими фільтрами не знайдено'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {teachers.length === 0 
                      ? 'На вашому факультеті поки що немає зареєстрованих викладачів або не вдалося завантажити дані' 
                      : 'Спробуйте змінити параметри пошуку або фільтрації'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={clearFilters}>
                      Очистити фільтри
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                    >
                      Оновити сторінку
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Модальне вікно профілю викладача */}
      <TeacherProfileModal
        teacherId={selectedTeacherId || ''}
        open={teacherModalOpen}
        onOpenChange={setTeacherModalOpen}
      />

      {/* Форма заявки */}
      {renderApplicationForm()}
    </div>
  );
};

export default AllTeachersPage;