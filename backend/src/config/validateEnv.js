const required = ["NODE_ENV", "MONGO_URI", "JWT_SECRET", "PORT"];

function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing.join(", "));
    process.exit(1);
  }

  const nodeEnv = process.env.NODE_ENV;
  if (!["development", "production", "test"].includes(nodeEnv)) {
    console.error(
      "NODE_ENV must be one of development, production, or test. Received:",
      nodeEnv
    );
    process.exit(1);
  }
}

module.exports = validateEnv;
