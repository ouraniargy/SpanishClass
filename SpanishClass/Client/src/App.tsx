import { BrowserRouter, Route, Routes } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage/CalendarPage";
import CreateLessonPage from "./pages/Lesson/CreateLessonPage/CreateLessonPage";
import ViewLessonsPage from "./pages/Lesson/ViewLessonsPage/ViewLessonsPage";
import Login from "./pages/Login/Login";
import ProfessorPage from "./pages/ProfessorPage/ProfessorPage";
import Register from "./pages/Register/Register";
import StudentPage from "./pages/StudentPage/StudentPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/students" element={<StudentPage />} />
          <Route path="/professors" element={<ProfessorPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/createLesson" element={<CreateLessonPage />} />
          <Route path="/viewLessons" element={<ViewLessonsPage />} />

          {/* <Levels />
          <Bookings /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
