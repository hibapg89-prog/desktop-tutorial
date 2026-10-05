import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import CategoryDetail from '@/pages/CategoryDetail';
import Vanity from '@/pages/Vanity';
import ProductResult from '@/pages/ProductResult';
import LocalCurator from '@/pages/LocalCurator';
import SubcategoryGrid from '@/pages/SubcategoryGrid';
import Tutorials from '@/pages/Tutorials';
import TutorialDetail from '@/pages/TutorialDetail';
import ServicesMap from '@/pages/ServicesMap';
import Membership from '@/pages/Membership';
import Profile from '@/pages/Profile';
import Notifications from '@/pages/Notifications';
import Community from '@/pages/Community';
import CommunityPostDetail from '@/pages/CommunityPostDetail';
import Messages from '@/pages/Messages';
import Conversation from '@/pages/Conversation';
import IngredientAlerts from '@/pages/IngredientAlerts';
import ShoppingList from '@/pages/ShoppingList';
import VanityDashboard from '@/pages/VanityDashboard';
import AccessibilitySettings from '@/pages/AccessibilitySettings';
import NotificationsSettings from '@/pages/NotificationsSettings';
import Account from '@/pages/Account';
import Distinctions from '@/pages/Distinctions';
import CircleRooms from '@/pages/CircleRooms';
import CircleRoom from '@/pages/CircleRoom';
import ScanResults from '@/pages/ScanResults';
import ScanHistory from '@/pages/ScanHistory';
import Unsubscribe from '@/pages/Unsubscribe';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/category/:category" element={<CategoryDetail />} />
          <Route path="/vanity" element={<Vanity />} />
          <Route path="/product/:id" element={<ProductResult />} />
          <Route path="/local-curator/:id" element={<LocalCurator />} />
          <Route path="/explore/:slug" element={<SubcategoryGrid />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorial/:id" element={<TutorialDetail />} />
          <Route path="/map" element={<ServicesMap />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<CommunityPostDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:userId" element={<Conversation />} />
          <Route path="/ingredient-alerts" element={<IngredientAlerts />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/vanity/insights" element={<VanityDashboard />} />
          <Route path="/accessibility" element={<AccessibilitySettings />} />
          <Route path="/notifications-settings" element={<NotificationsSettings />} />
          <Route path="/account" element={<Account />} />
          <Route path="/distinctions" element={<Distinctions />} />
          <Route path="/circle-rooms" element={<CircleRooms />} />
          <Route path="/circle-rooms/:id" element={<CircleRoom />} />
          <Route path="/scan-results" element={<ScanResults />} />
          <Route path="/scan-history" element={<ScanHistory />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
