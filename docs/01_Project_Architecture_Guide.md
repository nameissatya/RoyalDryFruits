 # KiranaFlow Project Architecture Guide

## 1. Project Creation Approach

KiranaFlow is built using a real-world enterprise application structure instead of a simple Web API project.

The goal is:

* Keep business logic separate from database logic
* Make the application easy to maintain
* Allow future scaling
* Follow industry-standard practices

We are using:

* Clean Architecture
* Repository Pattern
* Dependency Injection
* Entity Framework Core
* PostgreSQL
* JWT Authentication

---

# 2. Initial Project Structure

The project was created with this structure:

```
KiranaFlow
│
├── docs
│
├── backend
│
├── frontend
│
└── database
```

---

# 3. Folder Purpose

## docs

Purpose:

Documentation related files.

Contains:

* Architecture decisions
* Database design
* API documentation
* Development notes

Why?

Because code explains **how**, but documentation explains **why**.

---

## backend

Contains complete backend application.

Inside backend:

```
backend

└── src

    ├── KiranaFlow.API
    ├── KiranaFlow.Application
    ├── KiranaFlow.Domain
    └── KiranaFlow.Infrastructure
```

---

# 4. Clean Architecture

Clean Architecture divides the application into layers.

The main idea:

Each layer has a specific responsibility.

Dependency should move inward.

```
API
 |
 ↓
Application
 |
 ↓
Domain


Infrastructure
 |
 ↓
Application + Domain
```

---

# 5. KiranaFlow.Domain

Project:

```
KiranaFlow.Domain
```

Purpose:

This is the core of the application.

It contains business objects.

Example:

```
Entities

User
Category
Product
Order
Quote
```

and:

```
Enums

UserRole
OrderStatus
PaymentStatus
```

---

## What Domain does NOT contain?

Domain should not know about:

* Database
* Entity Framework
* API
* Controllers
* External services

Example:

Wrong:

```
User Entity
 |
 |
 Database Query
```

Correct:

```
User Entity
 |
 |
 Business Rules only
```

---

# 6. KiranaFlow.Application

Project:

```
KiranaFlow.Application
```

Purpose:

This layer contains application business logic.

It defines:

* What the application should do
* Required operations
* Data transfer objects
* Interfaces

Contains:

```
DTOs

Interfaces

Features

Validators
```

---

## DTOs

DTO means Data Transfer Object.

Purpose:

Transfer data between API and application.

Example:

User registration:

Client sends:

```
RegisterRequest

FirstName
LastName
Email
Password
```

We don't directly expose database entity.

Why?

Security and separation.

---

## Interfaces

Interfaces define contracts.

Example:

```
IUserRepository
```

Means:

"Any user repository must provide these operations."

Application does not care how data is stored.

---

# 7. KiranaFlow.Infrastructure

Project:

```
KiranaFlow.Infrastructure
```

Purpose:

This layer handles technical implementations.

Contains:

```
Persistence

Repositories

Services

Migrations
```

---

## Persistence

Contains:

```
ApplicationDbContext
```

Purpose:

Connection between application and database.

Flow:

```
ApplicationDbContext

        |

        ↓

PostgreSQL
```

---

## Repositories

Example:

```
UserRepository
```

Purpose:

Database operations.

Example:

```
Get User
Save User
Update User
Delete User
```

Application talks through:

```
IUserRepository
```

Infrastructure implements:

```
UserRepository
```

---

# 8. KiranaFlow.API

Project:

```
KiranaFlow.API
```

Purpose:

This is the entry point of the application.

Contains:

```
Controllers

Middleware

Configurations

Extensions
```

---

## Controllers

Controllers handle HTTP requests.

Example:

```
POST /api/auth/register
```

Controller responsibility:

* Receive request
* Call application service
* Return response

Controller should NOT contain:

* Database queries
* Business rules

---

# 9. Why Separate Projects?

Without separation:

```
Controller

 |
 |
Database Code

 |
 |
Business Logic
```

Everything becomes mixed.

Problems:

* Difficult testing
* Difficult maintenance
* Hard to scale

With Clean Architecture:

```
Controller

↓

Application Logic

↓

Repository

↓

Database
```

Every part has a clear responsibility.

---

# 10. Database Setup

Database used:

```
PostgreSQL
```

Entity Framework Core is used for database communication.

Flow:

```
Entity

↓

DbContext

↓

Migration

↓

Database Table
```

---

# 11. EF Core Migration Purpose

Migration tracks database changes.

Example:

Adding User table:

```
User Entity

↓

Migration

↓

Users Table Created
```

Commands:

Create migration:

```
dotnet ef migrations add InitialCreate
```

Apply database changes:

```
dotnet ef database update
```

---

# 12. Authentication Architecture

Authentication module structure:

```
Application

Features

└── Authentication

    ├── DTOs
    ├── Commands
    └── Validators
```

---

Flow:

```
User

↓

AuthController

↓

AuthService

↓

UserRepository

↓

Database
```

---

# 13. Password Security

Passwords are never stored directly.

Wrong:

```
Password = MyPassword123
```

Correct:

```
PasswordHash = BCrypt Hash
```

During login:

```
Entered Password

↓

BCrypt Verify

↓

Allow / Reject
```

---

# 14. JWT Authentication

JWT is used for user identity.

Login flow:

```
Email + Password

↓

Validate User

↓

Generate JWT Token

↓

Client Stores Token

↓

Send Token With Requests
```

Example:

```
Authorization:

Bearer <token>
```

---

# 15. Dependency Injection

Dependency Injection connects implementations.

Example:

Interface:

```
IUserRepository
```

Implementation:

```
UserRepository
```

Registration:

```
IUserRepository
        |
        ↓
UserRepository
```

Benefits:

* Loose coupling
* Easy testing
* Cleaner code

---

# 16. Adding New Modules

Every new feature follows the same pattern.

Example: Category Module

Domain:

```
Category Entity
```

Application:

```
Category DTOs
Category Interfaces
Category Services
```

Infrastructure:

```
Category Repository
```

API:

```
CategoriesController
```

---

# 17. Development Rule

For every module:

1. Create Domain Entity
2. Create Database Migration
3. Create Application DTOs
4. Create Interfaces
5. Create Infrastructure Implementation
6. Create API Controller
7. Test using Scalar

---

# Current Project Progress

Completed:

```
✅ Solution Setup
✅ Clean Architecture
✅ PostgreSQL Setup
✅ EF Core Setup
✅ User Entity
✅ Repository Pattern
✅ Authentication
✅ JWT Security
```

Next:

```
Categories Module
```

---

# Final Architecture Flow

```
Client

↓

API Controller

↓

Application Layer

↓

Infrastructure Layer

↓

Database

```

This structure allows KiranaFlow to grow into a complete production application.

