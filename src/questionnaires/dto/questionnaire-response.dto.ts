export class QuestionResponseDto {
  id: string;
  text: string;
  type: string;
  options?: string[];
  isRequired: boolean;
  order: number;
  helpText?: string;
}

export class QuestionnaireResponseDto {
  id: string;
  title: string;
  description?: string;
  questions: QuestionResponseDto[];
}