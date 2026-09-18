import assert from "node:assert/strict";
import { certificateMarkdown } from "./certificate_service.ts";

const order = { orderId: "ord-42", customerName: "Mina Chen", courseName: "Store Operations", completedAt: "2026-08-20T10:00:00.000Z", email: "mina@example.com" };
const text = certificateMarkdown(order);
assert.match(text, /Mina Chen/);
assert.match(text, /Store Operations/);
assert.match(text, /ord-42/);
console.log("certificate decision test passed");
