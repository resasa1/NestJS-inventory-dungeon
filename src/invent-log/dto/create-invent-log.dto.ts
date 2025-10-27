import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { LogType } from '../entities/invent-log.entity';

export class CreateLogDto {
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(LogType)
  @IsNotEmpty()
  type: LogType;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reason: string;
}
