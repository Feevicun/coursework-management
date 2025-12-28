import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassButton } from "@/components/GlassButton";
import { GraduationCap, Eye, EyeOff } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [faculties, setFaculties] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [specialties, setSpecialties] = useState<{ id: number; code: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string; course: number; education_level: string }[]>([]);

  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  // Load faculties on component mount
  useEffect(() => {
    async function fetchFaculties() {
      try {
        const res = await fetch("/api/faculties");
        if (!res.ok) throw new Error("Failed to load faculties");
        const data = await res.json();
        setFaculties(data);
      } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити факультети");
      }
    }
    fetchFaculties();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (selectedFaculty === null) {
      setDepartments([]);
      setSelectedDepartment(null);
      setSpecialties([]);
      setSelectedSpecialty(null);
      setGroups([]);
      setSelectedGroup(null);
      return;
    }

    async function fetchDepartments() {
      try {
        const res = await fetch(`/api/faculties/${selectedFaculty}/departments`);
        if (!res.ok) throw new Error("Failed to load departments");
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити кафедри");
      }
    }

    async function fetchSpecialties() {
      try {
        const res = await fetch(`/api/faculties/${selectedFaculty}/specialties`);
        if (!res.ok) throw new Error("Failed to load specialties");
        const data = await res.json();
        setSpecialties(data);
      } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити спеціальності");
      }
    }

    fetchDepartments();
    fetchSpecialties();
  }, [selectedFaculty]);

  // Load groups when specialty changes
  useEffect(() => {
    if (selectedSpecialty === null) {
      setGroups([]);
      setSelectedGroup(null);
      return;
    }

    async function fetchGroups() {
      try {
        const res = await fetch(`/api/specialties/${selectedSpecialty}/groups`);
        if (!res.ok) throw new Error("Failed to load groups");
        const data = await res.json();
        setGroups(data);
      } catch (error) {
        console.error(error);
        alert("Не вдалося завантажити групи");
      }
    }
    fetchGroups();
  }, [selectedSpecialty]);

  const handleSubmit = async () => {
  if (!selectedFaculty || !selectedDepartment) {
    alert("Будь ласка, оберіть факультет і кафедру");
    return;
  }

  if (role === "student" && (!selectedSpecialty || !selectedGroup)) {
    alert("Будь ласка, оберіть спеціальність та групу");
    return;
  }

  const formData = {
    firstName,
    lastName,
    email,
    password,
    facultyId: selectedFaculty,
    departmentId: selectedDepartment,
    specialtyId: selectedSpecialty,
    groupId: selectedGroup,
    role,
  };

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Помилка реєстрації: ${data.message}`);
      return;
    }

    const registerData = await res.json();
    console.log('✅ Registration successful:', registerData);

    // Використовуємо токен з реєстрації замість окремого логіну
    localStorage.setItem("token", registerData.token);
    localStorage.setItem("currentUser", JSON.stringify(registerData.user));

    // Перевіряємо роль і перенаправляємо
    if (registerData.user.role === "student") {
      navigate("/dashboard");
    } else if (registerData.user.role === "teacher") {
      navigate("/analytics");
    } else {
      navigate("/");
    }
  } catch (error) {
    console.error("Помилка мережі:", error);
    alert("Помилка мережі. Спробуйте пізніше.");
  }
};

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Blur Backgrounds */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-0" />

      <div className="w-full max-w-3xl z-10">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-md transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01]">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-white/80" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Реєстрація користувача
            </CardTitle>

            {/* Role Field */}
            <div className="mt-6 w-full md:w-1/2 mx-auto">
              <Label className="text-white/80 mb-1 block text-left">Роль</Label>
              <Select value={role} onValueChange={(val) => {
                setRole(val);
                // Reset specialty and group when role changes
                if (val === "teacher") {
                  setSelectedSpecialty(null);
                  setSelectedGroup(null);
                }
              }}>
                <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                  <SelectValue placeholder="Оберіть роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Студент</SelectItem>
                  <SelectItem value="teacher">Викладач</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <Label className="text-white/80 mb-1 block">Імʼя</Label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введіть імʼя"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Last Name */}
              <div>
                <Label className="text-white/80 mb-1 block">Прізвище</Label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введіть прізвище"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-white/80 mb-1 block">Email</Label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@lnu.edu.ua"
                  className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50"
                />
              </div>

              {/* Password with Eye toggle */}
              <div>
                <Label className="text-white/80 mb-1 block">Пароль</Label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введіть пароль"
                    className="w-full bg-white/10 border border-white/10 text-white/90 rounded-md px-3 py-2 outline-none placeholder:text-white/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
                  >
                    {showPassword ? (
                      <Eye size={18} className="text-white/70" />
                    ) : (
                      <EyeOff size={18} className="text-white/70" />
                    )}
                  </button>
                </div>
              </div>

              {/* Faculty */}
              <div>
                <Label className="text-white/80 mb-1 block">Факультет</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedFaculty(Number(value));
                    setSelectedDepartment(null);
                    setSelectedSpecialty(null);
                    setSelectedGroup(null);
                  }}
                  value={selectedFaculty?.toString() || ""}
                >
                  <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                    <SelectValue placeholder="Оберіть факультет" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map(({ id, name }) => (
                      <SelectItem key={id} value={id.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div>
                <Label className="text-white/80 mb-1 block">Кафедра</Label>
                <Select
                  onValueChange={(value) => setSelectedDepartment(Number(value))}
                  value={selectedDepartment?.toString() || ""}
                  disabled={!selectedFaculty}
                >
                  <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                    <SelectValue placeholder="Оберіть кафедру" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(({ id, name }) => (
                      <SelectItem key={id} value={id.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty (only for students) */}
              {role === "student" && (
                <>
                  <div>
                    <Label className="text-white/80 mb-1 block">Спеціальність</Label>
                    <Select
                      onValueChange={(value) => {
                        setSelectedSpecialty(Number(value));
                        setSelectedGroup(null);
                      }}
                      value={selectedSpecialty?.toString() || ""}
                      disabled={!selectedFaculty}
                    >
                      <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                        <SelectValue placeholder="Оберіть спеціальність" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map(({ id, code, name }) => (
                          <SelectItem key={id} value={id.toString()}>
                            {code} - {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group (only for students) */}
                  <div>
                    <Label className="text-white/80 mb-1 block">Група</Label>
                    <Select
                      onValueChange={(value) => setSelectedGroup(Number(value))}
                      value={selectedGroup?.toString() || ""}
                      disabled={!selectedSpecialty}
                    >
                      <SelectTrigger className="w-full bg-white/10 border border-white/10 text-white/90">
                        <SelectValue placeholder="Оберіть групу" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(({ id, name, course, education_level }) => (
                          <SelectItem key={id} value={id.toString()}>
                            {name} ({course} курс, {education_level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <GlassButton
              className="w-full mt-8 text-sm py-2"
              variant="primary"
              onClick={handleSubmit}
            >
              Зареєструватися
            </GlassButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;