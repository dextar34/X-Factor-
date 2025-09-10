import React from 'react'
import {
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import MainMenu from './pages/MainMenu';
import Root from './pages/Root';
import Invoice from './pages/Invoice';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root/>}>
      <Route index element={<MainMenu/>} />
      <Route path='/invoice' element={<Invoice/>} />
    </Route>
  )
);

const App = () => (
  <div>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </div>
)

export default App
