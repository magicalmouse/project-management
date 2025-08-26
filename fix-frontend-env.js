const fs = require("node:fs");

console.log("Fixing frontend .env file...");

// Read current .env file
let envContent = fs.readFileSync(".env", "utf8");

// Replace the API base URL to point to backend server
envContent = envContent.replace("VITE_APP_API_BASE_URL = /api", "VITE_APP_API_BASE_URL = http://localhost:4000/api");

// Write the updated content
fs.writeFileSync(".env", envContent, "utf8");

console.log("✅ Frontend .env file updated!");
console.log("✅ API calls will now go to http://localhost:4000/api");
console.log("");
console.log("🔧 Changes made:");
console.log("   VITE_APP_API_BASE_URL = http://localhost:4000/api");
console.log("");
console.log("🚀 Now restart your frontend (Ctrl+C and npm run dev) to apply changes!");
