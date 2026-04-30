import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CategoryType {
  about = 'about',
  destination = 'destination',
  itinerary = 'itinerary',
  cost = 'cost',
  review = 'review',
  experience = 'experience',
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsString()
  cityId?: string | null;

  @IsOptional()
  @IsString()
  parentId?: string | null;
}

