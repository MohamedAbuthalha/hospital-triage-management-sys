
require("dotenv").config();
const validateEnv = require("./src/config/validateEnv");
const app = require("./src/app");
const connectDB = require("./src/config/db");

validateEnv();

const PORT = process.env.PORT || 5000;

// CONNECT DATABASE (THIS MUST RUN)
connectDB();

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});

