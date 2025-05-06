# 🛠️ Node.js Express TypeScript Boilerplate

A scalable and well-structured boilerplate for building robust RESTful APIs using **Node.js**, **Express**, and **TypeScript**.

This template is pre-configured with essential tools and libraries to streamline your development workflow, improve code quality, and handle common server-side concerns out of the box.

---

## ✨ Features

- **Express.js** – Fast, unopinionated, minimalist web framework
- **TypeScript** – Type-safe JavaScript for large-scale applications
- **Winston** – Powerful logging system
- **Winston Daily Rotate File** – Automatically rotate and delete logs
- **Prettier** – Opinionated code formatter
- **ESLint** – Linter for catching errors and enforcing style
- **CORS** – Enable Cross-Origin Resource Sharing
- **jsonwebtoken** – JWT authentication support
- **http-status** – Predefined HTTP status codes
- **Zod** – Type-safe schema validation

---

## 📁 Folder Structure

```plaintext
├── src
│   ├── config
│   │   ├── config.ts
│   │   └── logger.ts
│   ├── controllers
│   │   └── userController.ts
│   ├── middlewares
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── models
│   │   └── userModel.ts
│   ├── routes
│   │   └── userRoutes.ts
│   ├── services
│   │   └── userService.ts
│   ├── utils
│   │   └── response.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .gitignore
├── README.md
└── yarn.lock
```

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone
    cd node-express-typescript-boilerplate
   ```
2. **Install dependencies**
   ```bash
   yarn install
   ```
3. **Create a `.env` file**
   ```bash
   cp .env.example .env
   ```
4. **Update the `.env` file** with your environment variables.
5. **Run the application**
   ```bash
   yarn dev
   ```
6. **Build the application**
   ```bash
   yarn build
   ```
7. **Run the built application**
   ```bash
   yarn start
   ```
8. **Run tests**
   ```bash
   yarn test
   ```
9. **Run linting**
   ```bash
   yarn lint
   ```
10. **Run formatting**
    ```bash
    yarn format
    ```

## Author

# Nahid Ahmed

# Frontend Developer at Hishabee Technologies Ltd.

Currently working on POS and eCommerce platforms using modern web technologies like React, Node.js, Next.js, and TypeScript.
Passionate about clean architecture, scalable systems, and performance optimization.
Always exploring ways to improve developer experience and code quality.
"# typescript-express-starter" 
"# typescript-express-starter" 
