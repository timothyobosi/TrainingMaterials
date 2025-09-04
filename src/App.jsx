import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import './App.css'; 

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("britamToken") || "");

  useEffect(() => {
    const savedToken = localStorage.getItem("britamToken");
    if (savedToken) setToken(savedToken);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/dashboard",
      element: token ? <Dashboard /> : <Login />,
    },
    {
      path: "/",
      element: <Login />,
    },
  ]);

  return (
    <>
      <Toaster closeButton richColors position="top-right" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;