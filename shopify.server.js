// app/shopify.server.js
import { shopifyApp } from "@shopify/app";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-01";

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: ["read_products", "write_products", "read_content", "write_content", "read_themes"],
    hostName: process.env.HOST.replace(/https?:\/\//, ""),
    restResources,
  },
  auth: {
    path: "/auth",
    callbackPath: "/auth/callback",
  },
});

export default shopify;

