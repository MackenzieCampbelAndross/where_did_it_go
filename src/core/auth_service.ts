/**
 * User authentication and credential validation service for Where Did It Go.
 */

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  currency: string;
  token: string;
  expiresAt: number;
}

export class AuthService {
  private static SESSION_KEY = 'wherediditgo_auth_session_v1';
  private static inMemorySession: UserSession | null = null;

  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static validatePassword(pwd: string): { valid: boolean; reason?: string } {
    if (!pwd || pwd.length < 8) {
      return { valid: false, reason: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, reason: 'Password must contain at least one number.' };
    }
    return { valid: true };
  }

  static login(email: string, passwordHash: string): UserSession {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format.');
    }
    if (!passwordHash) {
      throw new Error('Password credentials required.');
    }

    const session: UserSession = {
      userId: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email,
      name: email.split('@')[0],
      currency: 'USD',
      token: `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    this.inMemorySession = session;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      } catch {}
    }

    return session;
  }

  static getSession(): UserSession | null {
    if (this.inMemorySession && this.inMemorySession.expiresAt > Date.now()) {
      return this.inMemorySession;
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.SESSION_KEY);
        if (raw) {
          const s: UserSession = JSON.parse(raw);
          if (s.expiresAt > Date.now()) {
            this.inMemorySession = s;
            return s;
          }
        }
      } catch {}
    }

    return null;
  }

  static logout(): void {
    this.inMemorySession = null;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.SESSION_KEY);
      } catch {}
    }
  }
}
