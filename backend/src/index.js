import "dotenv/config";
import { createApp } from "./app.js";

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`QuickMove backend listening on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set — AI parse/draft endpoints will return 503 until it is.");
  }
});
