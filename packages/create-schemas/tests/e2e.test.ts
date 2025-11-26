import {
    createTemporaryFolder,
    dataFolder,
    runCompiledBin
} from "./fixtures.ts";
import { assert, describe, test } from "vitest";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { openapiTypeScriptFilename } from "../src/plugins/openapi-typescript-plugin.ts";
import { writeFile } from "node:fs/promises";

const timeout = 30 * 1000; // 30 seconds

describe.concurrent("e2e", () => {
    test(
        "officevice.yaml / file paths",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished });

            const result = await runCompiledBin({
                source: join(dataFolder, "officevice.yaml"),
                outdir: tempFolder
            });

            const typesFile = result.find(file => file.filename === openapiTypeScriptFilename);
            assert(typesFile);
            expect(typesFile.code).toMatchSnapshot(); 
        },
        timeout
    );

    test(
        "officevice.yaml / file URLs",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished });

            const result = await runCompiledBin({
                source: pathToFileURL(join(dataFolder, "officevice.yaml")).toString(),
                outdir: tempFolder
            });

            const typesFile = result.find(file => file.filename === openapiTypeScriptFilename);
            assert(typesFile);
            expect(typesFile.code).toMatchSnapshot(); 
        },
        timeout
    );

    test(
        "officevice.yaml / relative path",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished });

            const result = await runCompiledBin({
                cwd: dataFolder,
                source: "officevice.yaml",
                outdir: tempFolder
            });

            const typesFile = result.find(file => file.filename === openapiTypeScriptFilename);
            assert(typesFile);
            expect(typesFile.code).toMatchSnapshot(); 
        },
        timeout
    );

    test(
        "petstore.json",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished });

            const result = await runCompiledBin({
                source: join(dataFolder, "petstore.json"),
                outdir: tempFolder
            });

            const typesFile = result.find(file => file.filename === openapiTypeScriptFilename);
            assert(typesFile);
            expect(typesFile.code).toMatchSnapshot(); 
        },
        timeout
    );

    test(
        "petstore.json / remote URL",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished });

            const result = await runCompiledBin({
                source: "https://petstore3.swagger.io/api/v3/openapi.json", 
                outdir: tempFolder
            });

            const typesFile = result.find(file => file.filename === openapiTypeScriptFilename);
            assert(typesFile);
            expect(typesFile.code).toMatchSnapshot();
        },
        timeout
    );

    test(
        "petstore.json / generate openapi-fetch client",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished: onTestFinished });

            const configFile = `
            import { experimental_openapiFetchPlugin } from "../../../src/plugins";

            export default { plugins: [experimental_openapiFetchPlugin()] };
            `;

            await writeFile(join(tempFolder, "create-schemas.config.ts"), configFile);

            const result = await runCompiledBin({
                source: join(dataFolder, "petstore.json"),
                outdir: join(tempFolder, "dist"),
                cwd: tempFolder
            });

            console.log(result);

            const clientFile = result.find(file => file.filename === "client.ts");
            expect(clientFile).toBeDefined();
        },
        timeout
    );

    test(
        "enums.yaml / enum generation without duplicate type aliases",
        async ({ expect, onTestFinished }) => {
            const tempFolder = await createTemporaryFolder({ onTestFinished });

            const configFile = `
            export default {
                openApiTsOptions: {
                    enum: true
                }
            };
            `;

            await writeFile(join(tempFolder, "create-schemas.config.ts"), configFile);

            const result = await runCompiledBin({
                source: join(dataFolder, "enums.yaml"),
                outdir: join(tempFolder, "dist"),
                cwd: tempFolder
            });

            const typesFile = result.find(file => file.filename === openapiTypeScriptFilename);
            assert(typesFile);

            // Verify enums are generated (including those with special characters)
            expect(typesFile.code).toContain("export enum Status");
            expect(typesFile.code).toContain("export enum Priority");
            expect(typesFile.code).toContain("export enum UserStatus");
            expect(typesFile.code).toContain("export enum TaskPriority");

            // Verify NO duplicate type aliases for enums
            const statusTypeAliasRegex = /export type Status = components\["schemas"\]\["Status"\];/;
            const priorityTypeAliasRegex = /export type Priority = components\["schemas"\]\["Priority"\];/;
            const userStatusTypeAliasRegex = /export type UserStatus = components\["schemas"\]\["user-status"\];/;
            const taskPriorityTypeAliasRegex = /export type TaskPriority = components\["schemas"\]\["task\.priority"\];/;
            expect(typesFile.code).not.toMatch(statusTypeAliasRegex);
            expect(typesFile.code).not.toMatch(priorityTypeAliasRegex);
            expect(typesFile.code).not.toMatch(userStatusTypeAliasRegex);
            expect(typesFile.code).not.toMatch(taskPriorityTypeAliasRegex);

            // Verify non-enum types still get type aliases
            expect(typesFile.code).toContain('export type Task = components["schemas"]["Task"];');

            expect(typesFile.code).toMatchSnapshot();
        },
        timeout
    );
});
