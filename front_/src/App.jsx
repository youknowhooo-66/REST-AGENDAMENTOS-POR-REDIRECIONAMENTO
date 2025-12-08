import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout/DashboardLayout'));
const Scheduling = lazy(() => import('./pages/Scheduling/Scheduling'));
const Cancellation = lazy(() => import('./pages/Cancellation/Cancellation'));
const UserList = lazy(() => import('./pages/UserList/UserList'));
const UserProfile = lazy(() => import('./pages/UserProfile/UserProfile'));
const ServiceManagementPage = lazy(() => import('./pages/Provider/ServiceManagementPage'));
const StaffManagementPage = lazy(() => import('./pages/Provider/StaffManagementPage'));
const AvailabilitySlotManagementPage = lazy(() => import('./pages/Provider/AvailabilitySlotManagementPage'));
const PublicServiceListPage = lazy(() => import('./pages/Public/PublicServiceListPage'));
const ServiceDetailPage = lazy(() => import('./pages/Public/ServiceDetailPage'));
const ClientProfilePage = lazy(() => import('./pages/Client/ClientProfilePage'));
const ClientBookingPage = lazy(() => import('./pages/Client/ClientBookingPage'));
const AppointmentList = lazy(() => import('./pages/AppointmentList/AppointmentList'));
const AppointmentDetail = lazy(() => import('./pages/AppointmentDetail/AppointmentDetail'));
const AppointmentFormPage = lazy(() => import('./pages/AppointmentForm/AppointmentForm'));
const AppointmentCreator = lazy(() => import('./pages/Admin/AppointmentCreator'));
const BookingManagementPage = lazy(() => import('./pages/Provider/BookingManagementPage'));

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/scheduling" element={<Scheduling />} />
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
          </Suspense>
          <ToastContainer
            position="bottom-right"
            theme="colored"
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
