import { createRoot } from "react-dom/client";
import Home from "./home";
import "./app.css";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Home />);
