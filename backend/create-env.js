const fs = require("node:fs");

const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Apple@1663
DB_NAME=project_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=f3dc9ebdd2b8eaa6d2274bdcc8f14e8b4938e3f776fa4b6f782e0a7c93286e72
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=4000

# Environment
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
`;

fs.writeFileSync(".env", envContent, "utf8");
console.log("✅ Clean .env file created successfully!");

// Verify it works
require("dotenv").config();
console.log("Database config loaded:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");
