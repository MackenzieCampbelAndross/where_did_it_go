import { describe, it, expect } from 'vitest';
import { ReceiptStore } from '../src/core/receipt_store';

describe('ReceiptStore', () => {
  it('validates supported receipt mime types and sizes', () => {
    const valid = ReceiptStore.validateReceipt('receipt.jpg', 'image/jpeg', 1024 * 500);
    expect(valid.valid).toBe(true);

    const tooBig = ReceiptStore.validateReceipt('large_doc.pdf', 'application/pdf', 10 * 1024 * 1024);
    expect(tooBig.valid).toBe(false);
    expect(tooBig.reason).toContain('exceeds maximum allowed 5MB');

    const badMime = ReceiptStore.validateReceipt('malicious.exe', 'application/x-msdownload', 1024);
    expect(badMime.valid).toBe(false);
    expect(badMime.reason).toContain('is not supported');
  });

  it('creates attachment entity with generated unique ID and timestamps', () => {
    const attachment = ReceiptStore.createAttachment('coffee.png', 'image/png', 2048, 'data:image/png;base64,iVBORw0KGgo=');
    expect(attachment.id).toBeDefined();
    expect(attachment.fileName).toBe('coffee.png');
    expect(attachment.dataBase64).toContain('data:image/png;base64');
  });
});
