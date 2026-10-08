import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import { compileFromFile } from 'json-schema-to-typescript';

const input = new URL('../../contracts/openapi.json', import.meta.url);
const output = new URL('../src/api/generated/http.ts', import.meta.url);
await writeFile(output, astToString(await openapiTS(input)));
const sse = await compileFromFile(
  fileURLToPath(new URL('../../contracts/sse.schema.json', import.meta.url)),
  { bannerComment: '/* Generated from the host SSE schema. Do not edit. */' },
);
await writeFile(new URL('../src/api/generated/sse.ts', import.meta.url), sse);
