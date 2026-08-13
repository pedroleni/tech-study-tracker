import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import { queryClient } from '@/lib/queryClient'
import { AdminDashboardPage } from '@/routes/AdminDashboardPage'
import { AdminCategoriesPage } from '@/routes/AdminCategoriesPage'
import { AdminTechnologyFormPage } from '@/routes/AdminTechnologyFormPage'
import { CategoryPage } from '@/routes/CategoryPage'
import { FavoritesPage } from '@/routes/FavoritesPage'
import { ForgotPasswordPage } from '@/routes/ForgotPasswordPage'
import { LoginPage } from '@/routes/LoginPage'
import { PublicHomePage } from '@/routes/PublicHomePage'
import { RegisterPage } from '@/routes/RegisterPage'
import { ResetPasswordPage } from '@/routes/ResetPasswordPage'
import { TechnologyPage } from '@/routes/TechnologyPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<PublicHomePage />} />
            <Route path="/categorias/:id" element={<CategoryPage />} />
            <Route path="/tecnologias/:id" element={<TechnologyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
            <Route path="/nueva-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
                <Route path="/admin/tecnologias/nueva" element={<AdminTechnologyFormPage />} />
                <Route
                  path="/admin/tecnologias/:id/editar"
                  element={<AdminTechnologyFormPage />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
