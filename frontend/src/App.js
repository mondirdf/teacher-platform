import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonDetails from './pages/LessonDetails';
import Videos from './pages/Videos';
import Files from './pages/Files';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/lessons/:id" element={<LessonDetails />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/files" element={<Files />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;