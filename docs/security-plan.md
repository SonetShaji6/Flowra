# Flowra — Security Plan

This document details the security architecture, data protection strategies, and vulnerability mitigation plans for Flowra.

---

## 1. Authentication & Authorization

### JWT Strategy
* **Transport:** JWT tokens are issued upon login and stored in `HttpOnly`, `SameSite=Strict`, and `Secure` (production only) cookies. This prevents client-side scripts from accessing the token (mitigating XSS) and ensures tokens are only sent over HTTPS.
* **Expiration:** 
  * Access Tokens: Short-lived (e.g., 1 hour).
  * Refresh Tokens: Stored in a dedicated MongoDB collection with a 7-day TTL (Time-To-Live).
* **Payload:** The JWT contains the `userId` and `role`. It does **not** contain sensitive information like passwords or email addresses.

### Role-Based Access Control (RBAC)
* **Backend Middleware:** Every protected route is wrapped in an `auth` middleware that verifies the JWT. Role-specific routes (e.g., Admin console) are wrapped in an additional `authorize('ADMIN')` middleware.
* **Frontend Guards:** React Router guards prevent non-authenticated users from viewing the Dashboard and prevent Team Members from accessing the Admin UI.

---

## 2. Data Protection

### Password Hashing
* **Algorithm:** `bcryptjs`.
* **Salt Rounds:** 12.
* **Implementation:** Handled via Mongoose `pre-save` hooks. Passwords are never stored in plaintext and are excluded from default JSON queries (`select: false`).

### Input Validation & Sanitization
* **Validation:** All incoming API request bodies are validated against **Zod** schemas. Requests failing validation are rejected with a `400 Bad Request` and descriptive error messages.
* **Sanitization:** `mongo-sanitize` is used to prevent NoSQL injection attacks. `helmet` middleware is used to set security-focused HTTP headers.

---

## 3. Infrastructure Security

### AI API Secret Management
* **Strict Backend Isolation:** The AI API Key (OpenAI/DeepSeek) resides exclusively on the Render/Backend environment variables.
* **No Frontend Exposure:** The frontend never makes direct calls to the LLM provider. It communicates with `/api/ai`, which acts as a secure proxy, scrubbing any identifying keys before transmission.

### API Rate Limiting
* **General API:** 100 requests per 15 minutes per IP.
* **Auth Routes:** Strictly limited to 5 login/register attempts per minute to prevent brute-force attacks.

### Environment Variables
* A `.env.example` is provided in the repository. The real `.env` is listed in `.gitignore` and is manually configured on the CI/CD platform (Vercel/Render).

---

## 4. Error Handling & Information Leakage

* **Production Mode:** Detailed error stacks are suppressed in production. Users receive generic messages (e.g., *"An internal server error occurred"*), while detailed logs are captured on the server for developer auditing.
* **No User Enumeration:** Authentication failure messages are generic (*"Invalid email or password"*) to prevent attackers from verifying the existence of specific email addresses in the database.
