import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import UploadPage from './pages/UploadPage';
import SignInPage from './pages/SignInPage';
import ChannelPage from './pages/ChannelPage';
import SearchPage from './pages/SearchPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import LikedVideosPage from './pages/LikedVideosPage';
import YourVideosPage from './pages/YourVideosPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import WatchLaterPage from './pages/WatchLaterPage';
import ShortsPage from './pages/ShortsPage';
import TrendingPage from './pages/TrendingPage';
import CategoryPage from './pages/CategoryPage';
import PlaylistsPage from './pages/PlaylistsPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route
              path="/shorts"
              element={
                <ProtectedRoute>
                  <ShortsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="watch/:id" element={<WatchPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="channel/:id" element={<ChannelPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="liked-videos" element={<LikedVideosPage />} />
              <Route path="your-videos" element={<YourVideosPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="watch-later" element={<WatchLaterPage />} />
              <Route path="playlists" element={<PlaylistsPage />} />
              <Route path="trending" element={<TrendingPage />} />
              <Route path="music" element={<CategoryPage />} />
              <Route path="movies" element={<CategoryPage />} />
              <Route path="live" element={<CategoryPage />} />
              <Route path="gaming" element={<CategoryPage />} />
              <Route path="news" element={<CategoryPage />} />
              <Route path="sports" element={<CategoryPage />} />
              <Route path="learning" element={<CategoryPage />} />
              <Route path="fashion" element={<CategoryPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

