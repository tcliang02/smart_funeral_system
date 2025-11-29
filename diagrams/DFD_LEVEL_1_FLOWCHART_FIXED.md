---
config:
  layout: elk
---
flowchart TB
    Customer["Customer/Family"]
    Provider["Service Provider"]
    Guest["Guest Visitor"]
    Payment["Payment Gateway"]
    Email["Email System"]
    
    P1(["1.0<br>Manage Memorial Tributes"])
    P2(["2.0<br>Manage Tribute Wall & Interactions"])
    P3(["3.0<br>Manage Service Providers & Reviews"])
    P4(["4.0<br>Manage Service Packages & Features"])
    P5(["5.0<br>Manage Add-on Catalog & Provider Add-ons"])
    P6(["6.0<br>Manage Funeral Service Bookings"])
    P7(["7.0<br>Manage Payments & Refunds"])
    P8(["8.0<br>Manage AI Voice Memorial"])
    
    %% External Entity to Process Flows
    Customer -- Login Credentials --> P1
    Customer -- Tribute Details --> P1
    Customer -- Service Booking Request --> P6
    Customer -- Payment Information --> P7
    Customer -- Review & Rating --> P3
    Provider -- Login Credentials --> P3
    Provider -- Availability Schedule --> P3
    Provider -- Package Details --> P4
    Provider -- Add-on Details --> P5
    Provider -- Booking Status Update --> P6
    Guest -- Tribute Search --> P1
    Guest -- Condolence Message --> P2
    Guest -- Memorial Photo --> P2
    Guest -- RSVP Response --> P2
    Guest -- Voice Chat Request --> P8
    
    %% Process to External Entity Flows
    P1 -- Tribute Confirmation --> Customer
    P6 -- Booking Confirmation --> Customer
    P7 -- Payment Receipt --> Customer
    P3 -- Provider Details --> Customer
    P4 -- Package Catalog --> Customer
    P3 -- Provider Profile --> Provider
    P6 -- Booking Notifications --> Provider
    P6 -- Customer Information --> Provider
    P3 -- Review Summary --> Provider
    P1 -- Public Tributes --> Guest
    P2 -- Tribute Wall --> Guest
    P2 -- Photo Gallery --> Guest
    P2 -- RSVP Confirmation --> Guest
    P8 -- AI Voice Response --> Guest
    
    %% External System Flows
    P7 -- Payment Request --> Payment
    Payment -- Payment Status --> P7
    P6 -- Booking Notifications --> Email
    P7 -- Payment Receipts --> Email
    P2 -- RSVP Confirmations --> Email
    Email -- Delivery Status --> P6
    
    %% Data Stores
    D1[("D1 | users")]
    D2[("D2 | service_provider")]
    D3[("D3 | provider_availability")]
    D4[("D4 | profile_activity_log")]
    D5[("D5 | tributes")]
    D6[("D6 | tribute_messages")]
    D7[("D7 | tribute_photos")]
    D8[("D8 | tribute_rsvp")]
    D9[("D9 | packages")]
    D10[("D10 | package_features")]
    D11[("D11 | addon_categories")]
    D12[("D12 | addon_templates")]
    D13[("D13 | provider_addons")]
    D14[("D14 | bookings")]
    D15[("D15 | booking_addons")]
    D16[("D16 | provider_reviews")]
    D17[("D17 | voice_models")]
    D18[("D18 | personality_traits")]
    D19[("D19 | memories_database")]
    D20[("D20 | voice_chat_settings")]
    D21[("D21 | voice_conversations")]
    
    %% Process to Data Store Flows - P1.0
    P1 -- User Info --> D1
    D1 -- User Info --> P1
    P1 -- Tribute Data --> D5
    D5 -- Tribute Data --> P1
    
    %% Process to Data Store Flows - P2.0
    P2 -- Read Tribute Info --> D5
    P2 -- Message Data --> D6
    D6 -- Message Data --> P2
    P2 -- Photo Data --> D7
    D7 -- Photo Data --> P2
    P2 -- RSVP Data --> D8
    D8 -- RSVP Data --> P2
    
    %% Process to Data Store Flows - P3.0
    P3 -- User Info --> D1
    D1 -- User Info --> P3
    P3 -- Provider Data --> D2
    D2 -- Provider Data --> P3
    P3 -- Availability Data --> D3
    D3 -- Availability Data --> P3
    P3 -- Profile Activity Data --> D4
    D4 -- Profile Activity Data --> P3
    P3 -- Review Data --> D16
    D16 -- Review Data --> P3
    
    %% Process to Data Store Flows - P4.0
    P4 -- Read Provider Info --> D2
    P4 -- Package Data --> D9
    D9 -- Package Data --> P4
    P4 -- Feature Data --> D10
    D10 -- Feature Data --> P4
    
    %% Process to Data Store Flows - P5.0
    P5 -- Read Provider Info --> D2
    P5 -- Category Data --> D11
    D11 -- Category Data --> P5
    P5 -- Template Data --> D12
    D12 -- Template Data --> P5
    P5 -- Provider Add-on Data --> D13
    D13 -- Provider Add-on Data --> P5
    
    %% Process to Data Store Flows - P6.0
    P6 -- User Info --> D1
    D1 -- User Info --> P6
    P6 -- Read Provider Info --> D2
    P6 -- Read Package Info --> D9
    P6 -- Read Add-on Info --> D13
    P6 -- Booking Data --> D14
    D14 -- Booking Data --> P6
    P6 -- Booking Add-on Data --> D15
    D15 -- Booking Add-on Data --> P6
    
    %% Process to Data Store Flows - P7.0
    P7 -- Payment Status --> D14
    D14 -- Refund Data --> P7
    
    %% Process to Data Store Flows - P8.0
    P8 -- Read Tribute Info --> D5
    P8 -- Voice Model Data --> D17
    D17 -- Voice Model Data --> P8
    P8 -- Trait Data --> D18
    D18 -- Trait Data --> P8
    P8 -- Memory Data --> D19
    D19 -- Memory Data --> P8
    P8 -- Settings Data --> D20
    D20 -- Settings Data --> P8
    P8 -- Conversation Data --> D21
    D21 -- Conversation Data --> P8
    
    %% Inter-Process Flows
    P1 -. Tribute Information .-> P2
    P1 -. Tribute Information .-> P8
    P3 -. Provider Information .-> P4
    P3 -. Provider Information .-> P5
    P4 -. Package Information .-> P6
    P5 -. Add-on Information .-> P6
    P6 -. Booking Information .-> P7
    P6 -. Booking Information .-> P3
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px,color:#000
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,color:#000
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px,color:#000
    Customer:::external
    Provider:::external
    Guest:::external
    Payment:::external
    Email:::external
    P1:::process
    P2:::process
    P3:::process
    P4:::process
    P5:::process
    P6:::process
    P7:::process
    P8:::process
    D1:::datastore
    D2:::datastore
    D3:::datastore
    D4:::datastore
    D5:::datastore
    D6:::datastore
    D7:::datastore
    D8:::datastore
    D9:::datastore
    D10:::datastore
    D11:::datastore
    D12:::datastore
    D13:::datastore
    D14:::datastore
    D15:::datastore
    D16:::datastore
    D17:::datastore
    D18:::datastore
    D19:::datastore
    D20:::datastore
    D21:::datastore
