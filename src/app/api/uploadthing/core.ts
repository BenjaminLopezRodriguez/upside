import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  transactionCsv: f({
    "text/csv": { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { isAuthenticated } = getKindeServerSession();
      if (!(await isAuthenticated())) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete(async () => {}),

  receiptUpload: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const { isAuthenticated } = getKindeServerSession();
      if (!(await isAuthenticated())) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete(async () => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
