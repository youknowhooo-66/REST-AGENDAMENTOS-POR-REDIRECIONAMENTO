import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import LandingPage from './pages/Landing/LandingPage';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Scheduling from './pages/Scheduling/Scheduling';
import Cancellation from './pages/Cancellation/Cancellation';
import UserList from './pages/UserList/UserList';
import UserProfile from './pages/UserProfile/UserProfile';
// import ServiceList from './pages/ServiceList/ServiceList'; // REMOVIDO
// import ServiceDetail from './pages/ServiceDetail/ServiceDetail'; // REMOVIDO
// import ServiceFormPage from './pages/ServiceForm/ServiceForm'; // REMOVIDO
// import ServiceSearchPage from './pages/ServiceSearch/ServiceSearchPage'; // REMOVIDO
import ServiceManagementPage from './pages/Provider/ServiceManagementPage'; // NOVO
import StaffManagementPage from './pages/Provider/StaffManagementPage'; // NOVO
import AvailabilitySlotManagementPage from './pages/Provider/AvailabilitySlotManagementPage'; // NOVO
import PublicServiceListPage from './pages/Public/PublicServiceListPage'; // NOVO
import ServiceDetailPage from './pages/Public/ServiceDetailPage'; // NOVO
import ClientProfilePage from './pages/Client/ClientProfilePage'; // NOVO
import ClientBookingPage from './pages/Client/ClientBookingPage'; // NOVO - Página de agendamento
import AppointmentList from './pages/AppointmentList/AppointmentList';
import AppointmentDetail from './pages/AppointmentDetail/AppointmentDetail';
import AppointmentFormPage from './pages/AppointmentForm/AppointmentForm';
import AppointmentCreator from './pages/Admin/AppointmentCreator';
import BookingManagementPage from './pages/Provider/BookingManagementPage'; // NOVO

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schedule" element={<Scheduling />} />
            <Route path="/cancel" element={<Cancellation />} />
            <Route path="/public/services" element={<PublicServiceListPage />} /> {/* Nova rota pública */}
            <Route path="/public/services/:id" element={<ServiceDetailPage />} /> {/* Nova rota pública */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} /> {/* Nova rota para Perfil */}
              <Route path="client/booking" element={<ClientBookingPage />} /> {/* Nova rota para Agendamento */}
              <Route path="users" element={<UserList />} />
              <Route path="users/:id" element={<UserProfile />} />
              {/* Rotas de serviço consolidadas em ServiceManagementPage */}
              <Route path="provider/services" element={<ServiceManagementPage />} />
              <Route path="provider/staff" element={<StaffManagementPage />} /> {/* Nova rota para Staff */}
              <Route path="provider/slots" element={<AvailabilitySlotManagementPage />} /> {/* Nova rota para Horários */}
              <Route path="provider/bookings" element={<BookingManagementPage />} /> {/* Nova rota para Gerenciar Agendamentos */}
              {/* <Route path="services" element={<ServiceList />} /> */}
              {/* <Route path="services/:id" element={<ServiceDetail />} /> */}
              {/* <Route path="services/form" element={<ServiceFormPage />} /> */}
              {/* <Route path="services/search" element={<ServiceSearchPage />} /> */}
              <Route path="appointments" element={<AppointmentList />} />
              <Route path="appointments/:id" element={<AppointmentDetail />} />
              <Route path="appointments/form" element={<AppointmentFormPage />} />
              <Route path="admin/appointments/create" element={<AppointmentCreator />} />
            </Route>
          </Routes>
          <ToastContainer
            position="bottom-right"
            theme="colored"
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
