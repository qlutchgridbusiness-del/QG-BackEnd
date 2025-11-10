

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

🏪 QlutchGrid Backend – Booking & Payments Flow

This backend powers the user, business, service, booking, and payment system with Razorpay integration.

🔗 Entity Relationships

User ⟷ Booking
User (1) — (∞) Booking
💙 A user can have many bookings.

Business ⟷ Service
Business (1) — (∞) Service
💙 A business can offer multiple services.

Business ⟷ Booking
Business (1) — (∞) Booking
💙 A business has many bookings across its services.

Service ⟷ Booking
Service (1) — (∞) Booking
💙 Each booking is for one service offered by a business.

📌 A Booking belongs to exactly one User, one Business, and one Service.

🖥️ Frontend Booking Flow

User selects: business + service + time.

Calls:

POST /bookings/create-and-initiate-payment


✅ Returns:

{
  "orderId": "...",
  "amount": 50000,
  "currency": "INR",
  "keyId": "rzp_test_XXXX",
  "bookingId": "..."
}


Frontend initializes Razorpay Checkout with keyId + orderId.

On 💚 success, Razorpay responds with:

{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}


Frontend calls:

POST /bookings/verify-payment


with these values + bookingId.

Backend verifies HMAC → marks booking 💚 confirmed if valid.

🚀 End-to-End System Flows
1️⃣ User Onboarding

User signs up with name, email, phone, password.

Stored in users table.

(Optional) Verification via Email/SMS.

2️⃣ Business Onboarding

Business owner signs up (or upgrades existing user to business role).

Creates Business Profile → name, description, address, logo, GSTIN.

Linked to userId in businesses table.

Adds 💙 payment details (bank, UPI, Razorpay).

Business becomes 💚 active & visible.

3️⃣ Service Management

Business adds services (e.g., Haircut, Consultation).

Each service → name, price, duration, description.

Stored in services table, linked to businessId.

4️⃣ Browsing & Booking

User browses businesses & services.

Selects service + date/time.

Clicks 💙 Book Now.

Backend:

Creates booking with status = "pending".

Calls Razorpay API → creates Order.

Returns: orderId, amount, keyId, bookingId.

5️⃣ Payment (Razorpay)

Frontend opens Razorpay Checkout with:

key_id (💙 same for all transactions).

orderId.

User details (name, email, phone).

User pays via 💚 UPI, Card, Wallet, Netbanking.

Razorpay returns: order_id, payment_id, signature.

6️⃣ Payment Verification

Backend verifies Razorpay signature (HMAC, key_secret).

If 💚 valid:

Booking → "confirmed".

Save payment in payments table.

If ❌ invalid/failed:

Booking → "failed" or "cancelled".

7️⃣ Post-Payment

Notify 💚 user (SMS/Email).

Notify 💚 business (new confirmed booking).

Dashboards:

User → My Bookings.

Business → Upcoming Bookings.

8️⃣ Service Fulfillment

On appointment day → service delivered.

Business marks booking 💚 completed.

(Optional) User leaves rating & review.

9️⃣ Refunds & Cancellations (Optional)

If cancelled before service:

Backend calls 💙 Razorpay Refund API.

Update payments table with refund status.

Booking → "refunded".

✅ Summary

Users → Register → Browse → Book → Pay → Confirm → Complete Service.

Businesses → Register → Add Services → Accept Bookings → Deliver Service → Get Paid.

System → Manages 💙 Users, Businesses, Services, Bookings, Payments, Notifications.