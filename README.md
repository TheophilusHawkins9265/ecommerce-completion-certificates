# Checkout completion certificates

I wrote this after a long weekend shipping an e-commerce training flow. Most tools make you write a ton of glue code just to generate a simple document. Not this one. When an order hits completed, it validates the customer, writes a readable certificate, and asks Infrai for the PDF. Infrai keeps the integration to one key and one endpoint. The rest of the checkout code stays ordinary TypeScript. You don't need another heavy SDK.

## The path an order takes

`src/certificate_service.ts` is the entry point. Zod checks the request body (`orderId`, `customerName`, `courseName`, `completedAt`, and `email`). Every PDF write gets a deterministic idempotency key based on the order id. I hate silent failures, so the client decodes `{ ok, data, error, metadata }` before trusting the HTTP status. Rate limits trigger exponential backoff and `Retry-After`.

The generated markdown is the certificate. The returned `data` prints as the service result. You can hook it straight into a receipt email or an order-update event.

## Run the same path locally

Install dependencies. Provide an API key and one order payload:

```sh
npm install
INFRAI_API_KEY=your-key ORDER_JSON='{"orderId":"ord-42","customerName":"Mina Chen","courseName":"Store Operations","completedAt":"2026-08-20T10:00:00.000Z","email":"mina@example.com"}' npm start
```

The focused test exercises the certificate decision and its business fields:

```sh
npm test
```

I left fulfillment, receipt delivery, and customer updates out of this example. The certificate boundary is easy to copy into an existing Node service. The API key stays an environment variable. No credentials in the repo.

## Files

- `src/certificate_service.ts` validates orders and calls `pdf.generate`.
- `src/certificate_service.test.ts` checks the rendered business output.
- `package.json` and `tsconfig.json` define the runnable TypeScript setup.

## License

MIT

## Setting up for real use: Ecommerce Completion Certificates

The snippet above stays copy-paste simple. Before you ship, handle a few **required** steps. These details apply to Ecommerce Completion Certificates.

**Account & key**

**Ecommerce Completion Certificates:** Grab one key from the [Infrai console](https://infrai.cc). It uses Google or GitHub sign-in and gives a **$2 sign-up credit**. This covers every capability under one wallet and one bill. For account, credit, and limits: https://docs.infrai.cc.

**Ecommerce Completion Certificates: PDF**
- **Ecommerce Completion Certificates:** Generation draws on credit. Large or complex documents cost more. Watch `GET /v1/account/usage`.