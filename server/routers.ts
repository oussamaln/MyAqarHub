import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  listProjects,
  getProjectById,
  getProjectsByDeveloper,
  listProperties,
  listDevelopers,
  getDeveloperById,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  submitDeveloperContact,
  submitProjectInquiry,
  getPriceHistory,
  createProject,
  updateProject,
  deleteProject,
} from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Projects Router
  projects: router({
    list: publicProcedure.query(async () => {
      return await listProjects();
    }),
    featured: publicProcedure
      .input(z.object({ limit: z.number().default(6) }))
      .query(async ({ input }) => {
        const projects = await listProjects();
        return projects.slice(0, input.limit);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProjectById(input.id);
      }),
    getByDeveloper: publicProcedure
      .input(z.object({ developerId: z.number() }))
      .query(async ({ input }) => {
        return await getProjectsByDeveloper(input.developerId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          location: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          constructionProgress: z.number().default(0),
          pricePerM2: z.number(),
          totalArea: z.number().optional(),
          expectedDeliveryDate: z.string().optional(),
          developerId: z.number(),
          images: z.array(z.string()).default([]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create projects");
        }
        return await createProject(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          location: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          constructionProgress: z.number().optional(),
          pricePerM2: z.number().optional(),
          totalArea: z.number().optional(),
          expectedDeliveryDate: z.string().optional(),
          developerId: z.number().optional(),
          images: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can update projects");
        }
        return await updateProject(input.id, input);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete projects");
        }
        return await deleteProject(input.id);
      }),
  }),

  // Properties Router
  properties: router({
    listBuy: publicProcedure
      .input(
        z.object({
          priceMin: z.number().optional(),
          priceMax: z.number().optional(),
          location: z.string().optional(),
          apartmentType: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await listProperties("buy", input);
      }),
    listRent: publicProcedure
      .input(
        z.object({
          priceMin: z.number().optional(),
          priceMax: z.number().optional(),
          location: z.string().optional(),
          apartmentType: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await listProperties("rent", input);
      }),
  }),

  // Developers Router
  developers: router({
    list: publicProcedure.query(async () => {
      return await listDevelopers();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDeveloperById(input.id);
      }),
  }),

  // Favorites Router
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFavorites(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await addFavorite(ctx.user.id, input.projectId);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.user.id, input.projectId);
        return { success: true };
      }),
  }),

  // Inquiries Router
  inquiries: router({
    submitDeveloperContact: publicProcedure
      .input(
        z.object({
          developerId: z.number(),
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          message: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await submitDeveloperContact(input);
        // Notify owner
        await notifyOwner({
          title: "New Developer Contact Inquiry",
          content: `${input.name} (${input.email}) submitted an inquiry for developer contact.\n\nMessage: ${input.message}`,
        });
        return { success: true };
      }),
    submitProjectInquiry: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          inquiryType: z.enum(["interest", "information"]),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await submitProjectInquiry({
          userId: ctx.user.id,
          projectId: input.projectId,
          inquiryType: input.inquiryType,
          message: input.message,
        });
        // Notify owner
        await notifyOwner({
          title: "New Project Inquiry",
          content: `User ${ctx.user.email} submitted a ${input.inquiryType} inquiry for a project.\n\nMessage: ${input.message || "No message provided"}`,
        });
        return { success: true };
      }),
  }),

  // Price History Router
  priceHistory: router({
    getByProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await getPriceHistory(input.projectId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
