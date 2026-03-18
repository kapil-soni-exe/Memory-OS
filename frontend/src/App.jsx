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
import PlaceholderPage from './pages/Placeholder/Placeholder';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (Example placeholder for now) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/save" element={<SaveItem />} />
            <Route path="/saved" element={<SavedItems />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:topicName" element={<TopicDetail />} />
            <Route path="/graph" element={<KnowledgeGraphPage />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;