// src/wallets/dto/update-wallet.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateWalletDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}