import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
