import { BrowserRouter, Route, Routes } from "react-router-dom";
import CalendarPage from "./pages/CalendarPage/CalendarPage";
import Login from "./pages/Login/Login";
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
          <Route path="/calendar" element={<CalendarPage />} />

          {/* <Levels />
          <Bookings /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
