import { IsString, IsOptional, IsEnum, ValidateIf, Matches } from 'class-validator';

export enum DeckType {
  STANDARD = 'standard',
  SHORT = 'short',
  FIBONACCI = 'fibonacci',
  MODIFIED_FIBONACCI = 'modified_fibonacci',
  TSHIRTS = 'tshirts',
  POWERS_OF_2 = 'powers_of_2',
  CUSTOM = 'custom',
}

export class CreateGameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DeckType)
  @IsOptional()
  deckType?: DeckType;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.deckType === DeckType.CUSTOM)
  @Matches(/^(\d+)(,\s*\d+)*$/, {
    message: 'Custom deck must be comma-separated numbers (e.g., "1,2,3,5,8,13")',
  })
  customDeck?: string;
}
