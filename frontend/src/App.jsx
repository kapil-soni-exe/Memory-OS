import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home';
import SavedItems from './pages/SavedItems/SavedItems';
import TopicsPage from './pages/Topics/TopicsPage';
import TopicDetail from './pages/Topics/TopicDetail';
import KnowledgeGraphPage from './pages/KnowledgeGraph/KnowledgeGraphPage';
import SaveItem from './pages/SaveItem/SaveItem';
import SecondDraftPage from './pages/SecondDraft/SecondDraftPage';
import SettingsPage from './pages/Settings/SettingsPage';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './modules/auth/hooks/useAuth';
import LoadingScreen from './components/common/LoadingScreen/LoadingScreen';
import MainLayout from './layouts/MainLayout';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/save" element={<SaveItem />} />
            <Route path="/saved" element={<SavedItems />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:topicName" element={<TopicDetail />} />
            <Route path="/graph" element={<KnowledgeGraphPage />} />
            <Route path="/composer" element={<SecondDraftPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function AppRouter() {
  const { loading: authLoading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500); // 1.5 seconds minimum
    return () => clearTimeout(timer);
  }, []);

  const isLoading = authLoading || !minTimeElapsed;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;