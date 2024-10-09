import { ChakraProvider } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./components/App";
import ListDetails from "./components/ListDetails";
import Login from "./components/Login";

if (import.meta.env.MODE === "development") {
  axios.defaults.withCredentials = true;
}

// Redirect to login on 401 error
axios.interceptors.response.use(
  (response) => response,
  function (error) {
    if (error.response.status === 401) {
      window.location.href = "/login";
      console.log(error);
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/:listId" element={<ListDetails />}></Route>
          <Route path="/login" element={<Login />}></Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
