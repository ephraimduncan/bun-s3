import { S3Client, serve } from "bun";
import index from "../public/index.html";

const r2 = new S3Client({
  accessKeyId: Bun.env.R2_ACCESS_KEY_ID,
  secretAccessKey: Bun.env.R2_SECRET_ACCESS_KEY,
  bucket: Bun.env.R2_BUCKET,
  endpoint: Bun.env.R2_ENDPOINT,
});

const server = serve({
  routes: {
    "/*": index,

    "/api/upload": {
      async POST(req) {
        const formData = await req.formData();
        const files = formData.getAll("files");

        const uploadResults = [];

        for (const file of files) {
          if (file instanceof File) {
            const fileContents = await file.arrayBuffer();
            const fileName = `uploads/${Date.now()}-${file.name}`;

            try {
              await r2.write(fileName, fileContents, {
                type: file.type || "application/octet-stream",
              });

              const presignedUrl = r2.file(fileName).presign({
                expiresIn: 60 * 60 * 24,
                acl: "public-read",
              });

              uploadResults.push({
                originalName: file.name,
                size: file.size,
                type: file.type,
                s3Key: fileName,
                url: presignedUrl,
              });
            } catch (error) {
              uploadResults.push({
                originalName: file.name,
                error: error.message || "Failed to upload file",
              });
            }
          }
        }

        return Response.json({
          message: "Files processed",
          results: uploadResults,
        });
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
