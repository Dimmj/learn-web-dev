import { database, getSlotsForDay } from "./database.js";

// Задержка ответа — имитирует сеть, чтобы было видно «Загрузка…».
// Поставьте 0, если хотите мгновенные ответы.
const DELAY_MS = 1000;

export default function apiMiddleware() {
  return {
    name: "api-middleware",
    configureServer(server) {
      console.log("API Middleware загружен");

      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith("/api/")) return next();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }

        // GET /api/booking/today → { year, month, day }
        if (req.url === "/api/booking/today") {
          setTimeout(() => {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify(database.today));
          }, DELAY_MS);
          return;
        }

        // GET /api/slots?day=&month=&year= → { date, slots }
        if (req.url.startsWith("/api/slots")) {
          const url = new URL(req.url, "http://localhost");
          const day = parseInt(url.searchParams.get("day"), 10);
          const month = parseInt(url.searchParams.get("month"), 10);
          const year = parseInt(url.searchParams.get("year"), 10);

          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ error: "Не указаны day, month, year" })
            );
            return;
          }

          const slots = getSlotsForDay(day);
          setTimeout(() => {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify({ date: { day, month, year }, slots }));
          }, DELAY_MS);
          return;
        }

        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: `API endpoint not found: ${req.url}` }));
      });
    },
  };
}