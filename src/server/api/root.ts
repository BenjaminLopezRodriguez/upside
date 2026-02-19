import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { transactionRouter } from "@/server/api/routers/transaction";
import { cardRouter } from "@/server/api/routers/card";
import { reimbursementRouter } from "@/server/api/routers/reimbursement";
import { billRouter } from "@/server/api/routers/bill";
import { userRouter } from "@/server/api/routers/user";
import { organizationRouter } from "@/server/api/routers/organization";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  transaction: transactionRouter,
  card: cardRouter,
  reimbursement: reimbursementRouter,
  bill: billRouter,
  user: userRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
