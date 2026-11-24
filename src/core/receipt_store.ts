/**
 * Receipt attachment and binary metadata manager for Where Did It Go.
 */

import { ReceiptAttachment } from '../types';

export class ReceiptStore {
  private static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes
  private static ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  static validateReceipt(fileName: string, mimeType: string, sizeBytes: number): { valid: boolean; reason?: string } {
    if (!fileName || !fileName.trim()) {
      return { valid: false, reason: 'File name is required.' };
    }
    if (sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      return { valid: false, reason: `File size (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed 5MB.` };
    }

    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return { valid: false, reason: `MIME type '${mimeType}' is not supported. Use JPG, PNG, WEBP, or PDF.` };
    }

    return { valid: true };
  }

  static createAttachment(
    fileName: string,
    mimeType: string,
    fileSizeBytes: number,
    base64Data?: string
  ): ReceiptAttachment {
    const validation = this.validateReceipt(fileName, mimeType, fileSizeBytes);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid receipt attachment');
    }

    return {
      id: `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fileName,
      mimeType,
      fileSizeBytes,
      dataBase64: base64Data,
      uploadedAt: new Date().toISOString()
    };
  }
}
