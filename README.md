# Educational Content Quality Analyzer

This is a code bundle for Educational Content Quality Analyzer. The original project is available at https://www.figma.com/design/dj7kFOimHP8rfwv8M8qnTk/Educational-Content-Quality-Analyzer.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Gemini API key:
   - Copy `.env.example` to `.env`
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add your API key to `.env`:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

## Running the code

Run `npm run dev` to start the development server.

## Features

- **PDF/DOC Text Extraction**: Automatically extracts text from uploaded PDF and DOC/DOCX files
- **AI-Powered Analysis**: Uses Google Gemini AI to analyze educational content quality
- **Comprehensive Reports**: Provides detailed analysis including:
  - Linguistic analysis (grammatical complexity, stylistic diversity, text simplicity)
  - Semantic analysis (ambiguity, repetition, conceptual gaps, semantic links)
  - Bloom's Taxonomy distribution
  - Content organization metrics
  - Strengths and weaknesses
  - Actionable recommendations

## API Integration

The app integrates with Google Gemini AI API to analyze educational content. Make sure to:
1. Get your API key from Google AI Studio
2. Add it to the `.env` file as `VITE_GEMINI_API_KEY`
3. The API key is used client-side, so ensure you have proper API restrictions set up in Google Cloud Console
