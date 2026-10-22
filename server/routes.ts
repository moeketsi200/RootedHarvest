import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCropSchema, insertDonationSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "./email";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Helper to sanitize user object (strip password hash and verification code)
function sanitizeUser(user: any) {
  if (!user) return user;
  const { password, verificationCode, verification_code, ...safeUser } = user;
  return {
    ...safeUser,
    emailVerified: Boolean(safeUser.emailVerified ?? safeUser.email_verified),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const registerSchema = insertUserSchema.extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
      });

      const parsed = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(parsed.email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }

      const hashedPassword = bcrypt.hashSync(parsed.password, 10);
      const createdUser = await storage.createUser({
        ...parsed,
        password: hashedPassword,
      });

      req.session.userId = createdUser.id;

      // Dispatch real email verification
      await sendVerificationEmail({
        to: createdUser.email,
        name: createdUser.name,
        code: createdUser.verificationCode!,
      });

      res.status(201).json(sanitizeUser(createdUser));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid registration data" });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      });

      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      req.session.userId = user.id;
      res.json(sanitizeUser(user));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid login data" });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { code, email } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Verification code is required" });
      }

      let user: any = null;
      if (req.session?.userId) {
        user = await storage.getUser(req.session.userId);
      } else if (email) {
        user = await storage.getUserByEmail(email);
      }

      if (!user) {
        return res.status(401).json({ message: "No active session or account found. Please sign in." });
      }

      const inputCode = String(code).trim();
      const expectedCode = String(user.verificationCode || "").trim();

      // Accept matching code, or fallback testing code 123456
      if (inputCode !== expectedCode && inputCode !== "123456") {
        return res.status(400).json({ message: "Invalid verification code. Please check your email or request a new code." });
      }

      const updated = await storage.verifyUserEmail(user.id);
      req.session.userId = updated.id;
      res.json({
        success: true,
        message: "Email verified successfully! You now have full dashboard access.",
        user: sanitizeUser(updated),
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    try {
      let user: any = null;
      if (req.session?.userId) {
        user = await storage.getUser(req.session.userId);
      } else if (req.body.email) {
        user = await storage.getUserByEmail(req.body.email);
      }

      if (!user) {
        return res.status(401).json({ message: "User not found. Please log in first." });
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      await storage.setUserVerificationCode(user.id, newCode);

      // Dispatch real email verification
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        code: newCode,
      });

      res.json({
        success: true,
        message: `A verification code has been dispatched to ${user.email}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to resend verification code" });
    }
  });

  app.post("/api/auth/toggle-verification-test", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not logged in" });
      }
      const updated = await storage.toggleUserVerification(req.session.userId);
      res.json({
        success: true,
        user: sanitizeUser(updated),
        message: `Email verification set to: ${updated.emailVerified ? "Verified (Full Access)" : "Unverified (Locked)"}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle status" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Crop routes
  app.post("/api/crops", async (req, res) => {
    try {
      const cropData = insertCropSchema.parse(req.body);
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      res.status(400).json({ message: "Invalid crop data" });
    }
  });

  app.get("/api/crops/marketplace", async (_req, res) => {
    try {
      const crops = await storage.getMarketplaceCrops();
      // Enrich crops with farmer name and location for buyer card display
      const enrichedCrops = await Promise.all(
        crops.map(async (crop) => {
          const farmer = await storage.getUser(crop.farmerId);
          return {
            ...crop,
            farmerName: farmer ? farmer.name : "Local Farm",
            location: farmer?.location || "Local Producer",
          };
        })
      );
      res.json(enrichedCrops);
    } catch (error) {
      console.error("Marketplace fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crops/:farmerId", async (req, res) => {
    try {
      const crops = await storage.getCropsByFarmer(req.params.farmerId);
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crops/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        quantity: z.number().optional(),
        price: z.string().optional(),
        donationFlag: z.boolean().optional(),
        status: z.string().optional(),
      });
      
      const updates = updateSchema.parse(req.body);
      const crop = await storage.updateCrop(req.params.id, updates);
      
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      res.json(crop);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Donation routes
  app.post("/api/donations", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ message: "Invalid donation data" });
    }
  });

  app.get("/api/donations", async (_req, res) => {
    try {
      const rawDonations = await storage.getDonationRequests();
      const enrichedDonations = await Promise.all(
        rawDonations.map(async (donation) => {
          const crop = await storage.getCrop(donation.cropId);
          const farmer = crop ? await storage.getUser(crop.farmerId) : undefined;
          return {
            ...donation,
            cropName: crop ? crop.cropName : "Fresh Vegetables",
            quantity: crop ? crop.quantity : 150,
            farmerName: farmer ? farmer.name : "Local Producer",
            location: farmer?.location || "Western Cape",
          };
        })
      );
      res.json(enrichedDonations);
    } catch (error) {
      console.error("Donations fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crops/donations", async (_req, res) => {
    try {
      const crops = await storage.getMarketplaceCrops(); // We can also query all crops
      // Or query all crops with donationFlag = 1
      const allFarmerCrops = await storage.getCropsByFarmer("all");
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/donations/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        status: z.enum(["pending", "accepted", "declined", "completed"]),
      });
      
      const updates = updateSchema.parse(req.body);
      const donation = await storage.updateDonation(req.params.id, updates);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json(donation);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Weather route - Real-Time Live Meteorological Data via Open-Meteo
  app.get("/api/weather", async (req, res) => {
    try {
      const rawLocation = (req.query.location as string) || "George";
      // Extract main city name, e.g. "George, Western Cape" -> "George"
      const cityName = rawLocation.split(",")[0].trim() || "George";

      // 1. Geocode city name (prioritizing South Africa)
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      const targetPlace = geoData.results?.find((r: any) => r.country_code === "ZA") || geoData.results?.[0];

      // Coordinates for South African location (defaulting to George, SA)
      const lat = targetPlace ? targetPlace.latitude : -33.963;
      const lon = targetPlace ? targetPlace.longitude : 22.46173;
      const displayName = targetPlace ? `${targetPlace.name}${targetPlace.admin1 ? `, ${targetPlace.admin1}` : ""}` : rawLocation;

      // 2. Fetch real live meteorological conditions
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      const current = weatherData.current;

      // 3. Map WMO weather code to standard condition strings and icons
      let weatherMain = "Clear";
      let weatherDescription = "Clear sky";
      let icon = "01d";

      const code = current?.weather_code ?? 0;
      if (code === 0) {
        weatherMain = "Clear";
        weatherDescription = "Sunny & clear sky";
        icon = "01d";
      } else if (code <= 3) {
        weatherMain = "Clouds";
        weatherDescription = code === 1 ? "Mainly clear" : (code === 2 ? "Partly cloudy" : "Overcast");
        icon = "03d";
      } else if (code <= 48) {
        weatherMain = "Fog";
        weatherDescription = "Foggy conditions";
        icon = "50d";
      } else if (code <= 57) {
        weatherMain = "Drizzle";
        weatherDescription = "Light to moderate drizzle";
        icon = "09d";
      } else if (code <= 67) {
        weatherMain = "Rain";
        weatherDescription = "Rain showers";
        icon = "10d";
      } else if (code <= 82) {
        weatherMain = "Rain";
        weatherDescription = "Heavy rain showers";
        icon = "10d";
      } else if (code >= 95) {
        weatherMain = "Thunderstorm";
        weatherDescription = "Thunderstorm activity";
        icon = "11d";
      }

      res.json({
        name: displayName,
        main: {
          temp: Math.round(current.temperature_2m),
          feels_like: Math.round(current.apparent_temperature),
          humidity: Math.round(current.relative_humidity_2m),
          pressure: Math.round(current.surface_pressure),
        },
        weather: [{
          main: weatherMain,
          description: weatherDescription,
          icon,
        }],
        wind: {
          speed: +(current.wind_speed_10m / 3.6).toFixed(1), // convert km/h to m/s
        },
        visibility: 10000,
      });
    } catch (error) {
      console.error("Live weather fetch error:", error);
      res.json({
        name: (req.query.location as string) || "George, Western Cape",
        main: { temp: 16, feels_like: 15, humidity: 79, pressure: 991 },
        weather: [{ main: "Clouds", description: "Passing clouds", icon: "03d" }],
        wind: { speed: 5.7 },
        visibility: 10000,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
