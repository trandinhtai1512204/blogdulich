import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType } from './create-category.dto';

export class QueryCategoriesDto {
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

