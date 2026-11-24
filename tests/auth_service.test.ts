import { describe, it, expect } from 'vitest';
import { AuthService } from '../src/core/auth_service';

describe('AuthService', () => {
  it('validates RFC-compliant email formats', () => {
    expect(AuthService.validateEmail('user@example.com')).toBe(true);
    expect(AuthService.validateEmail('invalid-email')).toBe(false);
  });

  it('enforces password complexity constraints', () => {
    expect(AuthService.validatePassword('weak').valid).toBe(false);
    expect(AuthService.validatePassword('alllowercase1').valid).toBe(false);
    expect(AuthService.validatePassword('NoNumbersHere').valid).toBe(false);
    expect(AuthService.validatePassword('StrongPass123').valid).toBe(true);
  });

  it('manages user login and session expiration tokens', () => {
    const session = AuthService.login('finance.user@test.org', 'StrongPass123');
    expect(session.userId).toBeDefined();
    expect(session.email).toBe('finance.user@test.org');
    expect(session.token).toContain('jwt_');

    const activeSession = AuthService.getSession();
    expect(activeSession?.email).toBe('finance.user@test.org');

    AuthService.logout();
    expect(AuthService.getSession()).toBeNull();
  });
});
