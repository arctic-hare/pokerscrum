import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  nickname: string;
}
