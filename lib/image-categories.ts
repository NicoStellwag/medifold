export enum DietSubcategory {
  Receipts = "receipts",
  FoodImages = "food_images",
}

export enum HealthSubcategory {
  PatientRecords = "patient_records",
  DiagnosticReports = "diagnostic_reports",
  Prescriptions = "prescriptions",
  SurgicalDocuments = "surgical_documents",
  Other = "other",
}

export enum TopLevelCategory {
  Diet = "diet",
  Selfies = "selfies",
  Health = "health",
}

export type ImageCategory =
  | { category: TopLevelCategory.Diet; subcategory: DietSubcategory }
  | { category: TopLevelCategory.Selfies; subcategory: null } // Selfies have no subcategory
  | { category: TopLevelCategory.Health; subcategory: HealthSubcategory };

// Helper function to get all categories for prompting the LLM
export function getCategoryDescriptions(): string {
  return `
Categories and Subcategories:
- diet
  - receipts
  - food_images
- selfies (no subcategory)
- health
  - patient_records
  - diagnostic_reports
  - prescriptions
  - surgical_documents
  - other
`;
}
