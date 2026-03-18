const bcrypt = require("bcryptjs");

(async () => {
  const hash = "$2b$10$lEYr5bzQc/IfrbRi72.mbuun8kqEIq3Zaszi3mWC9binKzkBpVl4K";

  const passwordsToTry = [
    "Admin@123",
    "admin123",
    "password",
    "123456",
    "admin1",
  ];

  for (const pwd of passwordsToTry) {
    const match = await bcrypt.compare(pwd, hash);
    console.log(pwd, "=>", match);
  }
})();
