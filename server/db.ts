import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, properties, developers, favorites, inquiries, priceHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Projects
export async function listProjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getProjectsByDeveloper(developerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.developerId, developerId));
}

// Properties
export async function listProperties(
  listingType: "buy" | "rent",
  filters?: {
    priceMin?: number;
    priceMax?: number;
    location?: string;
    apartmentType?: string;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(properties.listingType, listingType)];

  if (filters?.priceMin !== undefined) {
    conditions.push(gte(properties.price, String(filters.priceMin)));
  }
  if (filters?.priceMax !== undefined) {
    conditions.push(lte(properties.price, String(filters.priceMax)));
  }
  if (filters?.location) {
    conditions.push(eq(properties.location, filters.location));
  }
  if (filters?.apartmentType) {
    conditions.push(eq(properties.type, filters.apartmentType));
  }

  return await db.select().from(properties).where(and(...conditions));
}

// Developers
export async function listDevelopers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(developers).orderBy(desc(developers.createdAt));
}

export async function getDeveloperById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(developers).where(eq(developers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Favorites
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const favs = await db
    .select({ projectId: favorites.projectId })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  if (favs.length === 0) return [];

  const projectIds = favs.map(f => f.projectId);
  if (projectIds.length === 0) return [];
  
  // Fetch all projects that are in the favorites list
  return await db.select().from(projects).where(
    eq(projects.id, projectIds[0])
  );
}

export async function addFavorite(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(favorites).values({
    userId,
    projectId,
  });
}

export async function removeFavorite(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(favorites).where(
    and(
      eq(favorites.userId, userId),
      eq(favorites.projectId, projectId)
    )
  );
}

// Inquiries
export async function submitDeveloperContact(data: {
  developerId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(inquiries).values({
    developerId: data.developerId,
    inquiryType: "contact",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
  });
}

export async function submitProjectInquiry(data: {
  userId: number;
  projectId: number;
  inquiryType: "interest" | "information";
  message?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(inquiries).values({
    projectId: data.projectId,
    userId: data.userId,
    inquiryType: data.inquiryType,
    message: data.message,
  });
}

// Price History
export async function getPriceHistory(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.projectId, projectId))
    .orderBy(desc(priceHistory.recordedAt));
}

export async function recordPriceHistory(projectId: number, pricePerM2: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(priceHistory).values({
    projectId,
    pricePerM2: String(pricePerM2) as any,
  });
}

// Project Management (Admin)
export async function createProject(data: {
  name: string;
  description?: string;
  location: string;
  latitude: number;
  longitude: number;
  constructionProgress: number;
  pricePerM2: number;
  totalArea?: number;
  expectedDeliveryDate?: string;
  developerId: number;
  images: string[];
}) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(projects).values({
    name: data.name,
    description: data.description,
    location: data.location,
    latitude: String(data.latitude) as any,
    longitude: String(data.longitude) as any,
    constructionProgress: data.constructionProgress,
    pricePerM2: String(data.pricePerM2) as any,
    totalArea: data.totalArea ? String(data.totalArea) as any : undefined,
    expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
    developerId: data.developerId,
    images: data.images,
  });

  return result;
}

export async function updateProject(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    constructionProgress: number;
    pricePerM2: number;
    totalArea: number;
    expectedDeliveryDate: string;
    developerId: number;
    images: string[];
  }>
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.latitude !== undefined) updateData.latitude = String(data.latitude);
  if (data.longitude !== undefined) updateData.longitude = String(data.longitude);
  if (data.constructionProgress !== undefined) updateData.constructionProgress = data.constructionProgress;
  if (data.pricePerM2 !== undefined) updateData.pricePerM2 = String(data.pricePerM2);
  if (data.totalArea !== undefined) updateData.totalArea = String(data.totalArea);
  if (data.expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = new Date(data.expectedDeliveryDate);
  if (data.developerId !== undefined) updateData.developerId = data.developerId;
  if (data.images !== undefined) updateData.images = data.images;

  return await db.update(projects).set(updateData).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return null;

  return await db.delete(projects).where(eq(projects.id, id));
}
