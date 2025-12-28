// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Index';
import Chat from './pages/Chat';
import ThesisTracker from './pages/ThesisTracker';
import AIAssistant from './pages/AIAssistant';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/Register';
import MainPage from './pages/MainPage';
import LoginPage from './pages/Login';
import ForgotPasswordPage from './pages/ForgotPass';
import CalendarPage from './pages/Calendar';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherGrades from './pages/TeacherGraders';
import TeacherInfo from './pages/TeacherInfo'; 
import TeacherApplications from './pages/StudentApplications'; 
import NotesPage from './pages/NotesPage';
import AllTeachersPage from './pages/AllTeachersPage'

import { ThemeProvider } from './context/ThemeContext';
import { VoiceAssistant } from './components/VoiceAssistant/VoiceAssistant';

function App() {
  return (
    <ThemeProvider>
        <Router>
          
          {/* Головний компонент голосового помічника */}
          <VoiceAssistant />
          
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Студентські маршрути */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracker" element={<ThesisTracker />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notespage" element={<NotesPage />} /> 
            <Route path="/choose-teacher" element={<AllTeachersPage />} />
            <Route path="/teachers" element={<AllTeachersPage />} /> {/* Додано новий маршрут */}
            
            {/* Викладацькі маршрути */}
            <Route path="/teacherdashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/grades" element={<TeacherGrades />} />
            <Route path="/teacher/info" element={<TeacherInfo />} /> 
            <Route path="/teacher/students" element={<TeacherApplications />} /> 
            
            {/* Спільні маршрути */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </Router>
    </ThemeProvider>
  );
}

export default App;