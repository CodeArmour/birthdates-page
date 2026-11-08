export interface StudentBirthday {
  id: string;
  name: string;
  birthDate: string;
  className?: string;
  message?: string;
}

export interface CsvRowError {
  row: number;
  message: string;
}

export interface CsvImportResult {
  accepted: StudentBirthday[];
  rejected: CsvRowError[];
}
