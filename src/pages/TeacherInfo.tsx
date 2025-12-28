import { useState, useEffect } from "react";
import { TeacherProfileCard } from "@/components/TeacherProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Award, Target, Trash2, Lightbulb, Edit, Users, GraduationCap, BookOpen, Calendar, Loader2, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TeacherInfo {
  name: string;
  title: string;
  department: string;
  faculty: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  officeHours?: string;
  phone?: string;
  website?: string;
  teacherId?: number;
}

interface Work {
  id: string;
  title: string;
  type: string;
  year: string;
  description: string;
  fileUrl?: string;
  publicationUrl?: string;
  createdAt?: string;
}

interface Direction {
  id: string;
  area: string;
  description: string;
  createdAt?: string;
}

interface FutureTopic {
  id: string;
  topic: string;
  description: string;
  createdAt?: string;
}

interface AvailablePlace {
  id: string;
  teacher_id: number;
  type: "coursework" | "diploma" | "practice";
  availableSpots: number;
  available_spots: number;
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
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Specialty {
  id: number;
  name: string;
  code: string;
  faculty_name?: string;
  faculty_id?: number;
  description?: string;
  courses_available?: number[];
}

interface CourseOption {
  value: number;
  label: string;
}

interface NewPlaceData {
  type: "coursework" | "diploma" | "practice";
  availableSpots: number;
  course: number;
  specialty_id: number;
  max_students?: number;
  current_students?: number;
  requirements?: string;
  description?: string;
}

type PlaceType = "coursework" | "diploma" | "practice";



export default function TeacherInfo() {
  const { t } = useTranslation();
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    name: "",
    title: "",
    department: "",
    faculty: "",
    email: "",
    bio: "",
  });

  const [works, setWorks] = useState<Work[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [futureTopics, setFutureTopics] = useState<FutureTopic[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<AvailablePlace[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setUserId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherStats, setTeacherStats] = useState<{
    totalPlaces: number;
    takenPlaces: number;
    availablePlaces: number;
    specialtiesCount: number;
    averageCourse: number;
    occupancyPercentage: number;
    byType: {
      coursework: { total: number; available: number; occupancy: number };
      diploma: { total: number; available: number; occupancy: number };
      practice?: { total: number; available: number; occupancy: number };
    };
  }>({
    totalPlaces: 0,
    takenPlaces: 0,
    availablePlaces: 0,
    specialtiesCount: 0,
    averageCourse: 0,
    occupancyPercentage: 0,
    byType: {
      coursework: { total: 0, available: 0, occupancy: 0 },
      diploma: { total: 0, available: 0, occupancy: 0 },
      practice: { total: 0, available: 0, occupancy: 0 }
    }
  });

  

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<TeacherInfo>(teacherInfo);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [, setIsRefreshingPlaces] = useState(false);

  // Стани для додавання нових елементів
  const [newWork, setNewWork] = useState<Omit<Work, "id">>({
    title: "",
    type: "",
    year: "",
    description: "",
  });

  const [newDirection, setNewDirection] = useState<Omit<Direction, "id">>({
    area: "",
    description: "",
  });

  const [newTopic, setNewTopic] = useState<Omit<FutureTopic, "id">>({
    topic: "",
    description: "",
  });

  const [newPlace, setNewPlace] = useState<NewPlaceData>({
    type: "coursework",
    availableSpots: 1,
    course: 1,
    specialty_id: 0,
    max_students: 5,
    current_students: 0,
    requirements: "",
    description: ""
  });

  // Стани для редагування існуючих елементів
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null);
  const [editingTopic, setEditingTopic] = useState<FutureTopic | null>(null);
  const [editingPlace, setEditingPlace] = useState<AvailablePlace | null>(null);

  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false);

  const courses = [1, 2, 3, 4, 5, 6];

  // Helper function to sort places
  const sortPlaces = (a: AvailablePlace, b: AvailablePlace): number => {
    const typeOrder: Record<PlaceType, number> = { coursework: 1, diploma: 2, practice: 3 };
    const aType = a.type as PlaceType;
    const bType = b.type as PlaceType;
    
    if (typeOrder[aType] !== typeOrder[bType]) {
      return typeOrder[aType] - typeOrder[bType];
    }
    if (a.course !== b.course) {
      return a.course - b.course;
    }
    return (a.specialty_code || '').localeCompare(b.specialty_code || '');
  };

  // Функція для декодування JWT токена
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Отримання доступних курсів для спеціальності
  const getAvailableCourses = (specialtyId: number): CourseOption[] => {
    if (!specialtyId) return courses.map(course => ({ value: course, label: `${course} курс` }));
    
    const specialty = specialties.find(s => s.id === specialtyId);
    if (!specialty) return courses.map(course => ({ value: course, label: `${course} курс` }));
    
    if (specialty.courses_available && specialty.courses_available.length > 0) {
      return specialty.courses_available.map(course => ({ value: course, label: `${course} курс` }));
    }
    
    return courses.map(course => ({ value: course, label: `${course} курс` }));
  };

  // Оновлення статистики викладача
  const updateTeacherStats = () => {
    console.log('🔄 Оновлення статистики, доступні місця:', availablePlaces);
    
    const totalPlaces = availablePlaces.reduce((sum, place) => sum + (place.max_students || place.availableSpots), 0);
    const takenPlaces = availablePlaces.reduce((sum, place) => sum + (place.current_students || 0), 0);
    const availablePlacesCount = availablePlaces.reduce((sum, place) => sum + place.availableSpots, 0);
    
    const uniqueSpecialties = [...new Set(availablePlaces.map(place => place.specialty_id))];
    const avgCourse = availablePlaces.length > 0 
      ? Math.round(availablePlaces.reduce((sum, place) => sum + place.course, 0) / availablePlaces.length)
      : 0;

    // Розрахунок зайнятості по типах
    const courseworkPlaces = availablePlaces.filter(p => p.type === 'coursework');
    const diplomaPlaces = availablePlaces.filter(p => p.type === 'diploma');
    const practicePlaces = availablePlaces.filter(p => p.type === 'practice');

    const calculateOccupancy = (places: AvailablePlace[]) => {
      if (places.length === 0) return { total: 0, available: 0, occupancy: 0 };
      const total = places.reduce((sum, p) => sum + (p.max_students || p.availableSpots), 0);
      const taken = places.reduce((sum, p) => sum + (p.current_students || 0), 0);
      const available = places.reduce((sum, p) => sum + p.availableSpots, 0);
      const occupancy = total > 0 ? Math.round((taken / total) * 100) : 0;
      return { total, available, occupancy };
    };

    const courseworkStats = calculateOccupancy(courseworkPlaces);
    const diplomaStats = calculateOccupancy(diplomaPlaces);
    const practiceStats = calculateOccupancy(practicePlaces);

    const overallOccupancy = totalPlaces > 0 ? Math.round((takenPlaces / totalPlaces) * 100) : 0;

    console.log('📊 Статистика:', {
      totalPlaces,
      takenPlaces,
      availablePlacesCount,
      uniqueSpecialties,
      avgCourse,
      overallOccupancy,
      courseworkStats,
      diplomaStats,
      practiceStats
    });

    setTeacherStats({
      totalPlaces,
      takenPlaces,
      availablePlaces: availablePlacesCount,
      specialtiesCount: uniqueSpecialties.length,
      averageCourse: avgCourse,
      occupancyPercentage: overallOccupancy,
      byType: {
        coursework: courseworkStats,
        diploma: diplomaStats,
        practice: practiceStats
      }
    });
  };

  // Завантаження спеціальностей
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        console.log('🔄 Завантаження спеціальностей...');
        const response = await fetch('/api/teacher/specialties', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('📊 Статус відповіді спеціальностей:', response.status);

        if (response.ok) {
          const specialtiesData: Specialty[] = await response.json();
          console.log('✅ Дані спеціальностей:', specialtiesData);
          
          const sortedSpecialties = specialtiesData.sort((a: Specialty, b: Specialty) => 
            a.code.localeCompare(b.code)
          );
          
          setSpecialties(sortedSpecialties);
          if (sortedSpecialties.length > 0) {
            setNewPlace(prev => ({ 
              ...prev, 
              specialty_id: sortedSpecialties[0].id,
              max_students: 5,
              current_students: 0
            }));
            setSelectedSpecialty(sortedSpecialties[0].id);
          }
        } else {
          console.error('❌ Помилка завантаження спеціальностей:', response.status);
          const errorText = await response.text();
          console.error('❌ Відповідь з помилкою:', errorText);
        }
      } catch (error) {
        console.error('❌ Помилка завантаження спеціальностей:', error);
      }
    };

    fetchSpecialties();
  }, []);

  // Оновлення статистики при зміні доступних місць
  useEffect(() => {
    console.log('📊 availablePlaces змінилося:', availablePlaces);
    updateTeacherStats();
  }, [availablePlaces]);


  // Додати WebSocket або polling для оновлення даних
useEffect(() => {
  let intervalId: NodeJS.Timeout;
  
  // Якщо є teacherId, періодично оновлюємо дані про місця
  if (teacherId) {
    intervalId = setInterval(() => {
      refreshAvailablePlaces();
    }, 30000); // Оновлювати кожні 30 секунд
  }
  
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [teacherId]);

// Оновити функцію refreshAvailablePlaces для кращої обробки
const refreshAvailablePlaces = async () => {
  try {
    setIsRefreshingPlaces(true);
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found');
      return;
    }

    console.log('🔄 Refreshing available places...');
    
    const response = await fetch('/api/teacher/places', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const placesData = await response.json();
      
      // Додаткова логіка для перевірки змін
      const prevCount = availablePlaces.length;
      const newCount = placesData.length;
      
      if (prevCount !== newCount) {
        console.log(`🔄 Places count changed: ${prevCount} → ${newCount}`);
      }
      
      // Оновлення стану
      const sortedPlaces = placesData.sort(sortPlaces);
      setAvailablePlaces(sortedPlaces);
      
      // Якщо дані оновлені успішно, можна показати підказку
      if (placesData.length > 0) {
        console.log(`✅ Refreshed ${placesData.length} places`);
      }
    }
  } catch (error) {
    console.error('❌ Error refreshing places:', error);
  } finally {
    setIsRefreshingPlaces(false);
  }
};

  // Отримання даних викладача з API
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔑 Токен існує:', !!token);
        
        if (!token) {
          console.error('❌ Токен не знайдено');
          toast.error(t('teacherProfile.alerts.loginRequired'));
          setLoading(false);
          return;
        }

        // Декодуємо токен для отримання userId
        const decodedToken = decodeToken(token);
        console.log('🔍 Розкодований токен:', decodedToken);
        
        if (decodedToken && decodedToken.userId) {
          setUserId(decodedToken.userId);
          console.log('👤 User ID:', decodedToken.userId);
          console.log('👤 User role:', decodedToken.role);
        }

        console.log('🔄 Завантаження даних викладача...');

        // Отримуємо профіль викладача
        const profileResponse = await fetch('/api/teacher/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 Статус відповіді профілю:', profileResponse.status);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Дані профілю:', profileData);
          
          const teacherData: TeacherInfo = {
            name: profileData.name || "",
            title: profileData.title || "",
            department: profileData.department || "",
            faculty: profileData.faculty || "",
            email: profileData.email || "",
            bio: profileData.bio || "",
            avatarUrl: profileData.avatarUrl || "",
            officeHours: profileData.officeHours || "",
            phone: profileData.phone || "",
            website: profileData.website || "",
            teacherId: profileData.teacherId || profileData.id
          };
          
          console.log('👨‍🏫 Оброблені дані викладача:', teacherData);
          console.log('👨‍🏫 Teacher ID:', teacherData.teacherId);
          
          if (teacherData.teacherId) {
            setTeacherId(teacherData.teacherId);
          }
          
          setTeacherInfo(teacherData);
          setEditedInfo(teacherData);
        } else {
          console.error('❌ Помилка завантаження профілю:', profileResponse.status);
          const errorText = await profileResponse.text();
          console.error('❌ Відповідь з помилкою:', errorText);
          toast.error(t('teacherProfile.alerts.loadError'));
        }

        // Отримуємо роботи викладача
        console.log('🔄 Завантаження робіт...');
        const worksResponse = await fetch('/api/teacher/works', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('📊 Статус відповіді робіт:', worksResponse.status);

        if (worksResponse.ok) {
          const worksData: Work[] = await worksResponse.json();
          console.log('✅ Дані робіт:', worksData);
          console.log('🔢 Кількість робіт:', worksData.length);
          
          const sortedWorks = worksData.sort((a: Work, b: Work) => 
            parseInt(b.year || '0') - parseInt(a.year || '0')
          );
          
          setWorks(sortedWorks);
        } else {
          console.error('❌ Помилка завантаження робіт:', worksResponse.status);
          const errorText = await worksResponse.text();
          console.error('❌ Відповідь з помилкою:', errorText);
        }

        // Отримуємо напрямки досліджень
        console.log('🔄 Завантаження напрямків...');
        const directionsResponse = await fetch('/api/teacher/directions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('📊 Статус відповіді напрямків:', directionsResponse.status);

        if (directionsResponse.ok) {
          const directionsData: Direction[] = await directionsResponse.json();
          console.log('✅ Дані напрямків:', directionsData);
          console.log('🔢 Кількість напрямків:', directionsData.length);
          setDirections(directionsData);
        } else {
          console.error('❌ Помилка завантаження напрямків:', directionsResponse.status);
          const errorText = await directionsResponse.text();
          console.error('❌ Відповідь з помилкою:', errorText);
        }

        // Отримуємо майбутні теми
        console.log('🔄 Завантаження тем...');
        const topicsResponse = await fetch('/api/teacher/topics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('📊 Статус відповіді тем:', topicsResponse.status);

        if (topicsResponse.ok) {
          const topicsData: FutureTopic[] = await topicsResponse.json();
          console.log('✅ Дані тем:', topicsData);
          console.log('🔢 Кількість тем:', topicsData.length);
          setFutureTopics(topicsData);
        } else {
          console.error('❌ Помилка завантаження тем:', topicsResponse.status);
          const errorText = await topicsResponse.text();
          console.error('❌ Відповідь з помилкою:', errorText);
        }

        // Отримуємо доступні місця
        await refreshAvailablePlaces();

      } catch (error) {
        console.error('❌ Помилка завантаження даних викладача:', error);
        toast.error(t('teacherProfile.alerts.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [t]);

  // Функції для робіт
  const handleAddWork = async () => {
    if (newWork.title && newWork.type && newWork.year) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('➕ Додавання нової роботи:', newWork);

        const response = await fetch('/api/teacher/works', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newWork),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Робота додана успішно:', result.work);
          
          setWorks(prev => {
            const updatedWorks = [...prev, result.work];
            return updatedWorks.sort((a, b) => 
              parseInt(b.year || '0') - parseInt(a.year || '0')
            );
          });
          
          setNewWork({ title: "", type: "", year: "", description: "" });
          setWorkDialogOpen(false);
          toast.success(t('teacherProfile.alerts.workAdded'));
        } else {
          const errorData = await response.json();
          console.error('❌ Помилка додавання роботи:', errorData);
          toast.error(errorData.message || t('teacherProfile.alerts.workAddError'));
        }
      } catch (error) {
        console.error('❌ Помилка додавання роботи:', error);
        toast.error(t('teacherProfile.alerts.workAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditWork = async () => {
    if (!editingWork) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('✏️ Редагування роботи:', editingWork);

      const response = await fetch(`/api/teacher/works/${editingWork.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingWork.title,
          type: editingWork.type,
          year: editingWork.year,
          description: editingWork.description,
          fileUrl: editingWork.fileUrl,
          publicationUrl: editingWork.publicationUrl
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setWorks(works.map(work => 
          work.id === editingWork.id ? result.work : work
        ));
        setEditingWork(null);
        toast.success(t('teacherProfile.alerts.workUpdated'));
      } else {
        const errorData = await response.json();
        console.error('❌ Помилка оновлення роботи:', errorData);
        toast.error(errorData.message || t('teacherProfile.alerts.workUpdateError'));
      }
    } catch (error) {
      console.error('❌ Помилка оновлення роботи:', error);
      toast.error(t('teacherProfile.alerts.workUpdateError'));
    }
  };

  // Функції для напрямків
  const handleAddDirection = async () => {
    if (newDirection.area && newDirection.description) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('➕ Додавання нового напрямку:', newDirection);

        const response = await fetch('/api/teacher/directions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDirection),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Напрямок доданий успішно:', result.direction);
          setDirections([...directions, result.direction]);
          setNewDirection({ area: "", description: "" });
          setDirectionDialogOpen(false);
          toast.success(t('teacherProfile.alerts.directionAdded'));
        } else {
          const errorData = await response.json();
          console.error('❌ Помилка додавання напрямку:', errorData);
          toast.error(errorData.message || t('teacherProfile.alerts.directionAddError'));
        }
      } catch (error) {
        console.error('❌ Помилка додавання напрямку:', error);
        toast.error(t('teacherProfile.alerts.directionAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditDirection = async () => {
    if (!editingDirection) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('✏️ Редагування напрямку:', editingDirection);

      const response = await fetch(`/api/teacher/directions/${editingDirection.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: editingDirection.area,
          description: editingDirection.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDirections(directions.map(direction => 
          direction.id === editingDirection.id ? result.direction : direction
        ));
        setEditingDirection(null);
        toast.success(t('teacherProfile.alerts.directionUpdated'));
      } else {
        const errorData = await response.json();
        console.error('❌ Помилка оновлення напрямку:', errorData);
        toast.error(errorData.message || t('teacherProfile.alerts.directionUpdateError'));
      }
    } catch (error) {
      console.error('❌ Помилка оновлення напрямку:', error);
      toast.error(t('teacherProfile.alerts.directionUpdateError'));
    }
  };

  // Функції для тем
  const handleAddTopic = async () => {
    if (newTopic.topic && newTopic.description) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('➕ Додавання нової теми:', newTopic);

        const response = await fetch('/api/teacher/topics', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTopic),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Тема додана успішно:', result.topic);
          setFutureTopics([...futureTopics, result.topic]);
          setNewTopic({ topic: "", description: "" });
          setTopicDialogOpen(false);
          toast.success(t('teacherProfile.alerts.topicAdded'));
        } else {
          const errorData = await response.json();
          console.error('❌ Помилка додавання теми:', errorData);
          toast.error(errorData.message || t('teacherProfile.alerts.topicAddError'));
        }
      } catch (error) {
        console.error('❌ Помилка додавання теми:', error);
        toast.error(t('teacherProfile.alerts.topicAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('✏️ Редагування теми:', editingTopic);

      const response = await fetch(`/api/teacher/topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: editingTopic.topic,
          description: editingTopic.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFutureTopics(futureTopics.map(topic => 
          topic.id === editingTopic.id ? result.topic : topic
        ));
        setEditingTopic(null);
        toast.success(t('teacherProfile.alerts.topicUpdated'));
      } else {
        const errorData = await response.json();
        console.error('❌ Помилка оновлення теми:', errorData);
        toast.error(errorData.message || t('teacherProfile.alerts.topicUpdateError'));
      }
    } catch (error) {
      console.error('❌ Помилка оновлення теми:', error);
      toast.error(t('teacherProfile.alerts.topicUpdateError'));
    }
  };

  // Функції для доступних місць
  const handleAddPlace = async () => {
    if (newPlace.type && newPlace.availableSpots > 0 && newPlace.specialty_id && newPlace.specialty_id !== 0) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('➕ Додавання нового місця:', newPlace);

        const response = await fetch('/api/teacher/places', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: newPlace.type,
            availableSpots: newPlace.availableSpots,
            course: newPlace.course,
            specialty_id: newPlace.specialty_id,
            max_students: newPlace.max_students,
            current_students: 0,
            requirements: newPlace.requirements,
            description: newPlace.description
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Місце додано успішно:', result.place);
          
          const formattedPlace: AvailablePlace = {
            ...result.place,
            id: String(result.place.id),
            teacher_id: result.place.teacher_id,
            type: result.place.type,
            availableSpots: result.place.availableSpots || result.place.available_spots || 0,
            available_spots: result.place.availableSpots || result.place.available_spots || 0,
            course: result.place.course,
            specialty_id: result.place.specialty_id,
            specialty_name: result.place.specialty_name,
            specialty_code: result.place.specialty_code,
            faculty_id: result.place.faculty_id,
            faculty_name: result.place.faculty_name,
            max_students: result.place.max_students || result.place.availableSpots * 2,
            current_students: result.place.current_students || 0
          };
          
          setAvailablePlaces(prev => {
            const updatedPlaces = [...prev, formattedPlace];
            return updatedPlaces.sort(sortPlaces);
          });
          
          setNewPlace({ 
            type: "coursework", 
            availableSpots: 1, 
            course: 1, 
            specialty_id: specialties.length > 0 ? specialties[0].id : 0,
            max_students: 5,
            current_students: 0,
            requirements: "",
            description: ""
          });
          
          setPlaceDialogOpen(false);
          toast.success(t('teacherProfile.alerts.placeAdded'));
        } else {
          const errorData = await response.json();
          console.error('❌ Помилка додавання місця:', errorData);
          toast.error(errorData.message || t('teacherProfile.alerts.placeAddError'));
        }
      } catch (error) {
        console.error('❌ Помилка додавання місця:', error);
        toast.error(t('teacherProfile.alerts.placeAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditPlace = async () => {
    if (!editingPlace) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('✏️ Редагування місця:', editingPlace);

      const response = await fetch(`/api/teacher/places/${editingPlace.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        type: editingPlace.type,
        availableSpots: editingPlace.availableSpots - 1, // Зменшуємо на 1
        course: editingPlace.course,
        specialty_id: editingPlace.specialty_id,
        max_students: editingPlace.max_students,
        current_students: (editingPlace.current_students || 0) + 1, // Збільшуємо на 1
        requirements: editingPlace.requirements,
        description: editingPlace.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Місце оновлено успішно:', result.place);
        
        const formattedPlace: AvailablePlace = {
          ...result.place,
          id: String(result.place.id),
          teacher_id: result.place.teacher_id,
          type: result.place.type,
          availableSpots: result.place.availableSpots || result.place.available_spots || 0,
          available_spots: result.place.availableSpots || result.place.available_spots || 0,
          course: result.place.course,
          specialty_id: result.place.specialty_id,
          specialty_name: result.place.specialty_name,
          specialty_code: result.place.specialty_code,
          faculty_id: result.place.faculty_id,
          faculty_name: result.place.faculty_name,
          max_students: result.place.max_students || result.place.availableSpots * 2,
          current_students: result.place.current_students || editingPlace.current_students || 0
        };
        
        setAvailablePlaces(prev => {
          const updatedPlaces = prev.map(place => 
            place.id === editingPlace.id ? formattedPlace : place
          );
          
          return updatedPlaces.sort(sortPlaces);
        });
        
        setEditingPlace(null);
        toast.success(t('teacherProfile.alerts.placeUpdated'));
      } else {
        const errorData = await response.json();
        console.error('❌ Помилка оновлення місця:', errorData);
        toast.error(errorData.message || t('teacherProfile.alerts.placeUpdateError'));
      }
    } catch (error) {
      console.error('❌ Помилка оновлення місця:', error);
      toast.error(t('teacherProfile.alerts.placeUpdateError'));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      let endpoint = '';
      switch (itemToDelete.type) {
        case "work":
          endpoint = `/api/teacher/works/${itemToDelete.id}`;
          break;
        case "direction":
          endpoint = `/api/teacher/directions/${itemToDelete.id}`;
          break;
        case "topic":
          endpoint = `/api/teacher/topics/${itemToDelete.id}`;
          break;
        case "place":
          endpoint = `/api/teacher/places/${itemToDelete.id}`;
          break;
      }

      console.log('🗑️ Видалення елемента:', itemToDelete, 'з endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        switch (itemToDelete.type) {
          case "work":
            setWorks(works.filter((w) => w.id !== itemToDelete.id));
            toast.success(result.message || t('teacherProfile.alerts.workDeleted'));
            break;
          case "direction":
            setDirections(directions.filter((d) => d.id !== itemToDelete.id));
            toast.success(result.message || t('teacherProfile.alerts.directionDeleted'));
            break;
          case "topic":
            setFutureTopics(futureTopics.filter((t) => t.id !== itemToDelete.id));
            toast.success(result.message || t('teacherProfile.alerts.topicDeleted'));
            break;
          case "place":
            setAvailablePlaces(availablePlaces.filter((p) => p.id !== itemToDelete.id));
            toast.success(result.message || t('teacherProfile.alerts.placeDeleted'));
            break;
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Помилка видалення:', errorData);
        toast.error(errorData.message || t('teacherProfile.alerts.deleteError'));
      }
    } catch (error) {
      console.error('❌ Помилка видалення:', error);
      toast.error(t('teacherProfile.alerts.deleteError'));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (type: string, id: string) => {
    console.log('🗑️ Відкриття діалогу видалення для:', type, id);
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const startEditingWork = (work: Work) => {
    console.log('✏️ Початок редагування роботи:', work);
    setEditingWork({...work});
  };

  const startEditingDirection = (direction: Direction) => {
    console.log('✏️ Початок редагування напрямку:', direction);
    setEditingDirection({...direction});
  };

  const startEditingTopic = (topic: FutureTopic) => {
    console.log('✏️ Початок редагування теми:', topic);
    setEditingTopic({...topic});
  };

  const startEditingPlace = (place: AvailablePlace) => {
    console.log('✏️ Початок редагування місця:', place);
    setEditingPlace({...place});
  };

  const handleSaveInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('💾 Збереження інформації викладача...', editedInfo);

      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedInfo.title,
          bio: editedInfo.bio,
          avatarUrl: editedInfo.avatarUrl,
          officeHours: editedInfo.officeHours,
          phone: editedInfo.phone,
          website: editedInfo.website
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTeacherInfo(result.teacher || editedInfo);
        setIsEditingInfo(false);
        toast.success(result.message || t('teacherProfile.alerts.infoUpdated'));
      } else {
        const errorData = await response.json();
        console.error('❌ Помилка оновлення профілю:', errorData);
        toast.error(errorData.message || t('teacherProfile.alerts.updateError'));
      }
    } catch (error) {
      console.error('❌ Помилка оновлення профілю:', error);
      toast.error(t('teacherProfile.alerts.updateError'));
    }
  };

  // Фільтрація місць за спеціальністю
  const filterPlacesBySpecialty = (specialtyId: number | null) => {
    if (!specialtyId) return availablePlaces;
    return availablePlaces.filter(place => place.specialty_id === specialtyId);
  };

  // Отримання перекладу для типу роботи
  const getWorkTypeLabel = (type: string): string => {
    switch (type) {
      case 'coursework':
        return t('teacherProfile.fields.coursework');
      case 'diploma':
        return t('teacherProfile.fields.diploma');
      case 'practice':
        return t('teacherProfile.fields.practice');
      default:
        return type;
    }
  };

  // Отримання кольору для типу роботи
  const getWorkTypeColor = (type: string): string => {
    switch (type) {
      case 'coursework':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'diploma':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'practice':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Отримання іконки для типу роботи
  const getWorkTypeIcon = (type: string) => {
    switch (type) {
      case 'coursework':
        return <BookOpen className="w-5 h-5" />;
      case 'diploma':
        return <GraduationCap className="w-5 h-5" />;
      case 'practice':
        return <Target className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Функція для розрахунку зайнятості
  const getOccupancyPercentage = (place: AvailablePlace): number => {
    const max = place.max_students || place.availableSpots + (place.current_students || 0);
    const current = place.current_students || 0;
    return max > 0 ? Math.round((current / max) * 100) : 0;
  };

  // Отримання кольору зайнятості
  const getOccupancyColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Отримання кольору фону зайнятості
  const getOccupancyBgColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-100';
    if (percentage < 80) return 'bg-yellow-100';
    return 'bg-red-100';
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
              <p className="text-muted-foreground">{t('teacherProfile.loading')}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Компонент кнопки додавання для робіт
  const AddWorkButton = () => (
    <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addWork')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teacherProfile.dialogs.addWork.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-title">{t('teacherProfile.fields.workTitle')} *</Label>
            <Input
              id="work-title"
              value={newWork.title}
              onChange={(e) =>
                setNewWork({ ...newWork, title: e.target.value })
              }
              placeholder={t('teacherProfile.placeholders.workTitle')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-type">{t('teacherProfile.fields.workType')} *</Label>
            <Input
              id="work-type"
              placeholder={t('teacherProfile.placeholders.workType')}
              value={newWork.type}
              onChange={(e) =>
                setNewWork({ ...newWork, type: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-year">{t('teacherProfile.fields.year')} *</Label>
            <Input
              id="work-year"
              placeholder={t('teacherProfile.placeholders.year')}
              value={newWork.year}
              onChange={(e) =>
                setNewWork({ ...newWork, year: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-desc">{t('teacherProfile.fields.description')}</Label>
            <Textarea
              id="work-desc"
              placeholder={t('teacherProfile.placeholders.workDescription')}
              value={newWork.description}
              onChange={(e) =>
                setNewWork({ ...newWork, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-file">{t('teacherProfile.fields.fileLink')}</Label>
            <Input
              id="work-file"
              placeholder={t('teacherProfile.placeholders.fileLink')}
              value={newWork.fileUrl || ""}
              onChange={(e) =>
                setNewWork({ ...newWork, fileUrl: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-pub">{t('teacherProfile.fields.publicationLink')}</Label>
            <Input
              id="work-pub"
              placeholder={t('teacherProfile.placeholders.publicationLink')}
              value={newWork.publicationUrl || ""}
              onChange={(e) =>
                setNewWork({ ...newWork, publicationUrl: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleAddWork} className="flex-1">
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Компонент кнопки додавання для напрямків
  const AddDirectionButton = () => (
    <Dialog open={directionDialogOpen} onOpenChange={setDirectionDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addDirection')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teacherProfile.dialogs.addDirection.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dir-area">{t('teacherProfile.fields.researchArea')} *</Label>
            <Input
              id="dir-area"
              placeholder={t('teacherProfile.placeholders.researchArea')}
              value={newDirection.area}
              onChange={(e) =>
                setNewDirection({ ...newDirection, area: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dir-desc">{t('teacherProfile.fields.description')} *</Label>
            <Textarea
              id="dir-desc"
              placeholder={t('teacherProfile.placeholders.directionDescription')}
              value={newDirection.description}
              onChange={(e) =>
                setNewDirection({
                  ...newDirection,
                  description: e.target.value,
                })
              }
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleAddDirection} className="flex-1">
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Компонент кнопки додавання для тем
  const AddTopicButton = () => (
    <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addTopic')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teacherProfile.dialogs.addTopic.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-name">{t('teacherProfile.fields.topic')} *</Label>
            <Input
              id="topic-name"
              placeholder={t('teacherProfile.placeholders.topicName')}
              value={newTopic.topic}
              onChange={(e) =>
                setNewTopic({ ...newTopic, topic: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic-desc">{t('teacherProfile.fields.description')} *</Label>
            <Textarea
              id="topic-desc"
              placeholder={t('teacherProfile.placeholders.topicDescription')}
              value={newTopic.description}
              onChange={(e) =>
                setNewTopic({
                  ...newTopic,
                  description: e.target.value,
                })
              }
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleAddTopic} className="flex-1">
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Компонент кнопки додавання для місць
  const AddPlaceButton = () => (
    <Dialog open={placeDialogOpen} onOpenChange={setPlaceDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addPlace')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('teacherProfile.dialogs.addPlace.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="place-type" className="text-sm">
                {t('teacherProfile.fields.placeType')} *
              </Label>
              <select
                id="place-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newPlace.type}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, type: e.target.value as PlaceType })
                }
              >
                <option value="coursework">{t('teacherProfile.fields.coursework')}</option>
                <option value="diploma">{t('teacherProfile.fields.diploma')}</option>
                <option value="practice">{t('teacherProfile.fields.practice')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="place-course" className="text-sm">
                {t('teacherProfile.fields.course')} *
              </Label>
              <select
                id="place-course"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newPlace.course}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, course: parseInt(e.target.value) })
                }
              >
                {getAvailableCourses(newPlace.specialty_id).map(course => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="place-specialty" className="text-sm">
              {t('teacherProfile.fields.specialty')} *
            </Label>
            <select
              id="place-specialty"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={newPlace.specialty_id}
              onChange={(e) => {
                const specialtyId = parseInt(e.target.value);
                setNewPlace({ 
                  ...newPlace, 
                  specialty_id: specialtyId,
                  course: getAvailableCourses(specialtyId)[0]?.value || 1
                });
              }}
            >
              <option value={0}>{t('teacherProfile.placeholders.selectSpecialty')}</option>
              {specialties.map(specialty => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.code} - {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="place-spots" className="text-sm">
                {t('teacherProfile.fields.availableSpots')} *
              </Label>
              <Input
                id="place-spots"
                type="number"
                min="1"
                max="20"
                placeholder="5"
                value={newPlace.availableSpots}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, availableSpots: parseInt(e.target.value) || 1 })
                }
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place-max-students" className="text-sm">
                {t('teacherProfile.fields.maxStudents')}
              </Label>
              <Input
                id="place-max-students"
                type="number"
                min="1"
                max="50"
                placeholder="10"
                value={newPlace.max_students || 5}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, max_students: parseInt(e.target.value) || 5 })
                }
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place-current-students" className="text-sm">
                {t('teacherProfile.fields.currentStudents')}
              </Label>
              <Input
                id="place-current-students"
                type="number"
                min="0"
                max={newPlace.max_students || 5}
                placeholder="0"
                value={newPlace.current_students || 0}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, current_students: parseInt(e.target.value) || 0 })
                }
                className="text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="place-requirements" className="text-sm">
              {t('teacherProfile.fields.requirements')}
            </Label>
            <Textarea
              id="place-requirements"
              placeholder={t('teacherProfile.placeholders.requirements')}
              value={newPlace.requirements || ""}
              onChange={(e) =>
                setNewPlace({ ...newPlace, requirements: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="place-description" className="text-sm">
              {t('teacherProfile.fields.description')}
            </Label>
            <Textarea
              id="place-description"
              placeholder={t('teacherProfile.placeholders.placeDescription')}
              value={newPlace.description || ""}
              onChange={(e) =>
                setNewPlace({ ...newPlace, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button 
              onClick={handleAddPlace} 
              className="flex-1"
              disabled={!newPlace.specialty_id || newPlace.specialty_id === 0}
            >
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - показується тільки на великих екранах */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar + Overlay - показується на всіх екранах менше md */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar Panel */}
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
        {/* Header завжди присутній */}
        <Header />
        
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="min-h-screen bg-background">
              <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">

                <div className="mb-10">
                  <h1 className="text-4xl font-bold mb-3 text-foreground">
                    {t('teacherProfile.title')}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t('teacherProfile.subtitle')}
                  </p>
                </div>

                {/* Personal Information */}
                <TeacherProfileCard
                  title={t('teacherProfile.sections.personalInfo')}
                  onEdit={() => setIsEditingInfo(true)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.name')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.title')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.title || t('teacherProfile.fields.notSpecified')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.department')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.faculty')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.faculty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.email')}
                      </p>
                      <p className="text-lg font-semibold text-primary">{teacherInfo.email}</p>
                    </div>
                    {teacherInfo.phone && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('teacherProfile.fields.phone')}
                        </p>
                        <p className="text-lg font-semibold">{teacherInfo.phone}</p>
                      </div>
                    )}
                    {teacherInfo.officeHours && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('teacherProfile.fields.officeHours')}
                        </p>
                        <p className="text-base leading-relaxed">{teacherInfo.officeHours}</p>
                      </div>
                    )}
                    {teacherInfo.website && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('teacherProfile.fields.website')}
                        </p>
                        <a href={teacherInfo.website} className="text-base text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {teacherInfo.website}
                        </a>
                      </div>
                    )}
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.bio')}
                      </p>
                      <p className="text-base leading-relaxed">
                        {teacherInfo.bio || t('profile.fields.bioPlaceholder')}
                      </p>
                    </div>
                  </div>
                </TeacherProfileCard>

                {/* Available Places */}
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.availablePlaces')}
                  actionButton={
                    <div className="flex gap-2">
                      <AddPlaceButton />
                    </div>
                  }
                >
                  <div className="space-y-6">
                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Загальна зайнятість</p>
                          <Badge variant="outline" className={`${getOccupancyBgColor(teacherStats.occupancyPercentage)} ${getOccupancyColor(teacherStats.occupancyPercentage)}`}>
                            {teacherStats.occupancyPercentage}%
                          </Badge>
                        </div>
                        <Progress value={teacherStats.occupancyPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{teacherStats.takenPlaces} зайнято</span>
                          <span>{teacherStats.availablePlaces} вільних</span>
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Курсові роботи</p>
                          <Badge variant="outline" className="text-xs">
                            {teacherStats.byType.coursework.occupancy}%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {teacherStats.byType.coursework.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teacherStats.byType.coursework.available} доступно
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Дипломні проекти</p>
                          <Badge variant="outline" className="text-xs">
                            {teacherStats.byType.diploma.occupancy}%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {teacherStats.byType.diploma.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teacherStats.byType.diploma.available} доступно
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Середній курс</p>
                        <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                          {teacherStats.averageCourse}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teacherStats.specialtiesCount} спеціальностей
                        </p>
                      </div>
                    </div>

                    {/* Фільтри спеціальностей */}
                    {specialties.length > 1 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Фільтр за спеціальністю:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {availablePlaces.length} всього
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSpecialty(null)}
                              className="h-6 px-2 text-xs"
                            >
                              Очистити
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={selectedSpecialty === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSpecialty(null)}
                          >
                            Всі спеціальності
                          </Button>
                          {specialties.map(specialty => {
                            const placesCount = filterPlacesBySpecialty(specialty.id).length;
                            return (
                              <Button
                                key={specialty.id}
                                variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedSpecialty(specialty.id)}
                                disabled={placesCount === 0}
                              >
                                {specialty.code}
                                {selectedSpecialty === specialty.id && (
                                  <Badge className="ml-2 bg-white text-primary">
                                    {placesCount}
                                  </Badge>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {availablePlaces.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.places.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.places.hint')}
                        </p>
                        <AddPlaceButton />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Список місць */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filterPlacesBySpecialty(selectedSpecialty).map((place) => {
                            const occupancyPercentage = getOccupancyPercentage(place);
                            const occupancyColor = getOccupancyColor(occupancyPercentage);
                            const isAvailable = place.availableSpots > 0;
                            
                            return (
                              <div
                                key={place.id}
                                className="group p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${getWorkTypeColor(place.type)}`}>
                                      {getWorkTypeIcon(place.type)}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-base group-hover:text-primary transition-colors">
                                        {getWorkTypeLabel(place.type)}
                                      </h4>
                                      <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs">
                                          {place.availableSpots} з {place.max_students || place.availableSpots + (place.current_students || 0)} місць
                                        </Badge>
                                        <Badge 
                                          variant="secondary" 
                                          className={`text-xs ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                          {isAvailable ? 'Вільно' : 'Зайнято'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => startEditingPlace(place)}
                                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openDeleteDialog("place", place.id)}
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Прогрес зайнятості */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Зайнятість:</span>
                                    <span className={`font-medium ${occupancyColor}`}>
                                      {occupancyPercentage}% ({place.current_students || 0} з {place.max_students || place.availableSpots + (place.current_students || 0)})
                                    </span>
                                  </div>
                                  <Progress value={occupancyPercentage} className="h-2" />
                                </div>
                                
                                {/* Додаткова інформація про курс та спеціальність */}
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">Курс:</span>
                                    </div>
                                    <span className="font-medium">{place.course}</span>
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <GraduationCap className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">Спеціальність:</span>
                                    </div>
                                    <div className="font-medium text-xs bg-muted/50 p-2 rounded">
                                      {place.specialty_code ? (
                                        <>
                                          <div className="font-semibold">{place.specialty_code}</div>
                                          <div className="text-muted-foreground truncate">{place.specialty_name || `ID: ${place.specialty_id}`}</div>
                                        </>
                                      ) : (
                                        <div className="font-semibold">ID: {place.specialty_id}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {place.requirements && (
                                    <div>
                                      <div className="flex items-center gap-1 mb-1">
                                        <Shield className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">Вимоги:</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {place.requirements}
                                      </p>
                                    </div>
                                  )}

                                  {place.description && (
                                    <div>
                                      <div className="flex items-center gap-1 mb-1">
                                        <Info className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">Опис:</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                                        {place.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Статистика зайнятості */}
                                  <div className="pt-2 border-t border-border mt-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Загальна зайнятість:</span>
                                      <span className={`font-medium ${getOccupancyColor(getOccupancyPercentage(place))}`}>
                                        {getOccupancyPercentage(place)}% 
                                        ({place.current_students || 0} з {place.max_students || place.availableSpots + (place.current_students || 0)})
                                      </span>
                                    </div>
                                    {place.faculty_name && (
                                      <div className="flex justify-between text-xs mt-1">
                                        <span className="text-muted-foreground">Факультет:</span>
                                        <span className="font-medium truncate max-w-[120px]">
                                          {place.faculty_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Загальна статистика */}
                        {selectedSpecialty && (
                          <div className="mt-6 pt-4 border-t border-border">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Статистика для вибраної спеціальності</h4>
                              <Badge variant="outline">
                                {filterPlacesBySpecialty(selectedSpecialty).length} пропозицій
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold text-green-600">
                                  {filterPlacesBySpecialty(selectedSpecialty)
                                    .filter(p => p.type === 'coursework').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Курсові</div>
                              </div>
                              <div className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">
                                  {filterPlacesBySpecialty(selectedSpecialty)
                                    .filter(p => p.type === 'diploma').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Дипломні</div>
                              </div>
                              <div className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">
                                  {filterPlacesBySpecialty(selectedSpecialty)
                                    .filter(p => p.type === 'practice').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Практика</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Works and Publications */}
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.works')}
                  actionButton={<AddWorkButton />}
                >
                  <div className="space-y-4">
                    {works.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.works.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.works.hint')}
                        </p>
                        <AddWorkButton />
                      </div>
                    ) : (
                      works.map((work) => (
                        <div
                          key={work.id}
                          className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{work.title}</h4>
                              <p className="text-sm font-medium text-primary/70 mb-2">
                                {work.type} • {work.year}
                              </p>
                              {work.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{work.description}</p>
                              )}
                              {(work.fileUrl || work.publicationUrl) && (
                                <div className="flex gap-3 mt-2">
                                  {work.fileUrl && (
                                    <a 
                                      href={work.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {t('teacherProfile.links.file')}
                                    </a>
                                  )}
                                  {work.publicationUrl && (
                                    <a 
                                      href={work.publicationUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {t('teacherProfile.links.publication')}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingWork(work)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("work", work.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Research Directions */}
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.researchDirections')}
                  actionButton={<AddDirectionButton />}
                >
                  <div className="space-y-4">
                    {directions.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.directions.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.directions.hint')}
                        </p>
                        <AddDirectionButton />
                      </div>
                    ) : (
                      directions.map((direction) => (
                        <div
                          key={direction.id}
                          className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Target className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{direction.area}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {direction.description}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingDirection(direction)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("direction", direction.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Future Topics */}
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.futureTopics')}
                  actionButton={<AddTopicButton />}
                >
                  <div className="space-y-4">
                    {futureTopics.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.topics.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.topics.hint')}
                        </p>
                        <AddTopicButton />
                      </div>
                    ) : (
                      futureTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Lightbulb className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{topic.topic}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {topic.description}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingTopic(topic)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("topic", topic.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Edit Info Dialog */}
                <Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('teacherProfile.dialogs.editInfo.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">{t('teacherProfile.fields.name')}</Label>
                          <Input
                            id="edit-name"
                            value={editedInfo.name}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('teacherProfile.dialogs.editInfo.nameHelp')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">{t('teacherProfile.fields.title')}</Label>
                          <Input
                            id="edit-title"
                            placeholder={t('teacherProfile.placeholders.title')}
                            value={editedInfo.title}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, title: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dept">{t('teacherProfile.fields.department')}</Label>
                          <Input
                            id="edit-dept"
                            value={editedInfo.department}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-faculty">{t('teacherProfile.fields.faculty')}</Label>
                          <Input
                            id="edit-faculty"
                            value={editedInfo.faculty}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">{t('teacherProfile.fields.email')}</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editedInfo.email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">{t('teacherProfile.fields.phone')}</Label>
                          <Input
                            id="edit-phone"
                            placeholder={t('teacherProfile.placeholders.phone')}
                            value={editedInfo.phone || ""}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-office-hours">{t('teacherProfile.fields.officeHours')}</Label>
                        <Input
                          id="edit-office-hours"
                          placeholder={t('teacherProfile.placeholders.officeHours')}
                          value={editedInfo.officeHours || ""}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, officeHours: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-website">{t('teacherProfile.fields.website')}</Label>
                        <Input
                          id="edit-website"
                          placeholder={t('teacherProfile.placeholders.website')}
                          value={editedInfo.website || ""}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, website: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-bio">{t('teacherProfile.fields.bio')}</Label>
                        <Textarea
                          id="edit-bio"
                          placeholder={t('teacherProfile.placeholders.bio')}
                          value={editedInfo.bio}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, bio: e.target.value })
                          }
                          rows={6}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleSaveInfo} className="flex-1">
                          {t('teacherProfile.actions.saveChanges')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Work Dialog */}
                <Dialog open={!!editingWork} onOpenChange={() => setEditingWork(null)}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('teacherProfile.dialogs.editWork.title')}</DialogTitle>
                    </DialogHeader>
                    {editingWork && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-title">{t('teacherProfile.fields.workTitle')} *</Label>
                          <Input
                            id="edit-work-title"
                            value={editingWork.title}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, title: e.target.value })
                            }
                            placeholder={t('teacherProfile.placeholders.workTitle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-type">{t('teacherProfile.fields.workType')} *</Label>
                          <Input
                            id="edit-work-type"
                            placeholder={t('teacherProfile.placeholders.workType')}
                            value={editingWork.type}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, type: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-year">{t('teacherProfile.fields.year')} *</Label>
                            <Input
                            id="edit-work-year"
                            placeholder={t('teacherProfile.placeholders.year')}
                            value={editingWork.year}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, year: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-desc">{t('teacherProfile.fields.description')}</Label>
                          <Textarea
                            id="edit-work-desc"
                            placeholder={t('teacherProfile.placeholders.workDescription')}
                            value={editingWork.description}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, description: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-file">{t('teacherProfile.fields.fileLink')}</Label>
                          <Input
                            id="edit-work-file"
                            placeholder={t('teacherProfile.placeholders.fileLink')}
                            value={editingWork.fileUrl || ""}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, fileUrl: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-pub">{t('teacherProfile.fields.publicationLink')}</Label>
                          <Input
                            id="edit-work-pub"
                            placeholder={t('teacherProfile.placeholders.publicationLink')}
                            value={editingWork.publicationUrl || ""}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, publicationUrl: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingWork(null)}
                          >
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditWork} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Direction Dialog */}
                <Dialog open={!!editingDirection} onOpenChange={() => setEditingDirection(null)}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('teacherProfile.dialogs.editDirection.title')}</DialogTitle>
                    </DialogHeader>
                    {editingDirection && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-dir-area">{t('teacherProfile.fields.researchArea')} *</Label>
                          <Input
                            id="edit-dir-area"
                            placeholder={t('teacherProfile.placeholders.researchArea')}
                            value={editingDirection.area}
                            onChange={(e) =>
                              setEditingDirection({ ...editingDirection, area: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dir-desc">{t('teacherProfile.fields.description')} *</Label>
                          <Textarea
                            id="edit-dir-desc"
                            placeholder={t('teacherProfile.placeholders.directionDescription')}
                            value={editingDirection.description}
                            onChange={(e) =>
                              setEditingDirection({
                                ...editingDirection,
                                description: e.target.value,
                              })
                            }
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingDirection(null)}
                          >
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditDirection} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Topic Dialog */}
                <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('teacherProfile.dialogs.editTopic.title')}</DialogTitle>
                    </DialogHeader>
                    {editingTopic && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-topic-name">{t('teacherProfile.fields.topic')} *</Label>
                          <Input
                            id="edit-topic-name"
                            placeholder={t('teacherProfile.placeholders.topicName')}
                            value={editingTopic.topic}
                            onChange={(e) =>
                              setEditingTopic({ ...editingTopic, topic: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-topic-desc">{t('teacherProfile.fields.description')} *</Label>
                          <Textarea
                            id="edit-topic-desc"
                            placeholder={t('teacherProfile.placeholders.topicDescription')}
                            value={editingTopic.description}
                            onChange={(e) =>
                              setEditingTopic({
                                ...editingTopic,
                                description: e.target.value,
                              })
                            }
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingTopic(null)}
                          >
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditTopic} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Place Dialog */}
                <Dialog open={!!editingPlace} onOpenChange={() => setEditingPlace(null)}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {t('teacherProfile.dialogs.editPlace.title')}
                      </DialogTitle>
                    </DialogHeader>
                    {editingPlace && (
                      <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-place-type" className="text-sm">
                              {t('teacherProfile.fields.placeType')} *
                            </Label>
                            <select
                              id="edit-place-type"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={editingPlace.type}
                              onChange={(e) =>
                                setEditingPlace({ ...editingPlace, type: e.target.value as PlaceType })
                              }
                            >
                              <option value="coursework">{t('teacherProfile.fields.coursework')}</option>
                              <option value="diploma">{t('teacherProfile.fields.diploma')}</option>
                              <option value="practice">{t('teacherProfile.fields.practice')}</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-place-course" className="text-sm">
                              {t('teacherProfile.fields.course')} *
                            </Label>
                            <select
                              id="edit-place-course"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={editingPlace.course}
                              onChange={(e) =>
                                setEditingPlace({ ...editingPlace, course: parseInt(e.target.value) })
                              }
                            >
                              {getAvailableCourses(editingPlace.specialty_id).map(course => (
                                <option key={course.value} value={course.value}>
                                  {course.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-place-specialty" className="text-sm">
                            {t('teacherProfile.fields.specialty')} *
                          </Label>
                          <select
                            id="edit-place-specialty"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={editingPlace.specialty_id}
                            onChange={(e) => {
                              const specialtyId = parseInt(e.target.value);
                              setEditingPlace({ 
                                ...editingPlace, 
                                specialty_id: specialtyId,
                                course: getAvailableCourses(specialtyId)[0]?.value || editingPlace.course
                              });
                            }}
                          >
                            {specialties.map(specialty => (
                              <option key={specialty.id} value={specialty.id}>
                                {specialty.code} - {specialty.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-place-spots" className="text-sm">
                              {t('teacherProfile.fields.availableSpots')} *
                            </Label>
                            <Input
                              id="edit-place-spots"
                              type="number"
                              min="0"
                              max="50"
                              value={editingPlace.availableSpots}
                              onChange={(e) =>
                                setEditingPlace({ ...editingPlace, availableSpots: parseInt(e.target.value) || 0 })
                              }
                              className="text-center"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-place-max-students" className="text-sm">
                              {t('teacherProfile.fields.maxStudents')}
                            </Label>
                            <Input
                              id="edit-place-max-students"
                              type="number"
                              min="1"
                              max="50"
                              value={editingPlace.max_students || 5}
                              onChange={(e) =>
                                setEditingPlace({ ...editingPlace, max_students: parseInt(e.target.value) || 5 })
                              }
                              className="text-center"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-place-current-students" className="text-sm">
                              {t('teacherProfile.fields.currentStudents')}
                            </Label>
                            <Input
                              id="edit-place-current-students"
                              type="number"
                              min="0"
                              max={editingPlace.max_students || 5}
                              value={editingPlace.current_students || 0}
                              onChange={(e) =>
                                setEditingPlace({ ...editingPlace, current_students: parseInt(e.target.value) || 0 })
                              }
                              className="text-center"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-place-requirements" className="text-sm">
                            {t('teacherProfile.fields.requirements')}
                          </Label>
                          <Textarea
                            id="edit-place-requirements"
                            placeholder={t('teacherProfile.placeholders.requirements')}
                            value={editingPlace.requirements || ""}
                            onChange={(e) =>
                              setEditingPlace({ ...editingPlace, requirements: e.target.value })
                            }
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-place-description" className="text-sm">
                            {t('teacherProfile.fields.description')}
                          </Label>
                          <Textarea
                            id="edit-place-description"
                            placeholder={t('teacherProfile.placeholders.placeDescription')}
                            value={editingPlace.description || ""}
                            onChange={(e) =>
                              setEditingPlace({ ...editingPlace, description: e.target.value })
                            }
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingPlace(null)}
                          >
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditPlace} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('teacherProfile.dialogs.delete.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('teacherProfile.dialogs.delete.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-6 rounded-md">
                        {t('teacherProfile.actions.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="h-10 px-6 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('teacherProfile.actions.delete')}
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