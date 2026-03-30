import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './routes/ProtectedRoute';

import { useAuth } from './modules/auth/hooks/useAuth';
import LoadingScreen from './components/common/LoadingScreen/LoadingScreen';

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
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/save" element={<SaveItem />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:topicName" element={<TopicDetail />} />
          <Route path="/graph" element={<KnowledgeGraphPage />} />
          <Route path="/composer" element={<SecondDraftPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { ThemeProvider } from './context/ThemeContext';

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