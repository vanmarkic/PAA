# Security Best Practices

This document outlines essential security practices for authentication, authorization, secrets management, and dependency safety. These recommendations help protect user data and ensure a stable backend system.

---

## 1. Authentication
Authentication verifies the identity of a user before granting access.

### Recommended Practices
- Hash passwords using bcrypt or argon2 (never store plain-text passwords)
- Use JWTs or session tokens with reasonable expiry times
- Regenerate tokens on sensitive actions (password change, role update)
- Implement login rate limiting to prevent brute-force attacks
- Always validate and sanitize request payloads

---

## 2. Authorization
Authorization determines what actions an authenticated user is allowed to perform.

### Recommended Practices
- Use role-based or permission-based access control
- Protect admin routes with strict authorization checks
- Validate ownership for update/delete operations (e.g., verify userId in DB)
- Avoid exposing sensitive internal IDs when unnecessary
- Log unauthorized access attempts

---

## 3. Secrets Management (`dotenv`)
Secrets include API keys, database credentials, and JWT secrets.

### Recommended Practices
- Store all secrets in a `.env` file (never commit `.env` to Git)
- Add `.env` to `.gitignore` (already done in this project)
- Keep `.env.example` updated with non-sensitive placeholder values
- Use environment variables in production (not local `.env`)
- Rotate keys if they are ever exposed
- Use different secrets for development, staging, and production

Example `.env` values:
```bash
DATABASE_URL=<your-db-url>
JWT_SECRET=<your-secret-key>
API_KEY=<third-party-api-key>
```

---

## 4. Dependency Security
Dependencies can introduce vulnerabilities if not updated or verified.

### Recommended Practices
- Run security scans regularly:
  - `npm audit`
  - `npm audit fix`
- Remove unused or outdated packages
- Prefer well-maintained libraries over unknown ones
- Enable GitHub Dependabot (auto security updates)
- Review changelogs before major version upgrades

---

## 5. General Backend Security Guidelines
- Validate and sanitize all inputs (avoid SQL/NoSQL injection)
- Use HTTPS in production
- Implement proper error handling (never show stack traces publicly)
- Configure CORS securely (only allow required origins)
- Use helmet middleware (for HTTP header protection)
- Log suspicious or repetitive failed actions
- Follow the Principle of Least Privilege for users/services

---

## Summary
This document provides essential guidelines for securing authentication, authorization flows, secret environment variables, and project dependencies. Following these practices improves system safety, reduces attack surface, and maintains stable backend behavior.
