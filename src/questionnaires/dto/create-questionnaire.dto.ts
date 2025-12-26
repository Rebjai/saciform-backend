import { IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../../common/enums';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean = false;

  @IsOptional()
  @IsString()
  helpText?: string;
}

export class CreateQuestionnaireDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}