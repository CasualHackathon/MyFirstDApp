import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CreateCoursePage } from './pages/CreateCoursePage'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create-course', element: <CreateCoursePage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
