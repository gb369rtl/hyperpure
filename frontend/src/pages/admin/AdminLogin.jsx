import { Navigate } from 'react-router-dom';

// Unified auth: all users log in at /login. Admin access is determined by role.
export default function AdminLogin() {
  return <Navigate to="/login" replace />;
}
