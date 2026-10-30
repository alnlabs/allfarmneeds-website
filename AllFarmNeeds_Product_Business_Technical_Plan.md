# AllFarmNeeds --- Product, Business & Technical Plan

**Brand:** AllFarmNeeds\
**Domain:** allfarmneeds.com\
**Tagline:** Everything Farmers Need. One Platform.\
**Initial market:** Telangana, India\
**Initial languages:** Telugu and English\
**Document version:** 1.0\
**Planning date:** 30 October 2026\
**Status:** Working product plan --- validate assumptions before
implementation

------------------------------------------------------------------------

## 1. Executive Summary

AllFarmNeeds is a unified agricultural marketplace designed to connect
farmers with the people, products and services they need. It brings
agricultural services, farm jobs and labour, crop and product listings,
buyers, traders and agricultural businesses into one platform.

The product should be accessible to people who are not comfortable
reading or typing. Telugu and English support, voice interaction, visual
navigation and low-bandwidth design are core product requirements.

The initial launch should focus on a small Telangana pilot, validate
real transactions and repeat usage, and expand only after proving that
the platform solves meaningful local problems.

### Product promise

> A farmer should not have to search in ten different places to fulfil
> their agricultural needs.

### Core principles

-   One account can support multiple roles.
-   Farmers and workers should be able to use essential features for
    free.
-   Browsing should be possible without forcing account creation
    wherever practical.
-   Users should be able to select a village manually; GPS must not be
    mandatory.
-   Listings, prices, availability and provider identities must be
    transparent.
-   AI must ask for confirmation before publishing listings or taking
    consequential actions.
-   Build a reliable marketplace first; add complex services and
    automation progressively.

------------------------------------------------------------------------

## 2. Vision, Mission and Positioning

### Vision

Become a trusted digital marketplace for the agricultural ecosystem,
starting in Telangana and expanding across India.

### Mission

Make it easier for farmers and agricultural businesses to discover
services, find workers, sell produce, source products and connect with
buyers.

### Positioning

AllFarmNeeds is not only a crop-selling app or a tractor-booking app. It
is a multi-sided agricultural marketplace for:

1.  Farmers
2.  Farm workers and labour contractors
3.  Agricultural service providers
4.  Buyers, traders and wholesalers
5.  Retailers, restaurants and food processors
6.  Agricultural professionals and businesses

### Brand

-   **Brand name:** AllFarmNeeds
-   **Domain:** allfarmneeds.com
-   **Tagline:** Everything Farmers Need. One Platform.
-   **Brand character:** Trustworthy, practical, inclusive, simple and
    farmer-first.
-   **Brand language:** Telugu and English at launch.

Domain ownership does not by itself establish trademark rights. Check
Indian trademark availability and relevant classes before investing
heavily in the brand.

------------------------------------------------------------------------

## 3. Target Users and Roles

A single user identity should support multiple roles. A person may be a
farmer, buyer and service provider at the same time.

  -------------------------------------------------------------------------------
  Role                            Main needs              Main actions
  ------------------------------- ----------------------- -----------------------
  Farmer                          Services, workers,      Search, post jobs, list
                                  buyers, market access   produce, enquire, book

  Worker                          Local paid farm work    Create profile, browse
                                                          jobs, apply, manage
                                                          work

  Labour contractor/team lead     Group work              Publish team
                                  opportunities           capability, respond to
                                                          jobs, coordinate
                                                          workers

  Service provider                Find customers and      Publish services, set
                                  manage work             areas/prices, manage
                                                          requests

  Buyer/trader                    Source produce and      Publish purchase
                                  suppliers               requirements, contact
                                                          sellers, negotiate

  Retailer/restaurant/processor   Regular or bulk         Search products,
                                  sourcing                publish demand, contact
                                                          suppliers

  Agricultural professional       Offer expertise         Publish professional
                                                          services and respond to
                                                          enquiries

  Administrator/moderator         Keep marketplace safe   Verify, moderate,
                                  and useful              resolve reports, manage
                                                          categories
  -------------------------------------------------------------------------------

Role permissions must be enforced by the backend, not just hidden or
shown in the user interface.

------------------------------------------------------------------------

## 4. Core Marketplace Modules

### 4.1 Agricultural Services

Help farmers discover and contact service providers.

**Service categories may include:**

-   Tractor rental
-   Rotavator, cultivator and ploughing
-   Harvester and other machinery
-   JCB and earthmoving
-   Drone spraying and crop monitoring
-   Pesticide and fertilizer application services
-   Irrigation installation and repair
-   Borewell and pump services
-   Drip and sprinkler systems
-   Farm labour services
-   Tractor trolley, trucks and transport
-   Machinery and electrical repairs
-   Fencing and farm sheds
-   Veterinary and dairy equipment services
-   Soil testing and agronomy consultation

**Provider profile:**

-   Name or business name
-   Verified mobile number
-   Profile image or business logo
-   Service categories
-   Description and photos
-   Contact preferences
-   Service areas
-   Verification status
-   Ratings and reviews, once available

**Service listing:**

-   Service title and category
-   Description and photos
-   Pricing amount and pricing unit (acre, hour, day, job, kilometre,
    etc.)
-   Minimum booking, if applicable
-   Availability
-   Operating districts, mandals and villages
-   Travel or transport charges, if applicable
-   Contact, enquiry or booking-request method

A provider may publish multiple listings with different service areas,
prices and availability. For example, a provider may offer tractor
rental in five villages but JCB services in only two.

**Farmer discovery filters:**

-   Service category
-   Village, mandal or district
-   Distance, where location permission is available
-   Price and pricing unit
-   Availability
-   Verified status
-   Rating, when sufficient reviews exist

**Booking lifecycle:**

`requested → accepted/rejected → scheduled → in_progress → completed / cancelled / disputed`

The first release can support enquiry and booking requests without
online payment or escrow.

### 4.2 Farm Jobs and Labour Marketplace

Help farmers find workers and help workers discover paid agricultural
work.

**Job categories:**

-   Planting and transplantation
-   Harvesting
-   Cotton picking
-   Paddy harvesting
-   Vegetable and fruit picking
-   Weeding
-   Fertilizer application
-   Irrigation
-   Farm maintenance
-   Livestock care
-   Equipment operation
-   Loading and unloading
-   Fencing and farm construction
-   Other farm work

**Farm job fields:**

-   Job title and category
-   Description and instructions
-   Number of workers required
-   Village and work location
-   Work date and start time
-   Expected duration
-   Payment model and advertised amount
-   Experience or skill requirements
-   Food, drinking water or accommodation details
-   Application deadline
-   Contact or application method

**Payment models:**

-   Hourly
-   Half-day
-   Full-day
-   Per acre
-   Per task
-   Quantity-based

The app must distinguish advertised compensation from the final amount
agreed between the parties.

**Worker profile:**

-   Name and optional profile photo
-   Verified mobile number
-   Village and preferred work radius
-   Skills and job categories
-   Experience
-   Expected compensation
-   Availability
-   Languages
-   Work history and reviews, where available

**Worker capabilities:**

-   Browse nearby jobs
-   Filter by date, category, location and pay
-   Apply for jobs
-   View application status
-   Manage selected jobs and schedule
-   Review completed work and agreed payment details

**Farmer capabilities:**

-   Publish a job and specify the number of vacancies
-   Review applicants
-   Select or decline applicants
-   Contact selected workers
-   Record attendance and completion
-   Record agreed payment status
-   Review workers after completion

Support group hiring, but show the identities and number of workers
represented by a contractor or team lead. Include reporting,
cancellation and no-show handling. Avoid automatic penalties without
fair review.

### 4.3 Crop and Agricultural Product Marketplace

Allow farmers and sellers to advertise available agricultural produce
and permitted products.

**Possible categories:**

-   Paddy and rice
-   Cotton
-   Maize
-   Turmeric
-   Chilli
-   Groundnuts
-   Pulses
-   Vegetables
-   Fruits
-   Milk and dairy
-   Eggs and poultry
-   Livestock
-   Seeds and other permitted agricultural goods

**Product listing fields:**

-   Product and category
-   Photos
-   Description
-   Quantity and unit (kg, quintal, tonne, litre, piece, etc.)
-   Expected price and price unit
-   Quality or grade
-   Harvest or availability date
-   Village and pickup location
-   Minimum order quantity
-   Delivery or pickup options
-   Listing expiry

**Buyer discovery filters:**

-   Product
-   Location
-   Quantity
-   Expected price
-   Quality or grade
-   Availability date
-   Pickup or delivery preference

**Important capabilities:**

-   Contact seller
-   Send enquiry
-   Negotiate price and quantity
-   Support bulk quantities
-   Support partial sales
-   Update remaining quantity
-   Mark listing sold or expired

Example: a farmer lists 5,000 kg of produce, agrees to sell 2,000 kg and
updates the remaining available quantity to 3,000 kg.

An expected price is seller-provided information, not a guaranteed
market price or official market quotation.

**Listing lifecycle:**

`draft → published → enquiries → negotiation → sale_agreed → partially_sold / sold → completed / expired`

The initial release is a discovery and lead-generation marketplace, not
a fully managed e-commerce operation.

### 4.4 Buyers, Traders and Purchase Requirements

Buyers should not only search listings; they should be able to publish
what they need.

**Buyer profile:**

-   Person or business name
-   Business type
-   Verified contact details
-   Location and operating areas
-   Products of interest
-   Typical purchase quantities or capacity
-   GST details where applicable
-   Verification status

Not every buyer needs a GST number. Collect business and tax information
only where appropriate.

**Purchase requirement / RFQ fields:**

-   Product and grade
-   Required quantity and unit
-   Delivery or pickup location
-   Required date or date range
-   Expected or negotiable price, if supplied
-   Quality specifications
-   Contact and response preferences
-   Expiry date

**Buyer workflow:**

`created → sellers_matched → offers_received → negotiation → deal_confirmed → outcome_recorded / expired`

Sellers can respond with available quantity, quality, price and delivery
details. Buyers can compare offers, contact sellers and negotiate.

------------------------------------------------------------------------

## 5. Shared Platform Capabilities

### 5.1 Identity and Multi-role Accounts

-   Mobile OTP authentication
-   One account per verified identity/phone number, subject to account
    recovery rules
-   Multiple roles per account
-   Role-specific profiles
-   User-controlled profile and privacy settings
-   Account deletion and data rights workflows

### 5.2 Location System

Use a structured hierarchy:

`India → State → District → Mandal → Village → Locality / Farm location`

Requirements:

-   Telangana-first location data
-   Search by village, mandal and district
-   Manual location selection
-   Optional GPS-based nearby discovery
-   Multiple service areas per provider listing
-   Multiple operating areas for buyers
-   Clear handling of locations outside the initial pilot

Do not require GPS permission for basic registration or browsing.

### 5.3 Messaging and Contact

Initial communication can support:

-   Call
-   WhatsApp handoff
-   In-app enquiry
-   In-app conversation, if included in the release scope
-   Notifications for new enquiries and application updates

Protect phone numbers and personal information. Avoid exposing contact
details publicly by default.

### 5.4 Ratings, Reviews and Trust

-   Reviews should be linked to meaningful interactions where possible.
-   Allow users to report abusive or misleading content.
-   Provide a moderation and appeal process.
-   Distinguish verified identity from verified business/service
    capability.
-   Do not imply that a listing or seller is guaranteed merely because a
    phone number is verified.

### 5.5 Notifications

-   Job application received
-   Application accepted or declined
-   New service enquiry or booking request
-   Booking status changed
-   Product enquiry received
-   Buyer requirement match
-   Seller offer received
-   Listing expiry reminder
-   Important account and safety notifications

Use push notifications where available and consider SMS or WhatsApp
notifications only after evaluating cost, consent and provider policies.

------------------------------------------------------------------------

## 6. Agri Mitra --- Voice-first AI Assistant

Agri Mitra is the working name for the AllFarmNeeds assistant. It should
perform marketplace tasks through a guided conversation, not merely
answer general questions.

### 6.1 Core user experience

A user can interact through:

-   Voice input
-   Spoken responses
-   Large visual choices
-   Simple Telugu or English text
-   Manual correction and confirmation

Users should be able to switch between normal visual navigation and
voice mode at any time.

### 6.2 Launch languages

-   Telugu
-   English

Do not add Urdu at launch. Support Telugu-English code-switching where
speech technology performs reliably.

### 6.3 Example: Create a farm job

Farmer says:

> "రేపు పత్తి తీయడానికి పది మంది కూలీలు కావాలి."

Assistant workflow:

1.  Recognize the request and language.
2.  Identify the task as a farm-job listing.
3.  Ask for missing details such as work hours and payment.
4.  Confirm the village or use the saved profile location with
    permission.
5.  Build a structured job draft.
6.  Read the summary aloud and display it visually.
7.  Ask the farmer to confirm.
8.  Publish only after explicit confirmation.
9.  Read or display the result.

### 6.4 Other supported voice tasks

-   Find a tractor near my village.
-   I want to sell 20 quintals of paddy.
-   Find workers for harvesting tomorrow.
-   Show buyers looking for cotton.
-   Read my booking requests.
-   Tell me who applied for my job.
-   Find a drone spraying service.
-   Create a service listing.

### 6.5 AI safety and reliability

-   Never publish a listing without explicit confirmation.
-   Never accept or reject a booking or job applicant without
    authorization.
-   Never negotiate or commit money on behalf of a user without
    authorization.
-   Never invent prices, availability, locations or user details.
-   Ask the user to repeat uncertain speech.
-   Allow users to review and edit extracted details.
-   Keep an audit record of consequential AI actions.
-   Obtain consent for audio processing.
-   Do not retain raw voice recordings by default; retain only necessary
    metadata.
-   Clearly distinguish general information from professional
    agricultural advice.

### 6.6 Technology evaluation

Evaluate speech recognition and text-to-speech options, including
Bhashini and other suitable providers. Test with:

-   Telangana Telugu accents
-   Rural agricultural vocabulary
-   Background machinery and outdoor noise
-   Different phone microphones
-   Telugu-English mixed speech
-   Low-connectivity conditions

Do not select a speech provider based only on a demo. Run field tests
with actual users.

### 6.7 Future agricultural information assistant

Potential future capabilities:

-   Weather information
-   Crop practices
-   Government scheme information
-   Market-price information
-   Crop disease identification
-   Irrigation guidance
-   Fertilizer and pesticide information

These features require reliable, current sources and appropriate
professional safeguards. Do not present unverified AI-generated
pesticide or fertilizer recommendations as authoritative advice.

------------------------------------------------------------------------

## 7. User Experience and Application Structure

### 7.1 Unified Mobile App

Build one application with role-aware features rather than separate apps
for farmers, workers, providers and buyers.

**Proposed main navigation:**

  Navigation   Purpose
  ------------ ---------------------------------------------------------
  Home         Overview, shortcuts and relevant listings
  Explore      Search services, jobs, products and buyers
  Create       Publish a service, job, product or purchase requirement
  Messages     Enquiries and conversations
  Profile      User roles, profile, listings and account settings

### 7.2 Home Screen

-   Location selector
-   Universal search
-   Voice assistant entry point
-   Agricultural services
-   Farm jobs
-   Crop marketplace
-   Buyer requirements
-   Nearby and relevant listings
-   Simple visual category cards

### 7.3 Accessibility and Rural Usability

-   Telugu and English interface
-   Large touch targets
-   Clear icons and images
-   Short labels and simple instructions
-   Voice input and audio playback
-   Minimal typing
-   Manual location selection
-   Compressed images
-   Low-bandwidth performance
-   Save drafts locally where appropriate
-   Retry failed submissions safely
-   Clear loading, error and success states

Do not promise complete offline marketplace functionality in the first
release. Prioritize reliable drafts, retries and graceful handling of
poor connectivity.

### 7.4 Role-specific screens

**Farmer** - Browse services - Browse jobs and workers - List produce -
Find buyers - Post farm jobs - Manage bookings, listings and enquiries

**Worker** - Worker onboarding - Skills and location - Browse jobs -
Apply - Manage applications and selected work - Work history and reviews

**Service provider** - Provider onboarding - Business profile - Create
and manage service listings - Set service areas, prices and
availability - Manage booking requests - View reviews and basic activity

**Buyer** - Buyer/business profile - Discover products and suppliers -
Publish purchase requirements - Review seller offers - Manage enquiries
and deals

------------------------------------------------------------------------

## 8. Admin Dashboard

Build a separate web-based admin portal.

### Main areas

1.  Dashboard and marketplace analytics
2.  User and role management
3.  Farmer, worker, provider and buyer profiles
4.  Location hierarchy management
5.  Service categories and listings
6.  Farm jobs and applications
7.  Product categories and listings
8.  Buyer requirements and seller responses
9.  Bookings and enquiries
10. Reviews, reports and complaints
11. Verification workflows
12. Featured listings and promotional placements
13. Subscription and revenue management
14. Notification templates
15. Platform configuration
16. Audit logs and administrator permissions

Admin actions should be permission-controlled and auditable.

------------------------------------------------------------------------

## 9. Technical Architecture

### 9.1 Recommended Stack

  Layer                   Technology
  ----------------------- ------------------------------------------------
  Mobile application      React Native + TypeScript
  Admin web application   Next.js + TypeScript
  Backend                 Node.js + TypeScript
  API                     REST + OpenAPI
  Database                PostgreSQL
  Geospatial queries      PostGIS
  Cache / queues          Redis when required
  Authentication          Mobile OTP and secure sessions
  Media storage           S3-compatible object storage
  Push notifications      Firebase Cloud Messaging
  Maps                    Google Maps or Mappls, subject to evaluation
  AI orchestration        LLM with structured tool/function calling
  Speech                  Evaluated Telugu/English STT and TTS providers
  Monitoring              Structured logs, error tracking and metrics

### 9.2 Architecture Approach

Start with a modular monolith. Keep domain boundaries clear in code and
database design. Split services only when scaling, deployment
independence or team ownership justifies the operational cost.

``` text
AllFarmNeeds
|
|-- apps/
|   |-- mobile/          # React Native app
|   |-- admin/           # Next.js admin portal
|   |-- api/             # Node.js backend
|
|-- packages/
|   |-- shared-types/
|   |-- validation/
|   |-- api-client/
|   |-- location-utils/
|   |-- ui/
|   |-- config/
|
|-- infrastructure/
|-- docs/
```

### 9.3 Backend Domains

-   Identity and authentication
-   Users and roles
-   Farmer, worker, provider and buyer profiles
-   Locations
-   Categories
-   Service listings and service areas
-   Bookings
-   Farm jobs and applications
-   Worker skills and assignments
-   Product catalogue and listings
-   Product enquiries and offers
-   Buyer requirements
-   Negotiations and deal outcomes
-   Conversations and messages
-   Reviews and reports
-   Notifications
-   Media assets
-   Moderation and verification
-   Subscriptions and payments (later)
-   Analytics and audit logs
-   Languages and translations
-   AI conversations and action logs

### 9.4 REST API

Use `/api/v1` as the API base path.

Example endpoint groups:

``` text
/api/v1/auth
/api/v1/users
/api/v1/roles
/api/v1/locations
/api/v1/categories

/api/v1/service-listings
/api/v1/service-listings/{id}/areas
/api/v1/service-bookings

/api/v1/farm-jobs
/api/v1/farm-jobs/{id}/applications
/api/v1/job-applications/{id}/selection

/api/v1/product-listings
/api/v1/product-listings/{id}/enquiries
/api/v1/product-listings/{id}/offers

/api/v1/buyer-requirements
/api/v1/buyer-requirements/{id}/responses

/api/v1/conversations
/api/v1/messages
/api/v1/reviews
/api/v1/reports
/api/v1/notifications

/api/v1/ai/conversations
/api/v1/ai/actions
```

API requirements:

-   Pagination and filtering
-   Server-side validation
-   Role and resource-level authorization
-   Idempotency for consequential operations
-   Rate limits and abuse protection
-   Consistent error responses
-   Audit history for important state changes
-   OpenAPI documentation
-   Versioning and backward compatibility

### 9.5 Database Entity Outline

**Identity** - users - user_roles - farmer_profiles - worker_profiles -
provider_profiles - buyer_profiles - user_locations

**Geography** - states - districts - mandals - villages -
user_service_areas

**Services** - service_categories - provider_listings -
provider_listing_areas - service_pricing - service_availability -
service_bookings - booking_status_history

**Employment** - job_categories - farm_jobs - job_applications -
job_assignments - job_attendance - job_payments - worker_skills

**Products** - product_categories - product_catalogue -
product_listings - product_listing_attributes - product_quantities -
product_enquiries - purchase_offers - product_sales

**Buyers** - buyer_requirements - requirement_products -
seller_responses - purchase_negotiations

**Shared** - conversations - messages - reviews - reports -
notifications - media_assets - subscriptions - payments - audit_logs

**AI and language** - languages - user_language_preferences -
translations - ai_conversations - ai_messages - ai_action_logs -
ai_consent_records - voice_input_metadata

Avoid storing raw audio by default. Store only necessary metadata and
consent records.

------------------------------------------------------------------------

## 10. Non-functional Requirements

Initial targets should be validated through testing and operational
experience.

  -----------------------------------------------------------------------
  Area                                Initial requirement
  ----------------------------------- -----------------------------------
  Performance                         Common API reads should normally
                                      respond within 2 seconds under
                                      expected pilot load

  Availability                        Initial service availability
                                      target: 99.5% monthly

  Security                            HTTPS, secure session handling,
                                      least-privilege access

  Privacy                             Collect only necessary personal and
                                      location data

  Scalability                         Stateless API design where
                                      practical; horizontal scaling path

  Database                            Automated backups and tested
                                      restoration

  Reliability                         Idempotent transactional operations
                                      and safe retry handling

  Accessibility                       Telugu/English, voice, visual
                                      navigation and large controls

  Connectivity                        Compressed media and graceful
                                      low-network behaviour

  Observability                       Logs, errors, metrics and audit
                                      trails
  -----------------------------------------------------------------------

These are planning targets, not existing service guarantees.

------------------------------------------------------------------------

## 11. MVP Scope and Release Strategy

The MVP should prove that the marketplace creates real value. Avoid
building payments, logistics and complex AI advisory before the basic
marketplace works.

### Release 1 --- Marketplace Foundation

-   Mobile OTP authentication
-   Multi-role accounts
-   Farmer, worker, provider and buyer profiles
-   Telangana location hierarchy
-   Service listings and discovery
-   Farm jobs and worker applications
-   Crop/product listings
-   Buyer profiles and purchase requirements
-   Basic enquiries and contact
-   Admin moderation
-   Telugu and English interface
-   Essential Agri Mitra voice flows: create a job, create a product
    listing and search for services

### Release 2 --- Trust and Workflow

-   Booking lifecycle
-   Provider availability
-   Job selection and attendance
-   Partial product quantities
-   Buyer offers and seller responses
-   Reviews and reporting
-   Provider/business verification
-   In-app messaging, if not in Release 1
-   Better matching and notifications

### Release 3 --- Monetization and Operations

-   Provider subscriptions
-   Featured listings
-   Booking commissions
-   Business buyer subscriptions
-   Payment integration after legal and operational review
-   Transport and logistics partnerships
-   Bulk order workflows

### Release 4 --- Advanced Intelligence

-   Crop image assistance
-   Validated agricultural information services
-   Smarter matching and recommendations
-   Market and weather information
-   More automation for repeat workflows
-   Additional Indian languages after user research

Voice-first interaction for core marketplace tasks should be developed
early. Complex advisory AI should come later.

------------------------------------------------------------------------

## 12. Telangana Pilot and Market Validation

Do not launch across all of India immediately. Start with a small,
serviceable geography.

### Pilot approach

-   Select two districts based on field interviews and provider
    availability.
-   Begin with approximately 5--10 villages.
-   Choose a few high-frequency service categories.
-   Manually onboard providers and initial buyers.
-   Support real enquiries and transactions.
-   Expand only after seeing repeat usage and reliable fulfilment.

Rangareddy and Nalgonda are possible pilot candidates, not validated
final choices.

### Interview targets

**Farmers --- target 50 interviews**

Ask: - How do you currently find tractors, labour and other services? -
Which services are hardest to find? - How many people do you call before
finding help? - How often do providers cancel? - How do you sell your
produce? - How do you find buyers? - Would you prefer an app, phone
call, WhatsApp or voice assistant?

**Service providers --- target 30 interviews**

Ask: - How do you currently find customers? - Which villages do you
serve? - How many jobs do you complete monthly? - How do customers
enquire and book? - What causes lost business? - Would you maintain a
digital listing? - Would you pay for qualified leads or measurable
bookings?

**Initial validation targets**

  Metric                                 Target
  ------------------------------------ --------
  Farmer interviews                          50
  Provider interviews                        30
  Providers manually registered             20+
  Active service listings                   50+
  Genuine enquiries                         30+
  Completed transactions                    15+
  Users expressing repeat-use intent        10+

These are proposed learning targets, not market facts or guaranteed
outcomes.

Before the app is ready, use a simple manual operation with a
phone/WhatsApp Business account and a structured spreadsheet. This tests
demand without waiting for software development.

------------------------------------------------------------------------

## 13. Revenue Model

Keep essential farmer and worker access free initially. Test whether
providers and businesses receive measurable value before charging them.

  -----------------------------------------------------------------------
  Revenue stream          Possible model          Timing
  ----------------------- ----------------------- -----------------------
  Basic listings          Free                    Launch

  Premium provider        Test ₹199--499/month    After validation
  listing                                         

  Booking commission      Test 3--7% or fixed fee After reliable bookings

  Featured listings       Paid visibility         After sufficient
                                                  traffic

  Buyer business plans    Subscription            After buyer demand

  Qualified bulk leads    Subscription or lead    Later
                          fee                     

  Relevant advertising    Carefully selected      Later
                          agricultural            
                          advertisers             
  -----------------------------------------------------------------------

All prices and percentages are hypotheses to test, not final pricing
decisions. Make fees transparent and avoid charging for unqualified or
fraudulent leads.

------------------------------------------------------------------------

## 14. Success Metrics

Do not optimize only for app downloads or registrations.

### Primary marketplace metric

**Successful agricultural marketplace interactions per village per
month.**

Examples include: - A farmer successfully finding and using a service. -
A farmer hiring workers and completing the work. - A farmer connecting
with a buyer and recording a sale outcome.

### Supporting metrics

**Services** - Active verified providers - Village coverage - Enquiries
per listing - Provider response time - Booking acceptance and
completion - Cancellation rate - Repeat bookings

**Jobs** - Active jobs - Applications per job - Time to fill vacancies -
Completion rate - Worker repeat participation

**Products and buyers** - Active product listings - Buyer requirements -
Seller responses - Enquiry-to-deal conversion - Partial quantity sold -
Repeat buyers

**Platform** - Active users by role - Telugu versus English usage -
Voice task completion rate - Failed speech recognition rate - Support
and complaint volume - Retention and repeat usage - Revenue per
successful transaction, when monetization begins

------------------------------------------------------------------------

## 15. Risks, Trust and Compliance

Obtain appropriate Indian legal and professional advice before operating
at scale.

Review requirements relating to:

-   Digital personal data protection and privacy
-   Consumer protection and e-commerce obligations
-   Intermediary and user-generated content responsibilities, where
    applicable
-   Labour and employment laws
-   GST, invoicing and tax treatment
-   Food safety and product-specific rules
-   Agricultural market and trading requirements
-   Professional licences and qualifications
-   Drone regulations for drone service providers
-   Payments, refunds and dispute handling
-   Terms of service, privacy policy and grievance processes

Operational safeguards:

-   Clearly distinguish identity verification from service-quality
    verification.
-   Do not guarantee the quality, price or availability of third-party
    listings.
-   Provide a way to report scams, harassment and misleading listings.
-   Keep records of important booking and negotiation changes.
-   Protect users' contact details and exact location.
-   Have a human review path for disputes and moderation decisions.
-   Use consent and clear explanations for AI voice processing.

------------------------------------------------------------------------

## 16. Proposed 90-day Execution Plan

This is a planning estimate for a focused small team. Actual timing
depends on team size, design decisions, integrations and pilot
readiness.

  -----------------------------------------------------------------------
  Period                  Focus                   Deliverables
  ----------------------- ----------------------- -----------------------
  Days 1--14              Validation and product  Interviews, scope, user
                          definition              journeys, data model

  Days 15--35             Core marketplace        Authentication, roles,
                                                  locations, services,
                                                  jobs, products, buyers

  Days 36--50             Workflows               Enquiries,
                                                  applications, booking
                                                  requests, offers,
                                                  notifications

  Days 51--65             Voice assistant         Telugu/English speech
                                                  flows, drafts,
                                                  confirmation, action
                                                  logs

  Days 66--75             Admin and quality       Moderation,
                                                  verification, testing,
                                                  security and
                                                  low-network checks

  Days 76--90             Closed pilot            Onboarding, real
                                                  transactions, feedback
                                                  and iteration
  -----------------------------------------------------------------------

### Suggested team

A lean team may include:

-   Product owner / founder
-   React Native engineer
-   Backend engineer
-   UI/UX designer
-   QA engineer, part-time or shared
-   Telugu-speaking field onboarding/support person
-   AI/speech integration support, as needed

A solo founder can reduce scope and build incrementally, but should not
assume the same 90-day delivery timeline.

------------------------------------------------------------------------

## 17. Immediate Project Checklist

-   [ ] Confirm brand positioning and tagline.
-   [ ] Verify domain ownership, DNS and renewal settings.
-   [ ] Check Indian trademark availability.
-   [ ] Secure consistent social media handles.
-   [ ] Conduct farmer and provider interviews.
-   [ ] Select pilot districts and villages using evidence.
-   [ ] Finalize MVP user journeys.
-   [ ] Create mobile and admin UI designs.
-   [ ] Finalize database schema and API contracts.
-   [ ] Build authentication and multi-role profiles.
-   [ ] Build service marketplace.
-   [ ] Build farm jobs and applications.
-   [ ] Build crop marketplace and buyer requirements.
-   [ ] Build admin portal.
-   [ ] Integrate core Agri Mitra voice tasks.
-   [ ] Test with Telugu-speaking farmers in real conditions.
-   [ ] Onboard providers and buyers.
-   [ ] Run closed pilot and measure completed interactions.

------------------------------------------------------------------------

## 18. Product Decisions to Keep Stable

Unless field research reveals a strong reason to change them:

1.  Product brand is **AllFarmNeeds**.
2.  Domain is **allfarmneeds.com**.
3.  Initial geography is Telangana.
4.  Initial UI languages are Telugu and English only; Urdu is excluded
    at launch.
5.  One unified mobile app supports multiple roles.
6.  A separate web admin portal manages the platform.
7.  Core marketplace areas are services, farm jobs, products and buyer
    requirements.
8.  Agri Mitra is a voice-first task assistant with explicit user
    confirmation.
9.  Start with a modular monolith rather than microservices.
10. Validate demand and successful transactions before broad expansion
    or monetization.

------------------------------------------------------------------------

## 19. Next Recommended Deliverables

Create these as separate engineering artifacts after reviewing this
plan:

1.  Detailed Product Requirements Document (PRD)
2.  User stories and acceptance criteria for each role
3.  Screen inventory and navigation map
4.  Database ERD and SQL schema
5.  REST API specification (OpenAPI)
6.  Admin permissions and moderation workflow
7.  Agri Mitra conversation flows and tool contracts
8.  Pilot operations playbook
9.  Test strategy and release checklist

**Final product principle:** AllFarmNeeds should make agricultural
services, work opportunities and markets easier to access for every
farmer --- including people who prefer speaking over reading or typing.
