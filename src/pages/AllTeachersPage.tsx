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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const topic = searchParams.get('topic');
  const facultyId = searchParams.get('faculty');

  // Отримання факультету поточного користувача
  useEffect(() => {
    const getCurrentUserFaculty = async () => {
      try {
        const token = localStorage.getItem('token') || 
                      localStorage.getItem('authToken') || 
                      sessionStorage.getItem('token') || 
                      sessionStorage.getItem('authToken');
        
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
        const token = localStorage.getItem('token') || 
                      localStorage.getItem('authToken');
        
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

  const handleContactTeacher = (teacher: Teacher) => {
    const subject = topic ? `Запит щодо керівництва: ${topic}` : 'Запит щодо керівництва';
    const body = `Шановний(а) ${teacher.name},\n\nЯ зацікавлений(а) у вашому керівництві для наукової роботи.\n\nЗ повагою,\n[Ваше ім'я]`;
    
    window.open(`mailto:${teacher.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
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
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
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
                          onClick={() => handleContactTeacher(teacher)}
                        >
                          Написати
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
    </div>
  );
};

export default AllTeachersPage;