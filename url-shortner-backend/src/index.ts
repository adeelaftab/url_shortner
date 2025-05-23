import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const app = express();
const prisma = new PrismaClient();
dotenv.config();

// Middleware
// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173"], // Frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// URL validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

// Create short URL
app.post("/api/shorten", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const shortCode = nanoid(6);
    const shortUrl = `https://smi.to/${shortCode}`;
    const shortLocalUrl = `http://localhost:4040/${shortCode}`;

    const created = await prisma.url.create({
      data: {
        originalUrl: url,
        shortCode,
      },
    });

    res.json({
      shortUrl,
      shortLocalUrl,
      originalUrl: url,
      shortCode,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ error: "Failed to create short URL" });
  }
});

// Redirect to original URL
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Track the visit
    await prisma.visit.create({
      data: {
        urlId: url.id,
        userAgent: req.headers['user-agent'] || null,
        ip: req.ip || req.socket.remoteAddress || null,
      },
    });

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get URL statistics
app.get("/api/stats/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await prisma.url.findUnique({
      where: { shortCode },
      include: {
        visits: {
          orderBy: {
            createdAt: 'desc'
          }
        },
      },
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json({
      originalUrl: url.originalUrl,
      shortUrl: `https://smi.to/${shortCode}`,
      shortLocalUrl: `http://localhost:4040/${shortCode}`,
      createdAt: url.createdAt,
      totalVisits: url.visits.length,
      visits: url.visits,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
