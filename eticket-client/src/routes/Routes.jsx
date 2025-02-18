import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import Table from "../pages/Table/Table";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/table",
        element: <Table />,
    },
]);

export default router;
