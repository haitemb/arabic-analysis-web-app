# AI Context: Educational Content Quality Analyzer (مؤشر الجودة)

## Project Overview
This project is a web-based "Educational Content Quality Analyzer" (مؤشر الجودة), built to analyze educational documents (PDF, DOC/DOCX) and assess their quality using Google Gemini AI. 

## Tech Stack
- **Framework**: React 18 with Vite
- **Routing**: React Router (`react-router-dom`)
- **Styling**: Tailwind CSS (with `clsx` and `tailwind-merge`)
- **UI Components**: Radix UI primitives, Recharts for charts
- **Icons**: Lucide React
- **Authentication/Backend**: Supabase
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Document Processing**: `pdf-parse`, `pdfjs-dist`, `mammoth`

## Core Architecture
- `src/App.tsx`: Main routing and authentication provider (`AuthProvider`). 
- `src/components/`: Contains all UI components (Dashboard, LoginScreen, AnalysisResults, DetailedReport, etc.).
- `src/services/`: Contains backend and API integrations like `supabaseClient.ts`.
- `src/index.css`: Global styles including Tailwind directives.

## Key Features
1. **Authentication**: Handled via Supabase (Login, Signup, Reset Password).
2. **Document Upload & Parsing**: Extracts text from user-uploaded documents.
3. **AI Analysis**: Prompts Gemini AI to evaluate:
   - Linguistic and Semantic qualities.
   - Bloom's Taxonomy alignment.
   - Content Organization.
   - Strengths, Weaknesses, and Actionable Recommendations.
4. **Interactive Reports**: Visualizes data through charts and metrics using Radix UI and Recharts.

## Future AI Instructions
- The app has been renamed from "Educational Content Quality Analyzer" to "مؤشر الجودة".
- Ensure any UI component modifications maintain the RTL (Right-to-Left) layout and styling expected of Arabic interfaces.
- The project relies on `sessionStorage` to persist analysis state across route navigation (between `/analysis` and `/report`). 
- For document analysis, the heavy lifting of extraction and API calls is handled client-side via the `.env` provided `VITE_GEMINI_API_KEY`.
- **UI Notifications**: The project uses `sonner` for global toasts. Do not use native `alert()`. Reusable helpers are available in `src/utils/toast.ts` (`showError`, `showSuccess`, `showInfo`).
- **Rate Limiting**: Daily analysis limits (e.g., 3 per day) are enforced via the Supabase RPC `check_and_increment_usage`. Always call this RPC and handle the response before making expensive Gemini API requests.
