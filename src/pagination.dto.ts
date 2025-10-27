import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Otomatis ubah string query "1" menjadi number 1
  @IsInt()
  @Min(1)
  page: number = 1; // Default page 1 jika tidak disediakan

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Batasi limit maks 100 per request
  limit: number = 10; // Default limit 10 jika tidak disediakan
}
