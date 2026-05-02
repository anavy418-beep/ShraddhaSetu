# ShraddhaSetu Mobile API (Android-Ready)

Base URL: `https://<your-domain>`

All mobile endpoints are under `/api/mobile/*` and map to the same production business logic as web endpoints.

## Auth

- `POST /api/mobile/auth/login`
  - Body: `{ email, password, role }`
- `POST /api/mobile/auth/register-user`
  - Body: `{ name, email, password, phone?, citySlug? }`
- `GET /api/mobile/auth/me`

## Services & Cities

- `GET /api/mobile/services?search=&category=`
- `GET /api/mobile/services/{slug}`
- `GET /api/mobile/cities`
- `GET /api/mobile/pandits`

## Booking

- `POST /api/mobile/bookings`
  - Body:
  - `{ serviceSlug, citySlug, date, time, language, address, packageName, packagePrice, customerName?, customerPhone?, customerEmail?, notes? }`
- `GET /api/mobile/bookings/my`

## Payments (shared)

- `POST /api/payments/create-order`
  - Body: `{ entityType: "BOOKING", entityId, paymentOption?: "ADVANCE" | "FULL", paymentMethod? }`
- `POST /api/payments/verify`
  - Body: `{ paymentId, status, razorpayOrderId?, razorpayPaymentId?, razorpaySignature? }`
- `POST /api/payments/webhook`
  - Razorpay server-to-server webhook endpoint with signature validation.

## Blog

- `GET /api/mobile/blog?category=`
- `GET /api/mobile/blog/{slug}`
- `GET /api/mobile/blog/categories`

## Notes

- Session auth currently uses secure HTTP-only cookie.
- For token-based Android auth later, add JWT bearer issuance endpoint and keep these routes unchanged.
- Payment finalization should rely on webhook as source of truth; client verify endpoint provides immediate UX confirmation.
