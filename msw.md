# Mock Service Worker

## Type-safe Handlers

The [`experimental_openapiMSWPlugin` plugin](/using-plugins/#experimental_openapimswplugin) allows you to define MSW handlers in a type-safe way.

To use this client, you need to install the [`openapi-msw`](https://www.npmjs.com/package/openapi-msw) package:

+++ pnpm
```bash
pnpm add openapi-msw
```
+++ npm
```bash
npm install openapi-msw
```
+++ yarn
```bash
yarn add openapi-msw
```
+++

**Example usage:**

```ts #2,5 create-schemas.config.ts 
import { defineConfig } from "@workleap/create-schemas";
import { experimental_openapiMSWPlugin } from "@workleap/create-schemas/plugins";

export default defineConfig({
    plugins: [experimental_openapiMSWPlugin()]
    input: "v1.yaml",
    outdir: "codegen",
});
```

```ts #5-6
import { http } from "./codegen/openapi-msw.ts";

export const handlers = [
    http.get("/good-vibes-points/{userId}", ({ response }) => {
        return response(200).json({ pointx: 50 });
                                 // ^^^^^^ Property "pointx" does not exist on type { points: number }
    }),
];
```

## Auto-generated handlers

*Soon...*

See https://source.mswjs.io/
