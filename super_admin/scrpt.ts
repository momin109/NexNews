import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

async function seed() {
  try {
    await connectDB();

    const email = process.env.SEED_ADMIN_EMAIL || "admin@news.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "12345678";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("Super admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
