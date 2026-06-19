import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoryType, FaqTargetType } from '@prisma/client';

export class QueryFaqDto {
  @IsOptional()
  @IsEnum(FaqTargetType)
  targetType?: FaqTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsEnum(CategoryType)
  module?: CategoryType;

  @IsOptional()
  @IsString()
  includeUnpublished?: string;
}

export class ResolveFaqDto {
  @IsEnum(FaqTargetType)
  targetType: FaqTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsEnum(CategoryType)
  module?: CategoryType;
}

export class CreateFaqDto {
  @IsEnum(FaqTargetType)
  targetType: FaqTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsEnum(CategoryType)
  module?: CategoryType;

  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateFaqDto {
  @IsOptional()
  @IsEnum(FaqTargetType)
  targetType?: FaqTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsEnum(CategoryType)
  module?: CategoryType;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
