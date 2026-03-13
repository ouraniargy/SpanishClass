import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import CalendarPage from "./pages/CalendarPage/CalendarPage";
import GoogleRoleSelect from "./pages/GoogleRoleSelect";
import CreateLessonPage from "./pages/Lesson/CreateLessonPage/CreateLessonPage";
import ViewLessonsPage from "./pages/Lesson/ViewLessonsPage/ViewLessonsPage";
import CreateLevelPage from "./pages/Level/CreateLevelPage/CreateLevelPage";
import ViewLevelsPage from "./pages/Level/ViewLevelsPage/ViewLevelsPage";
import ExternalLoginCallback from "./pages/Login/ExternalLoginCallback";
import Login from "./pages/Login/Login";
import ProfessorPage from "./pages/ProfessorPage/ProfessorPage";
import Register from "./pages/Register/Register";
import StudentPage from "./pages/StudentPage/StudentPage";
import ProfilePage from "./pages/User/ProfilePage";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/students"
              element={
                <ProtectedRoute
                  element={<StudentPage />}
                  allowedRoles={["Student"]}
                />
              }
            />
            <Route
              path="/professors"
              element={
                <ProtectedRoute
                  element={<ProfessorPage />}
                  allowedRoles={["Professor"]}
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute
                  element={<CalendarPage />}
                  allowedRoles={["Student", "Professor"]}
                />
              }
            />

            <Route
              path="/createLesson"
              element={
                <ProtectedRoute
                  element={<CreateLessonPage />}
                  allowedRoles={["Professor"]}
                />
              }
            />

            <Route
              path="/viewLessons"
              element={
                <ProtectedRoute
                  element={<ViewLessonsPage />}
                  allowedRoles={["Student", "Professor"]}
                />
              }
            />

            <Route
              path="/createLevel"
              element={
                <ProtectedRoute
                  element={<CreateLevelPage />}
                  allowedRoles={["Professor"]}
                />
              }
            />

            <Route
              path="/viewLevels"
              element={
                <ProtectedRoute
                  element={<ViewLevelsPage />}
                  allowedRoles={["Professor"]}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  element={<ProfilePage />}
                  allowedRoles={["Student", "Professor"]}
                />
              }
            />

            <Route
              path="/external-login-callback"
              element={<ExternalLoginCallback />}
            />
            <Route path="/select-role" element={<GoogleRoleSelect />} />
            <Route
              path="/unauthorized"
              element={<h1>No access to this page.</h1>}
            />
            {/* <Levels />
          <Bookings /> */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
