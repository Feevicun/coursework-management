import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Download, CheckCircle, Clock, FileText, AlertCircle, Users, Star, Edit, X, Send, ChevronDown, Loader2, GraduationCap, User, ArrowRight, Eye, History, Bell, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

interface TeacherInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  avatar?: string;
}

interface DeadlineInfo {
  chapterId: number;
  chapterKey: string;
  deadline: string;
  assignedBy: string;
  assignedAt: string;
  isCompleted: boolean;
  chapterTitle?: string;
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
  workType: 'coursework' | 'diploma';
  workTitle: string;
  startDate: string;
  progress: number;
  status: 'active' | 'completed' | 'behind' | 'review';
  lastActivity: string;
  grade: number;
  unreadComments: number;
  projectType: 'diploma' | 'coursework' | 'practice';
  teacherId?: string;
  supervisor?: TeacherInfo;
  deadlines?: DeadlineInfo[];
  hasPendingReview?: boolean;
  lastSubmissionDate?: string;
  overallDeadline?: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
  type: 'feedback' | 'response';
  status: 'info' | 'warning' | 'error' | 'success';
}

interface FileVersion {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  userId: string;
  version: number;
  downloadUrl?: string;
  changes?: string;
}

interface Chapter {
  id: number;
  key: string;
  title: string;
  description: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentGrade: number | null;
  studentNote: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
    currentVersion: number;
  };
  teacherComments: Comment[];
  fileHistory?: FileVersion[];
  gradedBy?: string;
  gradedAt?: string;
  submittedForReviewAt?: string;
  chapterDeadline?: string;
  deadlineStatus?: 'normal' | 'warning' | 'urgent' | 'overdue' | 'completed';
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (chapterId: number, commentText: string, status: Comment['status']) => void;
  chapterId: number;
}

interface QuickCommentButtonProps {
  chapterId: number;
  onQuickComment: (chapterId: number, commentText: string, status: Comment['status']) => void;
}

interface StudentSelectProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelect: (student: Student) => void;
  loading: boolean;
}

interface FileHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileHistory: FileVersion[];
  currentUser: { id: string; name: string };
}

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  onGradeSubmit: (chapterId: number, grade: number, feedback?: string) => void;
}

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  chapters: Chapter[];
  onSetOverallDeadline: (studentId: string, deadline: string) => void;
  onSetChapterDeadline: (chapterId: number, deadline: string, studentId: string) => void;
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

// Функція для отримання поточного користувача
// const getCurrentUser = (): { id: string; name: string; role: string } | null => {
//   if (typeof window !== 'undefined') {
//     const currentUser = localStorage.getItem('currentUser') || 
//                        sessionStorage.getItem('currentUser');
    
//     if (currentUser) {
//       try {
//         const userData = JSON.parse(currentUser);
//         return {
//           id: userData.id?.toString() || '',
//           name: userData.name || 'Викладач',
//           role: userData.role || 'teacher'
//         };
//       } catch {
//         // Ігноруємо помилку парсингу
//       }
//     }
    
//     return {
//       id: getCurrentUserId() || 'teacher-1',
//       name: 'Викладач',
//       role: 'teacher'
//     };
//   }
//   return null;
// };

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
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const text = await response.text();
    
    // Якщо відповідь порожня, повертаємо null
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'review':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'inProgress':
      return <FileText className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    case 'review':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'inProgress':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'review':
      return 'На перевірці';
    case 'inProgress':
      return 'В роботі';
    default:
      return 'Очікує';
  }
};

const getCommentBadgeStyle = (status: Comment['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
  }
};

const getDeadlineStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'urgent':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

// Модальне вікно керування дедлайнами
const DeadlineModal = ({ 
  isOpen, 
  onClose, 
  student, 
  chapters,
  onSetOverallDeadline,
  onSetChapterDeadline
}: DeadlineModalProps) => {
  const [overallDeadline, setOverallDeadline] = useState(student?.overallDeadline || '');
  const [chapterDeadlines, setChapterDeadlines] = useState<Record<number, string>>({});

  useEffect(() => {
    if (student) {
      setOverallDeadline(student.overallDeadline || '');
      
      // Ініціалізація дедлайнів розділів
      const initialDeadlines: Record<number, string> = {};
      student.deadlines?.forEach(deadline => {
        initialDeadlines[deadline.chapterId] = deadline.deadline;
      });
      setChapterDeadlines(initialDeadlines);
    }
  }, [student]);

  const handleSaveDeadlines = async () => {
    if (!student) return;

    if (overallDeadline && overallDeadline !== student.overallDeadline) {
      await onSetOverallDeadline(student.id, overallDeadline);
    }

    // Зберігаємо дедлайни розділів
    for (const [chapterId, deadline] of Object.entries(chapterDeadlines)) {
      if (deadline) {
        await onSetChapterDeadline(Number(chapterId), deadline, student.id);
      }
    }

    onClose();
  };

  const handleDeleteChapterDeadline = async (chapterId: number) => {
    if (!student) return;

    // Видаляємо дедлайн через API
    await onSetChapterDeadline(chapterId, '', student.id);
    
    // Оновлюємо локальний стан
    setChapterDeadlines(prev => {
      const newDeadlines = { ...prev };
      delete newDeadlines[chapterId];
      return newDeadlines;
    });
  };

  const handleDeleteOverallDeadline = async () => {
    if (!student) return;

    // Видаляємо загальний дедлайн через API
    await onSetOverallDeadline(student.id, '');
    setOverallDeadline('');
  };

  if (!isOpen || !student) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Керування дедлайнами - {student.name}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Загальний дедлайн */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg">Загальний дедлайн роботи</h4>
              {overallDeadline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteOverallDeadline}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Видалити
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Новий дедлайн
                </label>
                <input
                  type="date"
                  value={overallDeadline}
                  onChange={(e) => setOverallDeadline(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {overallDeadline && (
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">Поточний дедлайн:</p>
                  <p className="text-lg font-semibold">{formatDate(overallDeadline)}</p>
                  <p className={`text-sm ${
                    getDaysRemaining(overallDeadline) < 0 ? 'text-red-600' : 
                    getDaysRemaining(overallDeadline) <= 7 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {getDaysRemaining(overallDeadline) >= 0 
                      ? `Залишилось днів: ${getDaysRemaining(overallDeadline)}`
                      : `Прострочено на: ${Math.abs(getDaysRemaining(overallDeadline))} днів`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Дедлайни розділів */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Дедлайни розділів</h4>
            <div className="space-y-3">
              {chapters.map(chapter => {
                const currentDeadline = chapterDeadlines[chapter.id];
                const daysRemaining = currentDeadline ? getDaysRemaining(currentDeadline) : null;
                
                return (
                  <div key={chapter.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{chapter.title}</p>
                        <p className="text-sm text-gray-600">{chapter.description}</p>
                      </div>
                      {currentDeadline && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteChapterDeadline(chapter.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Дедлайн розділу
                        </label>
                        <input
                          type="date"
                          value={currentDeadline || ''}
                          onChange={(e) => setChapterDeadlines(prev => ({
                            ...prev,
                            [chapter.id]: e.target.value
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      {currentDeadline && (
                        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm font-medium">Поточний дедлайн:</p>
                          <p className="font-semibold">{formatDate(currentDeadline)}</p>
                          <p className={`text-sm ${
                            daysRemaining && daysRemaining < 0 ? 'text-red-600' : 
                            daysRemaining && daysRemaining <= 3 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {daysRemaining && daysRemaining >= 0 
                              ? `Залишилось днів: ${daysRemaining}`
                              : daysRemaining && `Прострочено на: ${Math.abs(daysRemaining)} днів`
                            }
                          </p>
                          <Badge className={`mt-1 ${getDeadlineStatusColor(
                            chapter.status === 'completed' ? 'completed' :
                            daysRemaining && daysRemaining < 0 ? 'overdue' :
                            daysRemaining && daysRemaining <= 3 ? 'urgent' :
                            daysRemaining && daysRemaining <= 7 ? 'warning' : 'normal'
                          )}`}>
                            {chapter.status === 'completed' ? 'Виконано' :
                             daysRemaining && daysRemaining < 0 ? 'Прострочено' :
                             daysRemaining && daysRemaining <= 3 ? 'Терміново' :
                             daysRemaining && daysRemaining <= 7 ? 'Закінчується' : 'Активний'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button 
            onClick={handleSaveDeadlines}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Зберегти дедлайни
          </Button>
        </div>
      </div>
    </div>
  );
};

// Модальне вікно історії файлів
const FileHistoryModal = ({ 
  isOpen, 
  onClose, 
  fileHistory, 
  currentUser 
}: FileHistoryModalProps) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Історія версій файлу
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-4 space-y-3">
            {fileHistory.map((version, index) => (
              <div
                key={version.id}
                className={`p-3 border rounded-lg ${
                  index === 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      index === 0 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      Версія {version.version}
                      {index === 0 && ' (поточна)'}
                    </span>
                    {version.uploadedBy === currentUser.name && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                        Ваша версія
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {formatDate(version.uploadDate)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm">{version.fileName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{version.fileSize}</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.uploadedBy}
                      </span>
                    </div>
                    {version.changes && (
                      <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                        <strong>Зміни:</strong> {version.changes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {version.downloadUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(version.downloadUrl, '_blank')}
                        className="h-8"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>• Всього версій: {fileHistory.length}</p>
            <p>• Остання зміна: {fileHistory[0] ? formatDate(fileHistory[0].uploadDate) : 'немає'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Модальне вікно оцінювання
const GradeModal = ({ 
  isOpen, 
  onClose, 
  chapter, 
  onGradeSubmit 
}: GradeModalProps) => {
  const [grade, setGrade] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (chapter?.studentGrade) {
      setGrade(chapter.studentGrade.toString());
    } else {
      setGrade('');
    }
    setFeedback('');
  }, [chapter]);

  if (!isOpen || !chapter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericGrade = parseInt(grade);
    if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100) {
      onGradeSubmit(chapter.id, numericGrade, feedback || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Оцінювання розділу
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Розділ: <span className="font-semibold">{chapter.title}</span>
            </label>
          </div>
          
          <div>
            <label htmlFor="grade" className="block text-sm font-medium mb-2">
              Оцінка (0-100)
            </label>
            <input
              id="grade"
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Введіть оцінку"
              required
            />
          </div>
          
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium mb-2">
              Коментар (необов'язково)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Додайте коментар або відгук..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Зберегти оцінку
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Початковий екран
const WelcomeScreen = ({ 
  students, 
  onSelectStudent, 
  loading 
}: { 
  students: Student[];
  onSelectStudent: (student: Student) => void;
  loading: boolean;
}) => {
  const pendingReviewsCount = students.filter(s => s.hasPendingReview).length;
  const overdueDeadlinesCount = students.filter(student => 
    student.deadlines?.some(deadline => {
      const daysRemaining = Math.ceil((new Date(deadline.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining < 0 && !deadline.isCompleted;
    })
  ).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Панель оцінювання</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Оберіть студента для перегляду та оцінювання його роботи. Тут ви можете залишати коментарі, виставляти оцінки та відстежувати прогрес.
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {pendingReviewsCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
              <Bell className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                {pendingReviewsCount} робіт очікують на перевірку
              </span>
            </div>
          )}
          {overdueDeadlinesCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <span className="text-red-800 font-medium">
                {overdueDeadlinesCount} прострочених дедлайнів
              </span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження студентів...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Немає студентів</h2>
          <p className="text-muted-foreground mb-6">
            У вас ще немає студентів для оцінювання. Почніть з прийняття заявок.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="/teacher/applications">
              <Users className="w-4 h-4 mr-2" />
              Перейти до заявок
            </a>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {students.map((student) => {
              const overdueDeadlines = student.deadlines?.filter(deadline => {
                const daysRemaining = Math.ceil((new Date(deadline.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysRemaining < 0 && !deadline.isCompleted;
              }).length || 0;

              return (
                <Card 
                  key={student.id} 
                  className={`bg-card border hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    student.hasPendingReview 
                      ? 'border-yellow-400 bg-yellow-50/50 hover:border-yellow-500' 
                      : overdueDeadlines > 0
                      ? 'border-red-400 bg-red-50/50 hover:border-red-500'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onSelectStudent(student)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">{student.name}</CardTitle>
                          {student.hasPendingReview && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              На перевірці
                            </Badge>
                          )}
                          {overdueDeadlines > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {overdueDeadlines} прострочено
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm truncate">
                          {student.course} курс • {student.specialty}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Прогрес:</span>
                      <span className="font-semibold text-foreground">{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Оцінка:</span>
                      <span className="font-bold text-primary">{student.grade}/100</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Тип роботи:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.workType === 'coursework' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {student.workType === 'coursework' ? 'Курсова' : 'Дипломна'}
                      </span>
                    </div>
                    {student.overallDeadline && (
                      <div className="text-xs text-muted-foreground">
                        Дедлайн: {new Date(student.overallDeadline).toLocaleDateString('uk-UA')}
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 border-border text-foreground hover:bg-accent"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Переглянути роботу
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Improved Comment Section
const CommentSection = ({ comments, onAddComment, chapterId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentStatus, setCommentStatus] = useState<Comment['status']>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(chapterId, newComment, commentStatus);
      setNewComment('');
      setCommentStatus('info');
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm text-foreground">Коментарі ({comments.length})</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Згорнути' : 'Розгорнути'}
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg text-sm border ${
                  comment.type === 'feedback' 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                    : 'bg-muted border-border'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{comment.author}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCommentBadgeStyle(comment.status)}`}>
                      {comment.status === 'success' && '✓ Схвалено'}
                      {comment.status === 'warning' && '⚠ Попередження'}
                      {comment.status === 'error' && '✗ Потребує виправлень'}
                      {comment.status === 'info' && 'ℹ Інформація'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-foreground mt-2">{comment.text}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Ще немає коментарів</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 mb-2">
              <label className="text-sm text-foreground">Тип коментаря:</label>
              <select 
                value={commentStatus}
                onChange={(e) => setCommentStatus(e.target.value as Comment['status'])}
                className="text-sm border border-input rounded px-2 py-1 bg-background text-foreground"
              >
                <option value="info">Інформація</option>
                <option value="success">Схвалення</option>
                <option value="warning">Попередження</option>
                <option value="error">Потребує виправлень</option>
              </select>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишіть ваш коментар або відгук..."
              className="w-full p-3 border border-input rounded-lg text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary bg-background text-foreground"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewComment('');
                  setCommentStatus('info');
                }}
                className="text-muted-foreground"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-1" />
                Надіслати
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

// Improved Quick Comment Button
const QuickCommentButton = ({ chapterId, onQuickComment }: QuickCommentButtonProps) => {
  const [isQuickCommentOpen, setIsQuickCommentOpen] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [commentStatus, setCommentStatus] = useState<Comment['status']>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickComment.trim()) {
      onQuickComment(chapterId, quickComment, commentStatus);
      setQuickComment('');
      setCommentStatus('info');
      setIsQuickCommentOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsQuickCommentOpen(!isQuickCommentOpen)}
        className="border-border text-foreground hover:bg-accent"
      >
        <Edit className="w-4 h-4 mr-1" />
        Коментувати
      </Button>

      {isQuickCommentOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-foreground">Швидкий коментар</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsQuickCommentOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 mb-2">
              <label className="text-sm text-foreground">Тип:</label>
              <select 
                value={commentStatus}
                onChange={(e) => setCommentStatus(e.target.value as Comment['status'])}
                className="text-sm border border-input rounded px-2 py-1 bg-background text-foreground flex-1"
              >
                <option value="info">Інформація</option>
                <option value="success">Схвалення</option>
                <option value="warning">Попередження</option>
                <option value="error">Потребує виправлень</option>
              </select>
            </div>
            <textarea
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              placeholder="Напишіть коментар..."
              className="w-full p-2 border border-input rounded text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary bg-background text-foreground"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickCommentOpen(false)}
                className="text-muted-foreground"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!quickComment.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Надіслати
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Custom Select Component for better styling
const StudentSelect = ({ students, selectedStudent, onSelect, loading }: StudentSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="outline" className="w-64 justify-between border-border text-foreground" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        Завантаження...
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-64 justify-between border-border text-foreground hover:bg-accent"
      >
        <span className="truncate">{selectedStudent?.name || 'Оберіть студента'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {students.map(student => {
            const overdueDeadlines = student.deadlines?.filter(deadline => {
              const daysRemaining = Math.ceil((new Date(deadline.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysRemaining < 0 && !deadline.isCompleted;
            }).length || 0;

            return (
              <button
                key={student.id}
                onClick={() => {
                  onSelect(student);
                  setIsOpen(false);
                  window.history.pushState({}, '', `/teacher/grades?studentId=${student.id}`);
                }}
                className="w-full px-4 py-2 text-left hover:bg-accent first:rounded-t-lg last:rounded-b-lg border-b border-border last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-foreground">{student.name}</div>
                  <div className="flex items-center gap-1">
                    {student.hasPendingReview && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                    {overdueDeadlines > 0 && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {student.workType === 'coursework' ? 'Курсова' : 'Дипломна'} • {student.progress}%
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Інтерфейси для API відповідей
interface ApiStudent {
  id?: string;
  student_name?: string;
  name?: string;
  student_email?: string;
  email?: string;
  student_phone?: string;
  phone?: string;
  student_avatar?: string;
  avatar?: string;
  course?: number;
  faculty?: string;
  specialty?: string;
  work_type?: 'coursework' | 'diploma';
  workType?: 'coursework' | 'diploma';
  work_title?: string;
  workTitle?: string;
  start_date?: string;
  startDate?: string;
  progress?: number;
  status?: 'active' | 'completed' | 'behind';
  last_activity?: string;
  lastActivity?: string;
  grade?: number;
  student_grade?: number;
  unread_comments?: number;
  unreadComments?: number;
  project_type?: 'diploma' | 'coursework' | 'practice';
  projectType?: 'diploma' | 'coursework' | 'practice';
  has_pending_review?: boolean;
  last_submission_date?: string;
  overall_deadline?: string;
  deadlines?: any[];
}

interface ApiChapter {
  id: number;
  key?: string;
  chapter_key?: string;
  title?: string;
  chapter_title?: string;
  description?: string;
  chapter_description?: string;
  progress?: number;
  status?: 'completed' | 'review' | 'inProgress' | 'pending';
  student_grade?: number;
  grade?: number;
  student_note?: string;
  note?: string;
  uploaded_file?: {
    name: string;
    upload_date: string;
    size: string;
    current_version: number;
  };
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    date: string;
    type: 'feedback' | 'response';
    status: 'info' | 'warning' | 'error' | 'success';
  }>;
  file_history?: Array<{
    id: string;
    file_name: string;
    file_size: string;
    upload_date: string;
    uploaded_by: string;
    user_id: string;
    version: number;
    download_url?: string;
    changes?: string;
  }>;
  graded_by?: string;
  graded_at?: string;
  submitted_for_review_at?: string;
  chapter_deadline?: string;
}

const TeacherGrades = () => {
  const [searchParams] = useSearchParams();
  const studentIdFromUrl = searchParams.get('studentId');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [chaptersData, setChaptersData] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [fileHistoryModal, setFileHistoryModal] = useState<{
    isOpen: boolean;
    fileHistory: FileVersion[];
  }>({
    isOpen: false,
    fileHistory: []
  });
  const [gradeModal, setGradeModal] = useState<{
    isOpen: boolean;
    chapter: Chapter | null;
  }>({
    isOpen: false,
    chapter: null
  });
  const [deadlineModal, setDeadlineModal] = useState<{
    isOpen: boolean;
    student: Student | null;
  }>({
    isOpen: false,
    student: null
  });

  // Функція для створення базової структури розділів
  const getDefaultChapters = (): Chapter[] => {
    return [
      { 
        id: 1, 
        key: 'intro', 
        title: 'Вступ', 
        description: 'Вступна частина роботи',
        progress: 0,
        status: 'pending',
        studentGrade: null,
        studentNote: '',
        teacherComments: [],
        fileHistory: []
      },
      { 
        id: 2, 
        key: 'analysis', 
        title: 'Аналіз літератури', 
        description: 'Огляд наукових джерел та літератури',
        progress: 0,
        status: 'pending',
        studentGrade: null,
        studentNote: '',
        teacherComments: [],
        fileHistory: []
      },
      { 
        id: 3, 
        key: 'methodology', 
        title: 'Методологія', 
        description: 'Методи дослідження',
        progress: 0,
        status: 'pending',
        studentGrade: null,
        studentNote: '',
        teacherComments: [],
        fileHistory: []
      },
      { 
        id: 4, 
        key: 'results', 
        title: 'Результати', 
        description: 'Результати дослідження',
        progress: 0,
        status: 'pending',
        studentGrade: null,
        studentNote: '',
        teacherComments: [],
        fileHistory: []
      },
      { 
        id: 5, 
        key: 'conclusion', 
        title: 'Висновки', 
        description: 'Висновки та рекомендації',
        progress: 0,
        status: 'pending',
        studentGrade: null,
        studentNote: '',
        teacherComments: [],
        fileHistory: []
      }
    ];
  };

  // Функція для завантаження студентів з API
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const teacherId = getCurrentUserId();
      
      let apiStudents: Student[] = [];

      // Завантаження з API
      if (teacherId) {
        try {
          const data = await safeFetch(`/api/teacher/students?teacher_id=${teacherId}`);
          
          if (data && Array.isArray(data)) {
            apiStudents = data.map((student: ApiStudent) => ({
              id: student.id?.toString() || '',
              name: student.student_name || student.name || '',
              email: student.student_email || student.email || '',
              phone: student.student_phone || student.phone || '',
              avatar: student.student_avatar || student.avatar || '',
              course: student.course || 0,
              faculty: student.faculty || "",
              specialty: student.specialty || "",
              workType: student.work_type || student.workType || 'coursework',
              workTitle: student.work_title || student.workTitle || '',
              startDate: student.start_date || student.startDate || '',
              progress: student.progress || 0,
              status: student.status || 'active',
              lastActivity: student.last_activity || student.lastActivity || '',
              grade: student.grade || student.student_grade || 0,
              unreadComments: student.unread_comments || student.unreadComments || 0,
              projectType: student.project_type || student.projectType || 'coursework',
              teacherId: teacherId,
              hasPendingReview: student.has_pending_review || false,
              lastSubmissionDate: student.last_submission_date || '',
              overallDeadline: student.overall_deadline || '',
              deadlines: student.deadlines || []
            })).filter(student => student.id && student.name);
          }
        } catch (error) {
          console.error('Error processing students data:', error);
        }
      }

      // Fallback: перевірка localStorage
      if (apiStudents.length === 0) {
        try {
          const localStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
          if (Array.isArray(localStudents) && localStudents.length > 0) {
            // Фільтруємо студентів поточного викладача
            apiStudents = localStudents.filter((student: Student) => 
              student.teacherId === teacherId
            );
            console.log('Loaded students from localStorage:', apiStudents);
          }
        } catch (localError) {
          console.error('Error reading from localStorage:', localError);
        }
      }

      console.log('Final loaded students:', apiStudents);
      setStudents(apiStudents);

      // Якщо є studentId в URL, знаходимо відповідного студента
      if (studentIdFromUrl && apiStudents.length > 0) {
        const studentFromUrl = apiStudents.find((s: Student) => s.id === studentIdFromUrl);
        if (studentFromUrl) {
          setSelectedStudent(studentFromUrl);
          console.log('Selected student from URL:', studentFromUrl);
        }
      }
    } catch (error) {
      console.error('Помилка завантаження студентів:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Функція для завантаження робіт на перевірку
  const fetchPendingReviews = async () => {
    try {
      const teacherId = getCurrentUserId();
      const pendingReviews = await safeFetch(`/api/teacher/pending-reviews?teacher_id=${teacherId}`);
      
      if (pendingReviews && Array.isArray(pendingReviews)) {
        // Оновлюємо список студентів з роботами на перевірці
        setStudents(prevStudents => 
          prevStudents.map(student => {
            const hasPendingReview = pendingReviews.some((review: any) => review.studentId === student.id);
            return {
              ...student,
              hasPendingReview: hasPendingReview,
              status: hasPendingReview ? 'review' : student.status
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  // Функція для перевірки нових робіт
  const checkForNewSubmissions = async () => {
    try {
      const teacherId = getCurrentUserId();
      const newSubmissions = await safeFetch(`/api/teacher/new-submissions?teacher_id=${teacherId}`);
      
      if (newSubmissions && newSubmissions.length > 0) {
        // Оновлюємо список студентів
        await fetchStudents();
        
        // Показуємо сповіщення
        if (newSubmissions.length > 0 && !window.location.href.includes('studentId')) {
          console.log(`У вас ${newSubmissions.length} нових робіт на перевірці!`);
        }
      }
    } catch (error) {
      console.error('Error checking new submissions:', error);
    }
  };

  // Функція для завантаження даних студента з ThesisTracker
  const fetchStudentData = async (student: Student) => {
    try {
      setLoading(true);
      
      let studentChapters: Chapter[] = [];

      // Завантаження з API ThesisTracker
      try {
        const data = await safeFetch(`/api/thesis-tracker/student/${student.id}/chapters`);
        
        if (data && data.chapters && Array.isArray(data.chapters)) {
          studentChapters = data.chapters.map((chapter: ApiChapter) => ({
            id: chapter.id,
            key: chapter.key || chapter.chapter_key || '',
            title: chapter.title || chapter.chapter_title || '',
            description: chapter.description || chapter.chapter_description || '',
            progress: chapter.progress || 0,
            status: chapter.status || 'pending',
            studentGrade: chapter.student_grade || chapter.grade || null,
            studentNote: chapter.student_note || chapter.note || '',
            uploadedFile: chapter.uploaded_file ? {
              name: chapter.uploaded_file.name,
              uploadDate: chapter.uploaded_file.upload_date,
              size: chapter.uploaded_file.size,
              currentVersion: chapter.uploaded_file.current_version
            } : undefined,
            teacherComments: Array.isArray(chapter.comments) ? chapter.comments.map((comment) => ({
              id: comment.id,
              text: comment.text,
              author: comment.author,
              date: comment.date,
              type: comment.type,
              status: comment.status
            })) : [],
            fileHistory: Array.isArray(chapter.file_history) ? chapter.file_history.map((file) => ({
              id: file.id,
              fileName: file.file_name,
              fileSize: file.file_size,
              uploadDate: file.upload_date,
              uploadedBy: file.uploaded_by,
              userId: file.user_id,
              version: file.version,
              downloadUrl: file.download_url,
              changes: file.changes
            })) : [],
            gradedBy: chapter.graded_by,
            gradedAt: chapter.graded_at,
            submittedForReviewAt: chapter.submitted_for_review_at,
            chapterDeadline: chapter.chapter_deadline
          }));
        }
      } catch (error) {
        console.error('Error processing student chapters data:', error);
      }

      // Якщо API не повернув даних, використовуємо порожню структуру
      if (studentChapters.length === 0) {
        studentChapters = getDefaultChapters();
      }

      setChaptersData(studentChapters);
      
    } catch (error) {
      console.error('Помилка завантаження даних студента:', error);
      setChaptersData(getDefaultChapters());
    } finally {
      setLoading(false);
    }
  };

  // Завантаження списку студентів
  useEffect(() => {
    fetchStudents();
    fetchPendingReviews();

    // Слухач для оновлення студентів
    const handleStudentUpdate = () => {
      console.log('Student update event received in TeacherGrades');
      fetchStudents();
      fetchPendingReviews();
    };

    const handleStudentsUpdated = () => {
      console.log('Students updated event received in TeacherGrades');
      fetchStudents();
      fetchPendingReviews();
    };

    // Слухач для оновлення даних студента з ThesisTracker
    const handleThesisTrackerUpdate = () => {
      console.log('ThesisTracker update event received in TeacherGrades');
      if (selectedStudent) {
        fetchStudentData(selectedStudent);
        fetchPendingReviews();
      }
    };

    window.addEventListener('studentUpdated', handleStudentUpdate);
    window.addEventListener('studentsUpdated', handleStudentsUpdated);
    window.addEventListener('thesisTrackerUpdated', handleThesisTrackerUpdate);
    
    return () => {
      window.removeEventListener('studentUpdated', handleStudentUpdate);
      window.removeEventListener('studentsUpdated', handleStudentsUpdated);
      window.removeEventListener('thesisTrackerUpdated', handleThesisTrackerUpdate);
    };
  }, [studentIdFromUrl, selectedStudent]);

  // Завантаження даних обраного студента
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent);
    }
  }, [selectedStudent]);

  // Інтервал для перевірки оновлень
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingReviews();
      checkForNewSubmissions();
      if (selectedStudent) {
        fetchStudentData(selectedStudent);
      }
    }, 30000); // Перевіряємо кожні 30 секунд
    
    return () => clearInterval(interval);
  }, [selectedStudent]);

  const handleAddComment = async (chapterId: number, commentText: string, status: Comment['status']) => {
    if (!selectedStudent) return;

    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        text: commentText,
        author: 'Викладач',
        date: new Date().toLocaleDateString('uk-UA'),
        type: 'feedback',
        status
      };

      // Спроба зберегти коментар через API
      await safeFetch(`/api/thesis-tracker/chapter/${chapterId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          text: commentText,
          status: status,
          type: 'feedback'
        })
      });

      // Оновлюємо локальний стан
      setChaptersData(prevChapters =>
        prevChapters.map(chapter =>
          chapter.id === chapterId
            ? {
                ...chapter,
                teacherComments: [...chapter.teacherComments, newComment],
                status: status === 'error' ? 'review' : chapter.status
              }
            : chapter
        )
      );

      // Оновлюємо лічильник коментарів
      setStudents(prev =>
        prev.map(student =>
          student.id === selectedStudent.id
            ? { ...student, unreadComments: student.unreadComments + 1 }
            : student
        )
      );

      // Сповіщаємо про оновлення коментарів
      window.dispatchEvent(new CustomEvent('thesisTrackerUpdated'));

    } catch (error) {
      console.error('Помилка додавання коментаря:', error);
    }
  };

  const handleQuickComment = (chapterId: number, commentText: string, status: Comment['status']) => {
    handleAddComment(chapterId, commentText, status);
  };

  const handleGradeUpdate = async (chapterId: number, grade: number, feedback?: string) => {
    if (!selectedStudent) return;

    try {
      // Оновлюємо через API
      await safeFetch(`/api/thesis-tracker/chapter/${chapterId}/grade`, {
        method: 'PUT',
        body: JSON.stringify({
          grade: grade,
          feedback: feedback,
          status: 'completed',
          gradedBy: getCurrentUserId(),
          gradedAt: new Date().toISOString()
        })
      });

      // Оновлюємо локальний стан
      setChaptersData(prevChapters =>
        prevChapters.map(chapter =>
          chapter.id === chapterId
            ? { 
                ...chapter, 
                studentGrade: grade, 
                status: 'completed',
                gradedBy: getCurrentUserId() || 'Викладач',
                gradedAt: new Date().toISOString(),
                teacherComments: feedback ? [
                  ...chapter.teacherComments,
                  {
                    id: Date.now().toString(),
                    text: feedback,
                    author: 'Викладач',
                    date: new Date().toLocaleDateString('uk-UA'),
                    type: 'feedback',
                    status: grade >= 60 ? 'success' : 'error'
                  }
                ] : chapter.teacherComments
              }
            : chapter
        )
      );

      // Перераховуємо середню оцінку
      const updatedChapters = chaptersData.map(chapter =>
        chapter.id === chapterId
          ? { ...chapter, studentGrade: grade, status: 'completed' }
          : chapter
      );

      const gradedChapters = updatedChapters.filter(ch => ch.studentGrade !== null);
      const newAverageGrade = gradedChapters.length > 0 
        ? Math.round(gradedChapters.reduce((sum, ch) => sum + (ch.studentGrade || 0), 0) / gradedChapters.length)
        : selectedStudent.grade;

      // Оновлюємо студента
      setStudents(prev =>
        prev.map(student =>
          student.id === selectedStudent.id
            ? { 
                ...student, 
                grade: newAverageGrade,
                status: newAverageGrade >= 60 ? 'completed' : 'review',
                hasPendingReview: false
              }
            : student
        )
      );

      // Сповіщаємо студента про оцінку
      await safeFetch('/api/notify-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.id,
          chapterId: chapterId,
          grade: grade,
          feedback: feedback,
          teacherName: 'Викладач'
        })
      });

      // Сповіщаємо всі компоненти про оновлення
      window.dispatchEvent(new CustomEvent('thesisTrackerUpdated'));
      window.dispatchEvent(new CustomEvent('teacherGradesUpdated'));

      console.log(`Оцінка ${grade} успішно виставлена для розділу ${chapterId}`);

    } catch (error) {
      console.error('Помилка оновлення оцінки:', error);
    }
  };

  // Функція для встановлення дедлайну розділу
  const handleSetChapterDeadline = async (chapterId: number, deadline: string, studentId: string) => {
    try {
      const chapter = chaptersData.find(ch => ch.id === chapterId);
      if (!chapter) return;

      // Оновлення через API
      await safeFetch(`/api/thesis-tracker/chapter/${chapterId}/deadline`, {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          deadline,
          assignedBy: getCurrentUserId(),
          chapterKey: chapter.key
        })
      });

      // Оновлення локального стану
      setStudents(prev =>
        prev.map(student =>
          student.id === studentId
            ? {
                ...student,
                deadlines: [
                  ...(student.deadlines || []).filter(d => d.chapterId !== chapterId),
                  ...(deadline ? [{
                    chapterId,
                    chapterKey: chapter.key,
                    deadline,
                    assignedBy: 'Викладач',
                    assignedAt: new Date().toISOString(),
                    isCompleted: false
                  }] : [])
                ]
              }
            : student
        )
      );

      // Оновлення глав
      setChaptersData(prev =>
        prev.map(ch =>
          ch.id === chapterId
            ? { ...ch, chapterDeadline: deadline }
            : ch
        )
      );

      // Сповіщення студента
      if (deadline) {
        await safeFetch('/api/notify-student', {
          method: 'POST',
          body: JSON.stringify({
            studentId: studentId,
            type: 'deadline_assigned',
            chapterId: chapterId,
            chapterTitle: chapter.title,
            deadline: deadline,
            teacherName: 'Викладач'
          })
        });
      }

      // Сповіщаємо про оновлення дедлайнів
      window.dispatchEvent(new CustomEvent('deadlineUpdated'));

      console.log(`Дедлайн ${deadline ? 'встановлено' : 'видалено'} для розділу ${chapterId}`);
    } catch (error) {
      console.error('Помилка встановлення дедлайну:', error);
    }
  };

  // Функція для встановлення загального дедлайну
  const handleSetOverallDeadline = async (studentId: string, deadline: string) => {
    try {
      await safeFetch(`/api/thesis-tracker/student/${studentId}/deadline`, {
        method: 'POST',
        body: JSON.stringify({
          deadline,
          assignedBy: getCurrentUserId()
        })
      });

      setStudents(prev =>
        prev.map(student =>
          student.id === studentId
            ? { ...student, overallDeadline: deadline }
            : student
        )
      );

      // Сповіщення студента
      if (deadline) {
        await safeFetch('/api/notify-student', {
          method: 'POST',
          body: JSON.stringify({
            studentId: studentId,
            type: 'overall_deadline_assigned',
            deadline: deadline,
            teacherName: 'Викладач'
          })
        });
      }

      // Сповіщаємо про оновлення дедлайнів
      window.dispatchEvent(new CustomEvent('deadlineUpdated'));

      console.log(`Загальний дедлайн ${deadline ? 'встановлено' : 'видалено'} для студента ${studentId}`);
    } catch (error) {
      console.error('Помилка встановлення загального дедлайну:', error);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    window.history.pushState({}, '', `/teacher/grades?studentId=${student.id}`);
  };

  const toggleCommentExpansion = (chapterId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const showFileHistory = (chapterId: number) => {
    const chapter = chaptersData.find(ch => ch.id === chapterId);
    if (!chapter || !chapter.fileHistory) return;

    setFileHistoryModal({
      isOpen: true,
      fileHistory: chapter.fileHistory
    });
  };

  const showGradeModal = (chapter: Chapter) => {
    setGradeModal({
      isOpen: true,
      chapter: chapter
    });
  };

  const showDeadlineModal = (student: Student) => {
    setDeadlineModal({
      isOpen: true,
      student: student
    });
  };

  const handleDownloadFile = (chapterId: number) => {
    const chapter = chaptersData.find(ch => ch.id === chapterId);
    if (!chapter?.uploadedFile) return;

    // Тут буде логіка завантаження файлу
    alert(`Завантаження файлу: ${chapter.uploadedFile.name}`);
  };

  const getDeadlineBadge = (chapter: Chapter) => {
    if (!chapter.chapterDeadline) return null;

    const today = new Date();
    const deadline = new Date(chapter.chapterDeadline);
    const isOverdue = deadline < today;
    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (chapter.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Виконано</Badge>;
    } else if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Прострочено</Badge>;
    } else if (daysRemaining <= 3) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Терміново ({daysRemaining} дн.)</Badge>;
    } else if (daysRemaining <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Закінчується ({daysRemaining} дн.)</Badge>;
    } else {
      return <Badge variant="outline">До {new Date(chapter.chapterDeadline).toLocaleDateString('uk-UA')}</Badge>;
    }
  };

  const totalProgress = chaptersData.length > 0 
    ? Math.round(chaptersData.reduce((sum, ch) => sum + ch.progress, 0) / chaptersData.length)
    : 0;

  // Якщо не обрано студента, показуємо початковий екран
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen">
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto">
            <WelcomeScreen 
              students={students} 
              onSelectStudent={handleSelectStudent}
              loading={studentsLoading}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
            {/* Header with Student Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Панель оцінювання</h1>
                <p className="text-muted-foreground mt-1">Керування прогресом та оцінками студентів</p>
              </div>
              <StudentSelect
                students={students}
                selectedStudent={selectedStudent}
                onSelect={handleSelectStudent}
                loading={studentsLoading}
              />
            </div>

            {/* Student Overview Card */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">
                  Робота студента: {selectedStudent.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Тема: "{selectedStudent.workTitle}" • {selectedStudent.faculty}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Спеціальність:</span> {selectedStudent.specialty}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Курс:</span> {selectedStudent.course}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Тип роботи:</span> {selectedStudent.workType === 'coursework' ? 'Курсова' : 'Дипломна'}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Поточна оцінка:</span> 
                      <span className="font-bold text-primary ml-2">{selectedStudent.grade}/100</span>
                    </p>
                    {selectedStudent.overallDeadline && (
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Загальний дедлайн:</span> 
                        <span className="ml-2">{new Date(selectedStudent.overallDeadline).toLocaleDateString('uk-UA')}</span>
                      </p>
                    )}
                    {selectedStudent.hasPendingReview && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <Bell className="w-4 h-4" />
                        <span>Має роботи на перевірці</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-right space-y-2">
                    <div className="text-3xl font-bold text-primary">{totalProgress}%</div>
                    <p className="text-sm text-muted-foreground">Загальний прогрес</p>
                    <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{selectedStudent.unreadComments} непрочитаних коментарів</span>
                    </div>
                  </div>
                </div>
                <Progress value={totalProgress} className="h-2 bg-muted" />
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Написати загальний коментар
                    {selectedStudent.unreadComments > 0 && (
                      <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs">
                        {selectedStudent.unreadComments}
                      </span>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-border text-foreground hover:bg-accent"
                    onClick={() => showDeadlineModal(selectedStudent)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Керування дедлайнами
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                    <Download className="w-4 h-4 mr-2" />
                    Експорт оцінок
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chapters Progress */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Прогрес по розділах</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Переглядайте роботи студентів, залишайте коментарі та виставляйте оцінки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Завантаження даних студента...</p>
                  </div>
                ) : (
                  chaptersData.map((chapter) => (
                    <div key={chapter.id} className="border-b border-border pb-6 last:border-none last:pb-0">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(chapter.status)}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-medium text-foreground">
                                {chapter.title}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(chapter.status)}`}>
                                {getStatusText(chapter.status)}
                              </span>
                              {getDeadlineBadge(chapter)}
                              {(chapter.teacherComments?.length || 0) > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                                  {chapter.teacherComments?.length} коментарів
                                </span>
                              )}
                              {(chapter.fileHistory?.length || 0) > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border border-gray-200">
                                  {chapter.fileHistory?.length} версій
                                </span>
                              )}
                              {chapter.submittedForReviewAt && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                                  Надіслано: {new Date(chapter.submittedForReviewAt).toLocaleDateString('uk-UA')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {chapter.description}
                            </p>
                            {chapter.studentNote && (
                              <p className="text-sm text-blue-600 mt-1">
                                <strong>Нотатка студента:</strong> {chapter.studentNote}
                              </p>
                            )}
                            {chapter.gradedAt && (
                              <p className="text-sm text-green-600 mt-1">
                                <strong>Оцінено:</strong> {new Date(chapter.gradedAt).toLocaleDateString('uk-UA')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Прогрес: </span>
                            <span className="font-medium text-foreground">{chapter.progress}%</span>
                          </div>
                          {chapter.studentGrade && (
                            <div>
                              <span className="text-muted-foreground">Оцінка: </span>
                              <span className="font-bold text-primary">{chapter.studentGrade}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Progress value={chapter.progress} className="h-2 mt-2 bg-muted" />
                      
                      {/* Завантажений файл */}
                      {chapter.uploadedFile && (
                        <div className="bg-muted p-3 rounded-lg mt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{chapter.uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {chapter.uploadedFile.size} • Версія {chapter.uploadedFile.currentVersion}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadFile(chapter.id)}
                                className="border-border text-foreground hover:bg-accent"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Завантажити
                              </Button>
                              {(chapter.fileHistory?.length || 0) > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => showFileHistory(chapter.id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <History className="w-4 h-4 mr-1" />
                                  Історія
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {chapter.uploadedFile && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent"
                              onClick={() => handleDownloadFile(chapter.id)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Переглянути роботу
                            </Button>
                          )}
                          <QuickCommentButton
                            chapterId={chapter.id}
                            onQuickComment={handleQuickComment}
                          />
                          {(chapter.teacherComments?.length || 0) > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleCommentExpansion(chapter.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Коментарі ({chapter.teacherComments?.length})
                              {expandedComments[chapter.id] ? ' ↑' : ' ↓'}
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {chapter.status === 'review' && (
                            <Button 
                              size="sm" 
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => showGradeModal(chapter)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Оцінити розділ
                            </Button>
                          )}
                          {chapter.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-white"
                              onClick={() => showGradeModal(chapter)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Змінити оцінку
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Коментарі викладача */}
                      {expandedComments[chapter.id] && (chapter.teacherComments?.length || 0) > 0 && (
                        <div className="mt-4 border-t border-border pt-4">
                          <h4 className="font-medium text-sm mb-3">Коментарі викладача</h4>
                          <div className="space-y-3">
                            {(chapter.teacherComments || []).map((comment) => (
                              <div key={comment.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                                <div className="flex items-start justify-between mb-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getCommentBadgeStyle(comment.status)}`}>
                                    {comment.status === 'success' && '✓ Схвалено'}
                                    {comment.status === 'warning' && '⚠ Попередження'}
                                    {comment.status === 'error' && '✗ Потребує виправлень'}
                                    {comment.status === 'info' && 'ℹ Інформація'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {comment.date}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground">
                                  {comment.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comment Section */}
                      <CommentSection
                        comments={chapter.teacherComments}
                        onAddComment={handleAddComment}
                        chapterId={chapter.id}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Модальне вікно історії файлів */}
      <FileHistoryModal
        isOpen={fileHistoryModal.isOpen}
        onClose={() => setFileHistoryModal({ isOpen: false, fileHistory: [] })}
        fileHistory={fileHistoryModal.fileHistory}
        currentUser={{ id: getCurrentUserId() || '', name: 'Викладач' }}
      />

      {/* Модальне вікно оцінювання */}
      <GradeModal
        isOpen={gradeModal.isOpen}
        onClose={() => setGradeModal({ isOpen: false, chapter: null })}
        chapter={gradeModal.chapter}
        onGradeSubmit={handleGradeUpdate}
      />

      {/* Модальне вікно керування дедлайнами */}
      <DeadlineModal
        isOpen={deadlineModal.isOpen}
        onClose={() => setDeadlineModal({ isOpen: false, student: null })}
        student={deadlineModal.student}
        chapters={chaptersData}
        onSetOverallDeadline={handleSetOverallDeadline}
        onSetChapterDeadline={handleSetChapterDeadline}
      />
    </div>
  );
};

export default TeacherGrades;