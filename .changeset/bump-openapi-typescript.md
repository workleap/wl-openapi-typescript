---
"@workleap/create-schemas": minor
---

Bump `openapi-typescript` from `7.0.2` to `7.13.0`.

This fixes the `enumValues` option for array-valued enums. On `7.0.2` the generated
value array was annotated with the property type instead of the item type, producing
`T[][]` assigned a list of strings and failing the build with `TS2322`. `7.13.0` emits a
`FlattenedDeepRequired` helper that unwraps the array and strips optionality, so
`enumValues` is now usable on documents whose enums appear inside arrays.

Generated output changes slightly for documents that use `additionalProperties`: an index
signature alongside declared properties is now emitted as an intersection
(`{ ... } & { [key: string]: unknown }`) rather than merged into the object, and a typed
index signature no longer carries `| undefined`. Doc comments spanning multiple lines are
also reflowed onto their own lines.
