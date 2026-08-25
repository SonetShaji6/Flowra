# Flowra — API Documentation

This document outlines the implemented REST API endpoints for Flowra.

---

## Base URL
`http://localhost:5001/api`

---

## 1. Authentication (`/api/auth`)

### Register User
* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Auth:** No
* **Body:** `{ "name": "...", "email": "...", "password": "...", "role": "..." }`
* **Success:** `201 Created`

### Login User
* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Auth:** No
* **Body:** `{ "email": "...", "password": "..." }`
* **Success:** `200 OK`

### Logout User
* **Method:** `POST`
* **Endpoint:** `/api/auth/logout`
* **Auth:** Yes
* **Success:** `200 OK`

### Current User
* **Method:** `GET`
* **Endpoint:** `/api/auth/me`
* **Auth:** Yes
* **Success:** `200 OK`

---

## 2. Users (`/api/users`)

### Get Own Profile
* **Method:** `GET`
* **Endpoint:** `/api/users/me`
* **Auth:** Yes

### Update Profile
* **Method:** `PATCH`
* **Endpoint:** `/api/users/me`
* **Auth:** Yes

### Change Password
* **Method:** `PATCH`
* **Endpoint:** `/api/users/me/password`
* **Auth:** Yes

### Get All Users (Admin)
* **Method:** `GET`
* **Endpoint:** `/api/users`
* **Auth:** Yes, Role: `ADMIN`

### Get User (Admin)
* **Method:** `GET`
* **Endpoint:** `/api/users/:id`
* **Auth:** Yes, Role: `ADMIN`

### Change Status (Admin)
* **Method:** `PATCH`
* **Endpoint:** `/api/users/:id/status`
* **Auth:** Yes, Role: `ADMIN`

### Change Role (Admin)
* **Method:** `PATCH`
* **Endpoint:** `/api/users/:id/role`
* **Auth:** Yes, Role: `ADMIN`

---

## 3. Other Modules
Projects, Tasks, Comments, Activities, Notifications, AI, Analytics and Admin health check routes are initialized as scaffolding with basic success responses.
