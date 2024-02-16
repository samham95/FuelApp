import { RouterProvider, Route, createBrowserRouter, createRoutesFromElements, Outlet, Link } from 'react-router-dom'
import Login from './Login.jsx'
import Navbar from './Navbar.jsx'
import Index from './Index.jsx'
import Profile from './Profile.jsx'
import EditProfile from './EditProfile.jsx'
import Register from './Register.jsx'




const Root = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />}>
      <Route path='/' element={<Index />} />
      <Route path='/login' element={<Login />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/profile/edit' element={<EditProfile />} />
      <Route path='/register' element={<Register />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={appRouter} />
}

export default App
