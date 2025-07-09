import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation/Navigation";
import RoleBasedRedirect from "./components/routing/RoleBasedRedirect";
import Login from "./pages/Login/login";
import Register from "./pages/Register/register";
import Home from "./pages/Home/home";
import GenreMusicPage from "./pages/Genre/GenreMusicPage";
import ArtistMusicPage from "./pages/Artist/ArtistMusicPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ArtistDashboard from "./pages/Artist/ArtistDashboard";
import PrivateRoute from "./components/routing/PrivateRoute";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/auth-redirect" element={<RoleBasedRedirect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/genre/:genreId" element={<GenreMusicPage />} />
            <Route path="/artist/:artistId" element={<ArtistMusicPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
