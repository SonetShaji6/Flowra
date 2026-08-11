# Flowra — Week 2 API Test Report

This report documents the backend verification status for the Week 2 scope. Some checks are validated through Jest unit tests and route-level logic, while live Postman-driven verification remains pending in an environment with a running MongoDB instance.

| Endpoint | Method | Authentication | Expected Result | Actual Result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| /api/health | GET | No | 200 OK | 200 OK when app is running | PASS | N/A |
| /api/auth/register | POST | No | 201 Created | Verified by validation logic, DB runtime pending | PASS (logic) | local unit tests |
| /api/auth/login | POST | No | 200 OK + JWT | Verified by password + validation logic | PASS (logic) | local unit tests |
| /api/auth/logout | POST | Yes | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/auth/me | GET | Yes | 200 OK + safe user info | Implementation present | PENDING | Not executed in live environment |
| /api/users/me | GET | Yes | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/users/me | PATCH | Yes | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/users/me/password | PATCH | Yes | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/users | GET | Yes, ADMIN | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/users/:id | GET | Yes, ADMIN | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/users/:id/status | PATCH | Yes, ADMIN | 200 OK | Implementation present | PENDING | Not executed in live environment |
| /api/users/:id/role | PATCH | Yes, ADMIN | 200 OK | Implementation present | PENDING | Not executed in live environment |

## Verification Notes

- Lint: PASS
- Jest tests: PASS (2 suites, 4 tests)
- Live DB and Postman collection verification: PENDING due to environment constraints

## Evidence

- Jest test output was generated in the backend workspace.
- No real screenshot evidence was created in this environment to avoid fabricating results.
- The collection and environment files are available at `evidence/week2/` for import into Postman when a live backend session is running.
