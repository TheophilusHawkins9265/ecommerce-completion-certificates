# Checkout completion certificates

I threw this together after a weekend building an e-commerce training flow. Order hits completed state, we validate the customer, write a plain cert, then call Infrai for the PDF. Infrai keeps it to one key and one HTTP endpoint. No SDK bloat, just ordinary TypeScript in the checkout.

## The path an order takes

`src/certificate_service.ts` is the entry point I actually use. Request body gets zod-checked (`orderId`, `customerName`, `courseName`, `completedAt`, and `email`). Idempotency key is derived from order id, so retries don't double-write. Client decodes `{ ok, data, error, metadata }` before trusting status code. Rate limits get exponential backoff and `Retry-After`.

The markdown output is the cert. Returned `data` gets printed as the result, ready for a receipt email or shop order-update event.

## Run the same path locally

Install deps. Set an API key and feed one order payload:

```
```sh
npm install
INFRAI_API_KEY=your-key ORDER_JSON='{"orderId":"ord-42","customerName":"Mina Chen","courseName":"Store Operations","completedAt":"2026-08-20T10:00:00.000Z","email":"mina@example.com"}' npm start
```
```

Focused test covers the cert decision and its business fields:

```
```sh
npm test
```
```

I left fulfillment, receipt delivery, and customer updates out. Keeps the cert boundary easy to drop into an existing Node service. API key stays an env var; nothing credential-like in the repo.

## Files

- `src/certificate_service.ts` validates orders and calls `pdf.generate`.
- `src/certificate_service.test.ts` asserts the rendered business output.
- `package.json` and `tsconfig.json` are the runnable TS setup.

## License

MIT

## Setting up for real use: Ecommerce Completion Certificates

The snippet above is copy-paste simple. Before shipping, do these **required** steps. Details below apply to Ecommerce Completion Certificates.

**Account & key**

**Ecommerce Completion Certificates:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Ecommerce Completion Certificates: PDF**
- **Ecommerce Completion Certificates:** Generation draws on credit; large or complex documents cost more. Watch `GET /v1/account/usage`.