
import { Injectable } from '@nestjs/common';

export interface ExternalTransactionRequest {
  amount: number;
  toAddress: string;
  description: string;
  provider: string;
}

export interface ExternalTransactionResponse {
  success: boolean;
  transactionId: string;
  externalReference: string;
  message?: string;
}

@Injectable()
export class ExternalPaymentProvider {
  async processExternalTransfer(request: ExternalTransactionRequest): Promise<ExternalTransactionResponse> {

    await this.simulateNetworkDelay();


    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        transactionId: this.generateTransactionId(),
        externalReference: `EXT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Transaction processed successfully',
      };
    } else {
      return {
        success: false,
        transactionId: '',
        externalReference: '',
        message: 'External provider temporarily unavailable',
      };
    }
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 2000 + 500; // 500ms a 2.5s
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}