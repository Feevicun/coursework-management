// components/TeacherProfileModal.tsx - оновлена версія з додатковими полями
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Target, 
  Lightbulb,
  GraduationCap,
  Clock,
  Briefcase,
  X,
  Calendar,
  PhoneCall,
  UserCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeacherProfile {
  id: string;
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
  skills?: string[];
}

interface Work {
  id: string;
  title: string;
  type: string;
  year: string;
  description: string;
}

interface Direction {
  id: string;
  area: string;
  description: string;
}

interface FutureTopic {
  id: string;
  topic: string;
  description: string;
}

interface TeacherProfileModalProps {
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
}

export function TeacherProfileModal({ 
  teacherId, 
  open, 
  onOpenChange,
  isMobile = false 
}: TeacherProfileModalProps) {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [topics, setTopics] = useState<FutureTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && teacherId) {
      fetchTeacherData();
    }
  }, [open, teacherId]);

  const fetchTeacherData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Завантажуємо основні дані викладача з API
      const teacherResponse = await fetch(`/api/teachers/${teacherId}`, { headers });
      if (teacherResponse.ok) {
        const teacherData = await teacherResponse.json();
        console.log('📱 Дані викладача для модального вікна:', teacherData);
        setTeacher(teacherData);
      }

      // Завантажуємо роботи
      const worksResponse = await fetch(`/api/teachers/${teacherId}/works`, { headers });
      if (worksResponse.ok) setWorks(await worksResponse.json());

      // Завантажуємо напрямки досліджень
      const directionsResponse = await fetch(`/api/teachers/${teacherId}/directions`, { headers });
      if (directionsResponse.ok) setDirections(await directionsResponse.json());

      // Завантажуємо майбутні теми
      const topicsResponse = await fetch(`/api/teachers/${teacherId}/topics`, { headers });
      if (topicsResponse.ok) setTopics(await topicsResponse.json());

    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Огляд', icon: User },
    { id: 'works', label: 'Роботи', icon: BookOpen },
    { id: 'directions', label: 'Напрямки', icon: Target },
    { id: 'topics', label: 'Теми', icon: Lightbulb },
  ];

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
            <h1 className="font-bold text-base">Профіль викладача</h1>
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
            <DialogTitle className="text-lg font-bold">Профіль викладача</DialogTitle>
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

    if (!teacher) {
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
                <AvatarImage src={teacher.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-lg">
                  <User className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{teacher.name}</h3>
                <p className="text-primary text-sm mb-2">{teacher.title || 'Викладач'}</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {teacher.department}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {teacher.faculty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Контактна інформація */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                <PhoneCall className="h-4 w-4" />
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
                    href={`mailto:${teacher.email}`}
                    className="font-medium text-sm hover:text-blue-600 transition-colors truncate block"
                  >
                    {teacher.email}
                  </a>
                </div>
              </div>

              {/* Телефон */}
              {teacher.phone && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                    <a 
                      href={`tel:${teacher.phone.replace(/\s/g, '')}`}
                      className="font-medium text-sm hover:text-green-600 transition-colors"
                    >
                      {teacher.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Години прийому */}
              {teacher.officeHours && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Години прийому</p>
                    <p className="font-medium text-sm">{teacher.officeHours}</p>
                  </div>
                </div>
              )}

              {/* Веб-сайт */}
              {teacher.website && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Веб-сайт</p>
                    <a 
                      href={teacher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm hover:text-purple-600 transition-colors truncate block"
                    >
                      {teacher.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Біографія / Про себе */}
            {teacher.bio && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm text-muted-foreground">Про себе</h4>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {teacher.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Швидка статистика */}
            <div className="pt-3 border-t">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{works.length}</div>
                  <div className="text-xs text-muted-foreground">Робіт</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{directions.length}</div>
                  <div className="text-xs text-muted-foreground">Напрямків</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{topics.length}</div>
                  <div className="text-xs text-muted-foreground">Тем</div>
                </div>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{teacher.skills?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Навичок</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Вкладка Роботи */}
        {activeTab === 'works' && (
          <div className="space-y-3">
            {works.length > 0 ? (
              works.slice(0, 6).map((work) => (
                <div key={work.id} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{work.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {work.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {work.year}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {work.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-2">
                      {work.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Наукових робіт немає</p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка Напрямки */}
        {activeTab === 'directions' && (
          <div className="space-y-3">
            {directions.length > 0 ? (
              directions.slice(0, 6).map((direction) => (
                <div key={direction.id} className="p-4 border rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-2">{direction.area}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {direction.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Напрямків досліджень немає</p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка Теми */}
        {activeTab === 'topics' && (
          <div className="space-y-3">
            {topics.length > 0 ? (
              topics.slice(0, 6).map((topic) => (
                <div key={topic.id} className="p-4 border rounded-lg hover:border-yellow-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-2">{topic.topic}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Майбутніх тем немає</p>
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