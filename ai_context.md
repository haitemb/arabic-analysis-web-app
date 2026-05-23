# AI Context: Educational Content Quality Analyzer (مؤشر الجودة)

This document provides a comprehensive, structured overview of the **Educational Content Quality Analyzer (مؤشر الجودة)** web application. It functions as a complete reference guide for subsequent AI models and developers to understand the project architecture, data flows, database schemas, business rules, and design details without analyzing the entire codebase.

---

## 1. Project Overview & Objectives
**مؤشر الجودة** is an advanced, web-based quality index application designed for educators, teachers, and content developers in Algeria and the Arabic-speaking region. The app enables users to upload educational materials (PDFs, Word Documents, Images) and evaluate their quality using Google Gemini AI. 

The analysis is performed against established educational criteria:
- **Linguistic & Semantic Accuracy**: Evaluates grammar, clarity, vocabulary level, and appropriateness for the age group.
- **Bloom's Taxonomy Alignment**: Assesses cognitive levels targeted by the text, questions, and activities (Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).
- **Content Organization & Coherence**: Analyzes layout logic, content flow, structure, and readability.
- **Linguistic and Pedagogical Assessment**: Generates overall quality scores, strengths, weaknesses, and actionable recommendations.

---

## 2. Technology Stack
- **Frontend Framework**: React 18 with Vite and TypeScript.
- **Routing**: `react-router-dom` (v7) for application paths.
- **Styling**: Tailwind CSS (fully customized with traditional Algerian geometric patterns, harmonic gradients, and standard Arabic micro-animations).
- **UI Components**: Radix UI primitives (shadcn components) like `AlertDialog`, `DropdownMenu`, `Card`, and `Button`.
- **Icons**: `lucide-react` for smooth modern glyphs.
- **Database / Authentication**: Supabase (auth + database) for storing user profiles, analyses logs, and usage tracking.
- **AI Integration**: Google Gemini API client-side using the `@google/generative-ai` SDK with the `gemini-2.5-flash` model.
- **Document Extractors**: 
  - `pdfjs-dist` (client-side PDF text extraction).
  - `mammoth` (client-side Word `.doc`/`.docx` text extraction).
  - Client-side Gemini (for OCR parsing of image-based uploads).

---

## 3. Database Schema Reference

The project operates on three main Supabase tables:

### A. `profiles` Table
Stores user profile information. Automatically populated or updated via auth triggers/profile settings.
- `id` (uuid, primary key) - References `auth.users.id`.
- `full_name` (text) - Full name of the user.
- `email` (text) - Primary contact email (read-only in frontend).
- `phone` (text, nullable) - Valid Algeria phone format: `+213XXXXXXXXX`.
- `city` (text, nullable) - Home city/province.
- `organization` (text, nullable) - School, university, or educational institution name.
- `job_title` / `role` (text, nullable) - Role (e.g., teacher, inspector, professor).

### B. `analyses` Table
Logs all historical documents analyzed. Loaded on the Dashboard and History Page.
- `id` (uuid, primary key) - Unique analysis ID.
- `user_id` (uuid, foreign key) - Links to `profiles.id` / `auth.users.id`.
- `filename` (text) - Original name of the uploaded document.
- `education_level` (text) - Algerian targeted level (`ابتدائي`, `متوسط`, `ثانوي`).
- `overall_score` (integer) - Total quality score out of 100.
- `executive_summary` (text) - High-level AI summary of quality.
- `linguistic_analysis` (jsonb/text) - Analysis of grammar, vocabulary, and readability.
- `semantic_analysis` (jsonb/text) - Semantic depth and clarity index.
- `blooms_taxonomy` (jsonb/text) - Score mapping across Bloom's levels.
- `content_organization` (jsonb/text) - Structural scores.
- `strengths` (text[] or serialized string) - Array of document strengths.
- `weaknesses` (text[] or serialized string) - Array of document weaknesses.
- `recommendations` (text[] or serialized string) - Array of actionable pedagogical recommendations.
- `key_findings` (text) - Primary conclusions.
- `is_favorite` (boolean) - Favorite bookmark flag.
- `created_at` (timestamp with timezone) - Date and time of analysis.

### C. `user_usage` Table
A highly critical table that records rate-limiting parameters. Updates atomically via Supabase functions.
- `user_id` (uuid, primary key) - Links to `auth.users.id`.
- `daily_count` (integer) - Number of analyses successfully performed today.
- `last_reset` (date) - Date of the last counter reset. Defaults to `CURRENT_DATE`.

---

## 4. Key Business Logic & Mechanics

### 1. Rate Limiting System (Atomic Backend Enforcement)
To prevent API abuse and cost overrun, each user has a **Daily Limit of 3 Analyses** (`DAILY_LIMIT = 3`).
- **Enforcement Flow**: Before calling Gemini API in `Dashboard.tsx`, the frontend calls the Supabase RPC:
  ```typescript
  const { data: canUse, error } = await supabase.rpc('check_and_increment_usage', { uid: user.id });
  ```
- **RPC Behavior**: The RPC atomically checks if `last_reset === CURRENT_DATE`. If not, it resets `daily_count` to 0 and updates `last_reset`. It then increments `daily_count` if it is strictly below the limit, returning `true` (success/allowed) or `false` (limit reached).
- **RTL Error message on Limit Reached**: 
  > "لقد استهلكت جميع المحاولات المجانية اليوم 🎯 يمكنك العودة غداً أو الترقية إلى الباقة الاحترافية (قريباً)"

### 2. Frontend Daily Usage Counter
To avoid timezone differences and complex frontend math, the **"استخدام اليوم"** (Daily Usage) card on the dashboard fetches usage stats directly from Supabase's `user_usage` table.
- **Parsing logic**:
  ```typescript
  const { data } = await supabase.from('user_usage').select('daily_count, last_reset').eq('user_id', user.id).maybeSingle();
  ```
- **Synchronization**: If the record exists, the client checks if the database's `last_reset` date matches today's date in UTC format (`new Date().toISOString().split('T')[0]`). If yes, the `daily_count` is set; if no, it is displayed as `0` (as the next RPC call will reset it).
- **Success Sync**: After a successful analysis, the dashboard triggers `await fetchDailyUsage()` to sync the count directly from the server.

### 3. Layout Stack & Dialog Visibility (CRITICAL FIX)
- **Problem**: The main Header component uses a `relative z-50` class. When Radix UI's `AlertDialog` components were rendered with a local className containing `z-50` (e.g. `<AlertDialogContent className="rtl:text-right z-50">`), the Tailwind Merge utility resolved the class conflict by overwriting the default `z-[9999]` from `alert-dialog.tsx` with the lower `z-50`. This forced the dialog to render *behind* the header or stacking context, while its overlay captured mouse events—freezing the page.
- **Fix / Standard Rule**: Never apply explicit z-indices directly inside `<AlertDialogContent>` or other overlays in layout files. The components in `ui/alert-dialog.tsx` are already configured with robust default z-indices (`AlertDialogOverlay` is `z-[9998]`, `AlertDialogContent` is `z-[9999]`). Removing any `z-50` or other custom z-index classes in page-level components solves this issue entirely.

### 4. Text Extraction Pipeline
- **PDF File**: Handled via `pdfjs-dist` to parse pages and combine text.
- **Word File (`.doc`, `.docx`)**: Handled client-side via `mammoth` parser.
- **Image File**: Reuses the main Gemini instance as a high-performance visual OCR parser, sending the image file as a generative payload to extract readable Arabic text.

### 5. UI Notification Standard
Native browser `alert()` is **banned**. The application uses a unified, beautifully styled `sonner` toast system. Reusable helper functions are exported from `src/utils/toast.ts`:
- `showSuccess(message)`: green toast with positive confirmation.
- `showError(message)`: red toast for errors and exceptions.
- `showInfo(message)`: blue informational toast.

---

## 5. Directory Mapping & Key Files

- `src/components/ui/`: Standard reusable UI components (buttons, badges, inputs, charts, sonner configs).
- `src/components/Dashboard.tsx`: Document upload interface, Targeted level selectors, Recent analyses cards, and Daily Usage limit cards.
- `src/components/ProfilePage.tsx`: Personal details editor, Password changer form, Account deletion dialogs.
- `src/components/HistoryPage.tsx`: Full catalog of user's past analyses with search, filters, favorites toggles, and deletion triggers.
- `src/services/geminiApi.ts`: The core AI engine. Prompts Gemini with the extracted text, structured system prompts, and custom metrics.
- `src/services/textExtractor.ts`: Integrates the PDF, DOCX, and visual image OCR text extraction scripts.
- `src/utils/toast.ts`: Exports `showError`, `showSuccess`, and `showInfo` helpers for Sonner toasts.
- `ai_context.md`: This file. Must be updated upon changing database columns, API mechanisms, or critical UI architecture patterns.
