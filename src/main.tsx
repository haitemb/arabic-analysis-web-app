import React from 'react';
import { Buffer } from 'buffer';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Make Buffer available globally for pdf-parse
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);