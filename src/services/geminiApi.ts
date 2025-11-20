
import { GoogleGenerativeAI } from "@google/generative-ai";
const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MODEL_NAME = "gemini-2.5-flash"; // free tier model

export interface GeminiAnalysisResponse {
  overallScore: number;
  executiveSummary: string;
  linguisticAnalysis: {
    grammaticalComplexity: number;
    stylisticDiversity: number;
    textSimplicity: number;
    languageEase: number;
  };
  semanticAnalysis: {
    ambiguity: number;
    repetition: number;
    conceptualGap: number;
    semanticLinks: number;
  };
  bloomsTaxonomy: {
    creativity: number;
    evaluation: number;
    analysis: number;
    application: number;
    understanding: number;
    remembering: number;
  };
  contentOrganization: {
    structureQuality: number;
    learningProgression: number;
    contentRelevance: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    priority: "عالية" | "متوسطة" | "منخفضة";
  }[];
  keyFindings: {
    linguistic: string[];
    semantic: string[];
    pedagogical: string[];
  };
}

const ANALYSIS_PROMPT = `أنت محلل محترف لجودة المحتوى التعليمي باللغة العربية. قم بتحليل النص التالي وتقييمه بناءً على المستوى التعليمي المستهدف: {educationLevel}

النص المراد تحليله:
{extractedText}

قم بإجراء تحليل شامل وتقديم النتائج بتنسيق JSON فقط، بدون أي نص إضافي. يجب أن يحتوي JSON على البنية التالية:

{
  "overallScore": عدد من 0 إلى 100,
  "executiveSummary": "فقرة موجزة تقدم ملخصاً تنفيذياً شاملاً ودقيقاً حول جودة النص وملاءمته للمستوى التعليمي ونقاط القوة والضعف وأهم الاستنتاجات",
  "linguisticAnalysis": {
    "grammaticalComplexity": عدد من 0 إلى 100,
    "stylisticDiversity": عدد من 0 إلى 100,
    "textSimplicity": عدد من 0 إلى 100,
    "languageEase": عدد من 0 إلى 100
  },
  "semanticAnalysis": {
    "ambiguity": عدد من 0 إلى 100 (كلما قل العدد كان أفضل),
    "repetition": عدد من 0 إلى 100 (كلما قل العدد كان أفضل),
    "conceptualGap": عدد من 0 إلى 100 (كلما قل العدد كان أفضل),
    "semanticLinks": عدد من 0 إلى 100 (كلما زاد العدد كان أفضل)
  },
  "bloomsTaxonomy": {
    "creativity": عدد من 0 إلى 100,
    "evaluation": عدد من 0 إلى 100,
    "analysis": عدد من 0 إلى 100,
    "application": عدد من 0 إلى 100,
    "understanding": عدد من 0 إلى 100,
    "remembering": عدد من 0 إلى 100
  },
  "contentOrganization": {
    "structureQuality": عدد من 0 إلى 100,
    "learningProgression": عدد من 0 إلى 100,
    "contentRelevance": عدد من 0 إلى 100
  },
  "strengths": [
    "نقطة قوة 1",
    "نقطة قوة 2"
  ],
  "weaknesses": [
    "نقطة ضعف 1",
    "نقطة ضعف 2"
  ],
  "recommendations": [
    {
      "title": "عنوان التوصية",
      "description": "وصف تفصيلي للتوصية مع أمثلة محددة من النص",
      "priority": "عالية" أو "متوسطة" أو "منخفضة"
    }
  ],
  "keyFindings": {
    "linguistic": [
      "نتيجة رئيسية 1",
      "نتيجة رئيسية 2"
    ],
    "semantic": [
      "نتيجة رئيسية 1",
      "نتيجة رئيسية 2"
    ],
    "pedagogical": [
      "نتيجة رئيسية 1",
      "نتيجة رئيسية 2"
    ]
  }
}

تعليمات التحليل:
1. قم بتقييم مدى ملاءمة النص للمستوى التعليمي المحدد
2. حلل التعقيد النحوي وطول الجمل
3. قيم التنوع الأسلوبي واستخدام المرادفات
4. حدد المصطلحات الغامضة أو غير المحددة
5. اكتشف التكرار المفرط للمصطلحات
6. قيم الاتساق المفاهيمي والروابط الدلالية
7. حلل توزيع أهداف التعلم حسب تصنيف بلوم
8. قيم جودة الهيكل وتنظيم المحتوى
9. قدم توصيات عملية وقابلة للتنفيذ مع أمثلة محددة من النص
10. ركز على نقاط القوة والضعف الأكثر أهمية

تأكد من أن جميع الأرقام منطقية ومتسقة، وأن التوصيات محددة وعملية.`;


export async function analyzeWithGemini(
  extractedText: string,
  educationLevel: string
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8000,
    }
  });

  // Use more text but not too much
  const limitedText = extractedText.substring(0, 4000);
  
  const finalPrompt = ANALYSIS_PROMPT
    .replace("{educationLevel}", educationLevel)
    .replace("{extractedText}", limitedText);

  try {
    console.log('🚀 === STARTING GEMINI ANALYSIS ===');
    console.log('📝 Education Level:', educationLevel);
    console.log('📄 Text length sent to Gemini:', limitedText.length);
    console.log('🔤 Prompt length:', finalPrompt.length);
    
    console.log('\n📤 Sending request to Gemini...');
    
    const result = await model.generateContent(finalPrompt);
    
    console.log('✅ Gemini response received!');
    
    const response = await result.response;
    // Try different ways to get the text
    let text = '';
    
    if (typeof response.text === 'function') {

      text = response.text();
      
    } else if (response.text) {
      text = response.text;
      
    } else {
      console.log('❌ No text found in response object');
      console.log('🔍 Response keys:', Object.keys(response));
    }

    console.log('\n📊 Response text length:', text.length);
    console.log('📄 Full response text:', text);

    if (!text) {
      throw new Error("لم يتم العثور على نص في استجابة Gemini");
    }

    // Simple JSON extraction
    let jsonText = text.trim();
    console.log('✂️ Trimmed text:', jsonText);

    // Remove any code blocks
    jsonText = jsonText.replace(/```json|```/g, '').trim();
    console.log('🧹 After removing code blocks:', jsonText);

    // Find the first complete JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    console.log('🔍 JSON match result:', jsonMatch);

    if (!jsonMatch) {
      console.log('❌ No JSON pattern found in:', jsonText);
      throw new Error("لم يتم العثور على JSON في الاستجابة");
    }

    jsonText = jsonMatch[0];
    console.log('🎯 Extracted JSON string:', jsonText);
    console.log('📏 Extracted JSON length:', jsonText.length);

    // Parse whatever JSON we get
    console.log('\n🔄 Attempting to parse JSON...');
    const parsed = JSON.parse(jsonText);
    console.log('✅ Successfully parsed JSON response!');
    console.log('🔍 Parsed object keys:', Object.keys(parsed));
    
    console.log('🎉 === GEMINI ANALYSIS COMPLETED SUCCESSFULLY ===');
    
    return parsed;

  } catch (err: any) {
    console.error('❌ === GEMINI ANALYSIS FAILED ===');
    console.error('💥 Error details:', err);
    console.error('🔧 Error message:', err.message);
    console.error('📋 Error stack:', err.stack);
    
    if (err instanceof SyntaxError) {
      console.error('🔍 JSON Syntax Error - problematic text was:');
    }
    
    throw new Error(`خطأ في التحليل: ${err.message}`);
  }
}