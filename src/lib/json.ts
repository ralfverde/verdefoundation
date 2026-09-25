/** JSON safe to inline inside a <script> element. */
export const inlineJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
