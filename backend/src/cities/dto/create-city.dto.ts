import { IsString, IsOptional } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;
}