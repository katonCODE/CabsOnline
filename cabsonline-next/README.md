# CabsOnline Part 2

## 1. Public URL of the deployed application

Deployment URL: https://cabs-online-eight.vercel.app/

Local development URL: http://localhost:3000

## 2. Technology stack used

This Part 2 application refactors and extends the original CabsOnline booking system using a modern React-based stack.

Core stack:

- Next.js 16.2.6
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Row Level Security, and RPC functions
- Leaflet 1.9.4 and React Leaflet 5 for map interaction
- Spline via `@splinetool/react-spline` for the landing page 3D scene

Map providers:

- OpenStreetMap tile data through Leaflet
- Nominatim OpenStreetMap search and reverse geocoding for suburb lookup

## 3. How to run and build the project locally

Install dependencies:

```bash
npm install
```

Create `.env.local` with the Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build the production version:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

Check code quality:

```bash
npm run lint
```

## 4. Microservice API endpoints used

Local application routes:

- `/` - Spline landing page with booking and driver actions
- `/booking` - customer booking form
- `/admin/bookings` - active booking list, search, and assignment
- `/admin/bookings/[reference]` - detailed driver view for one booking
- `/admin/map` - driver map view for bookings with pickup coordinates
- `/login` - simple driver session login
- `/supabase-test` - Supabase configuration check

Remote Supabase RPC endpoints:

- `cabsonline_create_public_booking` - creates a public customer booking and returns the reference, pickup date, and pickup time
- `cabsonline_get_admin_bookings` - searches by booking reference, or returns unassigned bookings within two hours for empty search
- `cabsonline_get_active_admin_bookings` - returns active future bookings for the initial admin page
- `cabsonline_get_admin_map_bookings` - returns active future bookings with pickup coordinates for the admin map
- `cabsonline_assign_booking` - assigns an unassigned booking and records the driver profile when available
- `cabsonline_get_default_driver_profile_id` - returns the default driver profile for assignment

External APIs:

- `https://nominatim.openstreetmap.org/search` - address and suburb lookup
- `https://nominatim.openstreetmap.org/reverse` - reverse geocoding from clicked map points
- `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` - map tiles
- Spline scene loaded from `https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`

## 5. Feature descriptions

Customer booking:

The customer can create a booking with the required assignment fields: customer name, phone, unit number, street number, street name, pickup suburb, destination suburb, pickup date, and pickup time. The form validates required values, numeric phone numbers, numeric address fields, and prevents pickup times in the past.

Map-based trip selection:

The customer can use the map to set pickup and destination points. The map supports pickup mode, destination mode, marker clearing, suburb autofill from clicked points, a route line between the selected points, and an approximate direct distance calculation.

Booking confirmation:

After submission, the page displays the booking confirmation on the same page with the required phrases: booking reference number, pickup time, and pickup date. The booking reference follows the BRN00001 format.

Driver/admin booking list:

The admin page initially shows active future bookings. It also supports the assignment-required search behavior: a valid booking reference returns the exact booking, an invalid reference shows an error, and an empty search returns unassigned bookings within two hours.

Driver assignment:

Drivers can assign bookings from the booking list, the detail page, or the map popup. Assignment updates Supabase and the page state.

Booking detail page:

The detail page shows the full booking record, customer information, pickup and destination details, coordinates, trip distance, assignment status, timeline, and links to OpenStreetMap and the admin map.

Admin map:

The admin map displays active future bookings with pickup coordinates. A focused reference query can open the map around a specific booking. Each marker popup links back to the booking detail page.

Landing page:

The landing page uses a Spline 3D scene with direct actions for booking a cab or opening the driver login.

## 6. Testing instructions

Recommended browser:

- Google Chrome

Basic customer booking test:

1. Open `http://localhost:3000/booking`.
2. Submit the empty form and confirm validation messages appear.
3. Enter a valid phone number with 10 to 12 digits.
4. Set a future pickup date and time.
5. Click the map to set a pickup point.
6. Click `Set destination`, then click the map again to set the destination.
7. Confirm the approximate distance appears.
8. Submit the booking.
9. Confirm the response includes booking reference number, pickup time, and pickup date.

Admin search and assignment test:

1. Open `http://localhost:3000/admin/bookings`.
2. Confirm active future bookings appear.
3. Search for an invalid reference such as `BADREF` and confirm an error appears.
4. Search for a valid reference such as `BRN00013`.
5. Click `Assign` or open `View` and click `Assign to me`.
6. Confirm the status changes to assigned.

Admin map test:

1. Open `http://localhost:3000/admin/map`.
2. Confirm booking markers appear for bookings with pickup coordinates.
3. Open `http://localhost:3000/admin/map?ref=BRN00013`.
4. Confirm the selected booking marker can be opened and links back to the booking detail page.

Example booking references from testing:

- `BRN00010`
- `BRN00012`
- `BRN00013`

Sample driver details:

- Demo login username: `driver`
- Demo login password: `driver`
- Driver assignment uses the default driver profile from Supabase when available.

## 7. Limitations and known issues

The application uses Supabase rather than the original Part 1 PHP and MySQL stack. This is acceptable for Part 2 because the specification allows a rewrite using another language or framework.

The driver login is intentionally simple for assignment purposes. It stores a local driver session and does not implement full production authentication.

Map distance is a straight-line estimate, not a road-route distance. It is useful for quick comparison but does not represent exact taxi travel distance.

Nominatim geocoding depends on an external OpenStreetMap service. If that service is unavailable or rate-limited, address lookup and suburb autofill may not work, but manual suburb entry and map marker placement still work.

The public deployment URL must be added before submission.

## 8. Reflection on AI-supported development process

AI support was used to refactor the original booking/admin workflow into a modern Next.js application and to extend it with richer Part 2 functionality. The most useful AI-supported steps were identifying gaps against the assignment specification, converting direct table reads into controlled Supabase RPC functions, improving validation behavior, and adding map-based interaction.

AI was also used during testing. The application was checked through browser-based end-to-end QA covering customer booking, invalid form submissions, map point selection, admin search, booking assignment, detail pages, and admin map behavior. Issues found during testing were fixed and retested, including the Supabase RPC mismatch for assignment and the admin map's direct table access problem.

Overall, I took a higher-level approach to this part 2, making the use of cursor agents and codex, I was able to smoothly refactor my application into a accessible vercel app with simple features.  The final result is more usable than the original Part 1-style flow because it includes responsive pages, richer trip selection, a driver-focused detail page, and visual map-based review of bookings.
