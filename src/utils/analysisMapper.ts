import type { AnalysisData } from '../App';

const defaultLinguistic: AnalysisData['linguisticAnalysis'] = {
  grammaticalComplexity: 0,
  stylisticDiversity: 0,
  textSimplicity: 0,
  languageEase: 0,
};

const defaultSemantic: AnalysisData['semanticAnalysis'] = {
  ambiguity: 0,
  repetition: 0,
  conceptualGap: 0,
  semanticLinks: 0,
};

const defaultBlooms: AnalysisData['bloomsTaxonomy'] = {
  creativity: 0,
  evaluation: 0,
  analysis: 0,
  application: 0,
  understanding: 0,
  remembering: 0,
};

const defaultOrganization: AnalysisData['contentOrganization'] = {
  structureQuality: 0,
  learningProgression: 0,
  contentRelevance: 0,
};

const defaultKeyFindings: AnalysisData['keyFindings'] = {
  linguistic: [],
  semantic: [],
  pedagogical: [],
};

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

function parseRecommendations(value: unknown): AnalysisData['recommendations'] {
  const fallback: AnalysisData['recommendations'] = [];
  if (!value) return fallback;
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') {
        return { title: item, description: '', priority: 'متوسطة' as const };
      }
      return {
        title: String((item as { title?: string }).title ?? 'توصية'),
        description: String((item as { description?: string }).description ?? ''),
        priority: ((item as { priority?: string }).priority ?? 'متوسطة') as
          | 'عالية'
          | 'متوسطة'
          | 'منخفضة',
      };
    });
  }
  return parseJsonField(value, fallback);
}

/** Map a Supabase `analyses` row to `AnalysisData` for report view / PDF export. */
export function mapAnalysisRowToAnalysisData(row: Record<string, unknown>): AnalysisData {
  return {
    documentName: String(row.filename ?? row.document_name ?? 'مستند'),
    executiveSummary: String(row.executive_summary ?? row.executiveSummary ?? ''),
    educationLevel: String(row.education_level ?? row.educationLevel ?? 'غير محدد'),
    overallScore: Number(row.overall_score ?? row.overallScore ?? 0),
    uploadDate: String(row.created_at ?? row.uploadDate ?? new Date().toISOString()),
    linguisticAnalysis: parseJsonField(row.linguistic_analysis ?? row.linguisticAnalysis, defaultLinguistic),
    semanticAnalysis: parseJsonField(row.semantic_analysis ?? row.semanticAnalysis, defaultSemantic),
    bloomsTaxonomy: parseJsonField(row.blooms_taxonomy ?? row.bloomsTaxonomy, defaultBlooms),
    contentOrganization: parseJsonField(
      row.content_organization ?? row.contentOrganization,
      defaultOrganization,
    ),
    strengths: parseStringArray(row.strengths),
    weaknesses: parseStringArray(row.weaknesses),
    recommendations: parseRecommendations(row.recommendations),
    keyFindings: parseJsonField(row.key_findings ?? row.keyFindings, defaultKeyFindings),
  };
}
