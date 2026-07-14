# Operational data architecture

Firestore is the canonical operational database for trips, requirements, crew, operators, vehicles, incidents, payments, and audit events. Flutter continues to use Firebase Authentication and Firestore. The Admin portal continues to use Supabase Authentication and `admin_profiles` for access and roles. Authenticated Next.js server code reads Firestore through Firebase Admin; privileged Firebase code is never shipped to the browser.

There is no Supabase operational trip schema and no trip data is duplicated between databases.

The read boundary expects `trips`, `transport_requirements`, `crew`, `operators`, `vehicles`, `incidents`, and `audit_events`. Parsers tolerate missing optional fields and Firestore timestamps, but names must be checked against the Flutter canonical model before mutations are implemented.

`audit_events` should contain `actorAdminId`, `actorRole`, `action`, `entityType`, `entityId`, `previousValue`, `newValue`, `reason`, `createdAt`, optional `ipAddressOptional`, and minimal `metadata`. Future writes must atomically write an audit event and domain mutation after revalidating the Supabase admin and permission on the server.

Provide `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` only as server deployment secrets. Escaped `\\n` private-key newlines are supported. Deploy `firestore.indexes.json`; combined trip filters may require additional composite indexes prompted by Firestore.

No approval or assignment mutation is exposed because capacity, schedule-conflict, canonical document, transaction, and audit contracts have not been confirmed.
