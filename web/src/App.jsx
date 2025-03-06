import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Componentes de Autenticación
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Componentes Principales
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import CreateIncident from './pages/CreateIncident';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Layout from './components/Layout';

const routes = [
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "incidents", element: <Incidents /> },
      { path: "incidents/:id", element: <IncidentDetail /> },
      { path: "incidents/create", element: <CreateIncident /> },
      { path: "profile", element: <Profile /> },
      { path: "users", element: <Users /> }
    ]
  },
  { path: "*", element: <Navigate to="/login" replace /> }
];

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  const [user, setUser] = React.useState(null);

  const handleStateUpdate = (newUserData) => {
    React.startTransition(() => {
      setUser(newUserData);
    });
  };

  return (
    <RouterProvider router={router}>
      <ToastContainer position="top-right" autoClose={3000} />
    </RouterProvider>
  );
}

export default App;
