import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { desc } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
  }),
});
