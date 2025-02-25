import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import router from "./routes/Routes";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
        <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Bounce}
        />
    </StrictMode>
);
