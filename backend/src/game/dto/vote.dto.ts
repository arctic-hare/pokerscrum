import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  value: string;
}
