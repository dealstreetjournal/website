import './App.css'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import spinner from './assets/spinner.png'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/cart/CartProvider'
import { AuthProvider } from './context/auth/AuthProvider'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Deal = lazy(() => import('./pages/Deal'))
const Funding365 = lazy(() => import('./pages/Funding365'))
const LatestDeal = lazy(() => import('./pages/LatestDeal'))
const FinancialInsight = lazy(() => import('./pages/FinancialInsight'))
const DealDetails = lazy(() => import('./pages/DealDetails'))
const Funding365Company = lazy(() => import('./pages/Funding365Company'))
const FinancialCompany = lazy(() => import('./pages/FinancialCompany'))
const DsjInsight = lazy(() => import('./pages/DsjInsight'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const TermsOfServices = lazy(() => import('./pages/TermsOfServices'))
const Login = lazy(() => import('./pages/Login'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route
        index
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Home />
          </Suspense>
        }
      />

      <Route
        path="/preseed"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Deal />
          </Suspense>
        }
      />

      <Route
        path="/seed"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Deal />
          </Suspense>
        }
      />

      <Route
        path="/growth"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Deal />
          </Suspense>
        }
      />

      <Route
        path="/ma"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Deal />
          </Suspense>
        }
      />

      <Route
        path="/ipo"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Deal />
          </Suspense>
        }
      />

      <Route
        path="/world"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Deal />
          </Suspense>
        }
      />

      <Route
        path="/latest"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <LatestDeal />
          </Suspense>
        }
      />

      <Route
        path="/funding"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Funding365 />
          </Suspense>
        }
      />

      <Route
        path="/financial"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <FinancialInsight />
          </Suspense>
        }
      />

      <Route
        path="/preseed/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DealDetails />
          </Suspense>
        }
      />

      <Route
        path="/seed/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DealDetails />
          </Suspense>
        }
      />

      <Route
        path="/growth/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DealDetails />
          </Suspense>
        }
      />

      <Route
        path="/ma/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DealDetails />
          </Suspense>
        }
      />

      <Route
        path="/ipo/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DealDetails />
          </Suspense>
        }
      />

      <Route
        path="/world/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DealDetails />
          </Suspense>
        }
      />

      <Route
        path="/funding/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Funding365Company />
          </Suspense>
        }
      />
      <Route
        path="/financial/:id"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <FinancialCompany />
          </Suspense>
        }
      />

      <Route
        path="/dsj-insight"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <DsjInsight />
          </Suspense>
        }
      />

      <Route
        path="/about-us"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <AboutUs />
          </Suspense>
        }
      />

      <Route
        path="/contact-us"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <ContactUs />
          </Suspense>
        }
      />

      <Route
        path="/refund-policy"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <RefundPolicy />
          </Suspense>
        }
      />

      <Route
        path="/privacy-policy"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <PrivacyPolicy />
          </Suspense>
        }
      />

      <Route
        path="/terms-of-services"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <TermsOfServices />
          </Suspense>
        }
      />

      <Route
        path="/login"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Login />
          </Suspense>
        }
      />

      <Route
        path="/cart"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <Cart />
          </Suspense>
        }
      />

      <Route
        path="/checkout"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="/user"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      <Route
        path="*"
        element={
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={spinner}
                  alt="Loading"
                  className="w-12 h-12 animate-spin mb-2 mix-blend-multiply"
                />
              </div>
            }
          >
            <NotFound />
          </Suspense>
        }
      />
    </Route>
  )
)

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <RouterProvider router={router} />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
