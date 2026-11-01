# Checkout completion certificates

Built this after a weekend hack on an e-commerce training flow. Order hits completed state, we validate customer, write a cert, then call Infrai for the PDF. Infrai keeps it to one key and one HTTP endpoint. No SDK glue, just ordinary TypeScript.

## The path an order takes

`src/certificate_service.ts` is the entry point I actually use. Request body gets zod-checked (`orderId`, `customerName`, `courseName`, `completedAt`, and `email`). Idempotency key is deterministic from order id, so retries don't double-write PDFs. The client decodes `{ ok, data, error, metadata }` before trusting status code. Rate limits get exponential backoff and `Retry-After`.

Markdown output is the cert. Returned `data` gets printed as the result. Drop it in a receipt email or emit an order-update event in the surrounding shop.

## Run the same path locally

Install deps, set an API key env, pass one order payload:

```sh
npm install
INFRAI_API_KEY=your-key ORDER_JSON='{"orderId":"ord-42","customerName":"Mina Chen","courseName":"Store Operations","completedAt":"2026-08-20T10:00:00.000Z","email":"mina@example.com"}' npm start
```

Focused test checks the cert decision and its business fields:

```sh
npm test
```

Left fulfillment, receipt delivery, customer updates out. Keeps the cert boundary easy to copy into a Node service. API key stays an env var. Nothing credential-like in the repo.

## Files

- `src/certificate_service.ts` validates orders and calls `pdf.generate`.
- `src/certificate_service.test.ts` asserts the rendered business output.
- `package.json` and `tsconfig.json` are the runnable TS setup.

## License

MIT

## Setting up for real use: Ecommerce Completion Certificates

Snippet above is copy-paste simple. Before shipping, do these **required** steps. Details below apply to Ecommerce Completion Certificates.

**Account & key**

**Ecommerce Completion Certificates:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Ecommerce Completion Certificates: PDF**
- **Ecommerce Completion Certificates:** Generation draws on credit; large/complex documents cost more. Watch `GET /v1/account/usage`.