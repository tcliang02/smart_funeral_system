# DFD Level 2 - All Processes Mermaid Code
## Smart Funeral Management System

---

## Process 2.0: Manage Tribute Wall & Interactions

```mermaid
flowchart TB
    Guest["Guest Visitor"]
    Email["Email System"]
    
    P2_1["2.1<br>Post Condolence<br>Message"]
    P2_2["2.2<br>Upload Memorial<br>Photo"]
    P2_3["2.3<br>Submit RSVP"]
    P2_4["2.4<br>Moderate<br>Content"]
    
    D5[("D5 | tributes")]
    D6[("D6 | tribute_messages")]
    D7[("D7 | tribute_photos")]
    D8[("D8 | tribute_rsvp")]
    
    %% External to Process
    Guest -- Condolence Message --> P2_1
    Guest -- Memorial Photo --> P2_2
    Guest -- RSVP Response --> P2_3
    
    %% Process to External
    P2_1 -- Message Confirmation --> Guest
    P2_2 -- Photo Confirmation --> Guest
    P2_3 -- RSVP Confirmation --> Guest
    P2_3 -- RSVP Notification --> Email
    Email -- Delivery Status --> P2_3
    
    %% Process to Data Store
    P2_1 -- Read Tribute Info --> D5
    P2_1 -- New Message --> D6
    P2_2 -- Read Tribute Info --> D5
    P2_2 -- New Photo --> D7
    P2_3 -- Read Tribute Info --> D5
    P2_3 -- New RSVP --> D8
    P2_4 -- Read Messages --> D6
    P2_4 -- Read Photos --> D7
    P2_4 -- Approval Status --> D6
    D6 -- Message Data --> P2_4
    D7 -- Photo Data --> P2_4
    
    %% Inter-Process
    P2_1 -. Pending Content .-> P2_4
    P2_2 -. Pending Content .-> P2_4
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Guest:::external
    Email:::external
    P2_1:::process
    P2_2:::process
    P2_3:::process
    P2_4:::process
    D5:::datastore
    D6:::datastore
    D7:::datastore
    D8:::datastore
```

---

## Process 3.0: Manage Service Providers & Reviews

```mermaid
flowchart TB
    Provider["Service Provider"]
    Customer["Customer/Family"]
    
    P3_1["3.1<br>Register Provider"]
    P3_2["3.2<br>Update Provider<br>Profile"]
    P3_3["3.3<br>Manage<br>Availability"]
    P3_4["3.4<br>Submit Review"]
    P3_5["3.5<br>Calculate Rating"]
    P3_6["3.6<br>Track Activity<br>Log"]
    
    D1[("D1 | users")]
    D2[("D2 | service_provider")]
    D3[("D3 | provider_availability")]
    D4[("D4 | profile_activity_log")]
    D16[("D16 | provider_reviews")]
    
    %% External to Process
    Provider -- Login Credentials --> P3_1
    Provider -- Updated Info --> P3_2
    Provider -- Availability Schedule --> P3_3
    Customer -- Review & Rating --> P3_4
    
    %% Process to External
    P3_1 -- Provider Profile --> Provider
    P3_2 -- Update Confirmation --> Provider
    P3_3 -- Schedule Confirmation --> Provider
    P3_4 -- Review Confirmation --> Customer
    P3_5 -- Review Summary --> Provider
    
    %% Process to Data Store
    P3_1 -- New User --> D1
    P3_1 -- New Provider --> D2
    P3_2 -- Updated Profile --> D2
    D2 -- Current Profile --> P3_2
    P3_3 -- Availability Data --> D3
    D3 -- Current Schedule --> P3_3
    P3_4 -- New Review --> D16
    P3_5 -- Read Reviews --> D16
    P3_5 -- Updated Rating --> D2
    P3_6 -- Profile Activity Data --> D4
    D4 -- Profile Activity Data --> P3_6
    
    %% Inter-Process
    P3_1 -. Provider Created .-> P3_6
    P3_2 -. Profile Updated .-> P3_6
    P3_3 -. Schedule Changed .-> P3_6
    P3_4 -. Review Submitted .-> P3_5
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Provider:::external
    Customer:::external
    P3_1:::process
    P3_2:::process
    P3_3:::process
    P3_4:::process
    P3_5:::process
    P3_6:::process
    D1:::datastore
    D2:::datastore
    D3:::datastore
    D4:::datastore
    D16:::datastore
```

---

## Process 4.0: Manage Service Packages & Features

```mermaid
flowchart TB
    Provider["Service Provider"]
    Customer["Customer/Family"]
    
    P4_1["4.1<br>Create Package"]
    P4_2["4.2<br>Edit Package"]
    P4_3["4.3<br>Manage Package<br>Features"]
    P4_4["4.4<br>Activate/Deactivate<br>Package"]
    P4_5["4.5<br>View Package<br>Catalog"]
    
    D2[("D2 | service_provider")]
    D9[("D9 | packages")]
    D10[("D10 | package_features")]
    
    %% External to Process
    Provider -- Package Details --> P4_1
    Provider -- Updated Details --> P4_2
    Provider -- Feature List --> P4_3
    Provider -- Activation Status --> P4_4
    Customer -- Catalog Request --> P4_5
    
    %% Process to External
    P4_1 -- Package Confirmation --> Provider
    P4_2 -- Update Confirmation --> Provider
    P4_3 -- Feature Confirmation --> Provider
    P4_4 -- Status Confirmation --> Provider
    P4_5 -- Package Catalog --> Customer
    
    %% Process to Data Store
    P4_1 -- Read Provider Info --> D2
    P4_1 -- New Package --> D9
    P4_2 -- Updated Package --> D9
    D9 -- Package Data --> P4_2
    P4_3 -- New Features --> D10
    P4_3 -- Package ID --> D9
    D10 -- Feature Data --> P4_3
    P4_4 -- Status Update --> D9
    D9 -- Current Status --> P4_4
    P4_5 -- Read Request --> D9
    D9 -- Package List --> P4_5
    D10 -- Feature List --> P4_5
    
    %% Inter-Process
    P4_1 -. Package Created .-> P4_3
    P4_2 -. Package Updated .-> P4_5
    P4_3 -. Features Added .-> P4_5
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Provider:::external
    Customer:::external
    P4_1:::process
    P4_2:::process
    P4_3:::process
    P4_4:::process
    P4_5:::process
    D2:::datastore
    D9:::datastore
    D10:::datastore
```

---

## Process 5.0: Manage Add-on Catalog & Provider Add-ons

```mermaid
flowchart TB
    Provider["Service Provider"]
    
    P5_1["5.1<br>Create Add-on<br>Category"]
    P5_2["5.2<br>Manage Add-on<br>Templates"]
    P5_3["5.3<br>Assign Add-on<br>to Provider"]
    P5_4["5.4<br>Update Provider<br>Add-on"]
    P5_5["5.5<br>View Add-on<br>Catalog"]
    
    D2[("D2 | service_provider")]
    D11[("D11 | addon_categories")]
    D12[("D12 | addon_templates")]
    D13[("D13 | provider_addons")]
    
    %% External to Process
    Provider -- Category Details --> P5_1
    Provider -- Template Details --> P5_2
    Provider -- Add-on Selection --> P5_3
    Provider -- Updated Add-on --> P5_4
    Provider -- Catalog Request --> P5_5
    
    %% Process to External
    P5_1 -- Category Confirmation --> Provider
    P5_2 -- Template Confirmation --> Provider
    P5_3 -- Assignment Confirmation --> Provider
    P5_4 -- Update Confirmation --> Provider
    P5_5 -- Add-on Catalog --> Provider
    
    %% Process to Data Store
    P5_1 -- New Category --> D11
    P5_2 -- Category ID --> D11
    P5_2 -- New Template --> D12
    D12 -- Template Data --> P5_2
    P5_3 -- Read Provider Info --> D2
    P5_3 -- Template ID --> D12
    P5_3 -- New Add-on --> D13
    P5_4 -- Updated Add-on --> D13
    D13 -- Add-on Data --> P5_4
    P5_5 -- Read Request --> D11
    D11 -- Category List --> P5_5
    D12 -- Template List --> P5_5
    D13 -- Provider Add-ons --> P5_5
    
    %% Inter-Process
    P5_1 -. Category Created .-> P5_2
    P5_2 -. Template Created .-> P5_3
    P5_3 -. Add-on Assigned .-> P5_5
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Provider:::external
    P5_1:::process
    P5_2:::process
    P5_3:::process
    P5_4:::process
    P5_5:::process
    D2:::datastore
    D11:::datastore
    D12:::datastore
    D13:::datastore
```

---

## Process 6.0: Manage Funeral Service Bookings

```mermaid
flowchart TB
    Customer["Customer/Family"]
    Provider["Service Provider"]
    Email["Email System"]
    
    P6_1["6.1<br>Create Booking"]
    P6_2["6.2<br>Select Add-ons"]
    P6_3["6.3<br>Calculate Total"]
    P6_4["6.4<br>Update Booking<br>Status"]
    P6_5["6.5<br>Send<br>Notifications"]
    
    D1[("D1 | users")]
    D2[("D2 | service_provider")]
    D9[("D9 | packages")]
    D13[("D13 | provider_addons")]
    D14[("D14 | bookings")]
    D15[("D15 | booking_addons")]
    
    %% External to Process
    Customer -- Service Booking Request --> P6_1
    Customer -- Add-on Selection --> P6_2
    Provider -- Booking Status Update --> P6_4
    
    %% Process to External
    P6_1 -- Booking Confirmation --> Customer
    P6_2 -- Add-on Confirmation --> Customer
    P6_3 -- Total Amount --> Customer
    P6_4 -- Status Update --> Customer
    P6_4 -- Booking Notifications --> Provider
    P6_4 -- Customer Information --> Provider
    P6_5 -- Booking Notification --> Email
    Email -- Delivery Status --> P6_5
    
    %% Process to Data Store
    P6_1 -- User Info --> D1
    P6_1 -- Read Package Info --> D9
    P6_1 -- Read Provider Info --> D2
    P6_1 -- New Booking --> D14
    P6_2 -- Booking ID --> D14
    P6_2 -- Read Add-on Info --> D13
    P6_2 -- Selected Add-ons --> D15
    P6_3 -- Read Booking --> D14
    P6_3 -- Read Add-ons --> D15
    P6_3 -- Updated Total --> D14
    P6_4 -- Status Update --> D14
    D14 -- Booking Data --> P6_4
    P6_5 -- Read Booking --> D14
    D1 -- User Email --> P6_5
    
    %% Inter-Process
    P6_1 -. Booking Created .-> P6_2
    P6_2 -. Add-ons Selected .-> P6_3
    P6_3 -. Total Calculated .-> P6_5
    P6_4 -. Status Changed .-> P6_5
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Customer:::external
    Provider:::external
    Email:::external
    P6_1:::process
    P6_2:::process
    P6_3:::process
    P6_4:::process
    P6_5:::process
    D1:::datastore
    D2:::datastore
    D9:::datastore
    D13:::datastore
    D14:::datastore
    D15:::datastore
```

---

## Process 7.0: Manage Payments & Refunds

```mermaid
flowchart TB
    Customer["Customer/Family"]
    Payment["Payment Gateway"]
    Email["Email System"]
    
    P7_1["7.1<br>Process Payment"]
    P7_2["7.2<br>Verify Payment"]
    P7_3["7.3<br>Update Payment<br>Status"]
    P7_4["7.4<br>Generate Receipt"]
    P7_5["7.5<br>Process Refund"]
    
    D14[("D14 | bookings")]
    
    %% External to Process
    Customer -- Payment Information --> P7_1
    Customer -- Refund Request --> P7_5
    Payment -- Payment Status --> P7_2
    
    %% Process to External
    P7_1 -- Payment Request --> Payment
    P7_2 -- Verification Result --> P7_3
    P7_4 -- Payment Receipt --> Customer
    P7_4 -- Receipt Email --> Email
    Email -- Delivery Status --> P7_4
    P7_5 -- Refund Confirmation --> Customer
    
    %% Process to Data Store
    P7_1 -- Booking ID --> D14
    D14 -- Booking Amount --> P7_1
    P7_2 -- Read Booking --> D14
    P7_3 -- Payment Status --> D14
    D14 -- Current Status --> P7_3
    P7_4 -- Read Booking --> D14
    P7_5 -- Read Booking --> D14
    P7_5 -- Refund Data --> D14
    
    %% Inter-Process
    P7_1 -. Payment Initiated .-> P7_2
    P7_2 -. Payment Verified .-> P7_3
    P7_3 -. Status Updated .-> P7_4
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Customer:::external
    Payment:::external
    Email:::external
    P7_1:::process
    P7_2:::process
    P7_3:::process
    P7_4:::process
    P7_5:::process
    D14:::datastore
```

---

## Process 8.0: Manage AI Voice Memorial

```mermaid
flowchart TB
    Guest["Guest Visitor"]
    
    P8_1["8.1<br>Create Voice<br>Model"]
    P8_2["8.2<br>Set Personality<br>Traits"]
    P8_3["8.3<br>Store Memories"]
    P8_4["8.4<br>Configure Chat<br>Settings"]
    P8_5["8.5<br>Process Voice<br>Chat"]
    P8_6["8.6<br>Store<br>Conversation"]
    
    D5[("D5 | tributes")]
    D17[("D17 | voice_models")]
    D18[("D18 | personality_traits")]
    D19[("D19 | memories_database")]
    D20[("D20 | voice_chat_settings")]
    D21[("D21 | voice_conversations")]
    
    %% External to Process
    Guest -- Voice Chat Request --> P8_5
    
    %% Process to External
    P8_5 -- AI Voice Response --> Guest
    
    %% Process to Data Store
    P8_1 -- Read Tribute Info --> D5
    P8_1 -- New Voice Model --> D17
    P8_2 -- Voice Model ID --> D17
    P8_2 -- Trait Data --> D18
    P8_3 -- Read Tribute Info --> D5
    P8_3 -- Memory Data --> D19
    P8_4 -- Voice Model ID --> D17
    P8_4 -- Settings Data --> D20
    P8_5 -- Read Tribute Info --> D5
    P8_5 -- Read Voice Model --> D17
    P8_5 -- Read Traits --> D18
    P8_5 -- Read Memories --> D19
    P8_5 -- Read Settings --> D20
    P8_6 -- Conversation Data --> D21
    
    %% Inter-Process
    P8_1 -. Model Created .-> P8_2
    P8_2 -. Traits Set .-> P8_3
    P8_3 -. Memories Stored .-> P8_4
    P8_4 -. Settings Configured .-> P8_5
    P8_5 -. Chat Completed .-> P8_6
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Guest:::external
    P8_1:::process
    P8_2:::process
    P8_3:::process
    P8_4:::phow should i fix my process rocess
    P8_5:::process
    P8_6:::process
    D5:::datastore
    D17:::datastore
    D18:::datastore
    D19:::datastore
    D20:::datastore
    D21:::datastore
```

---

## Summary

✅ **Process 1.0** - Already created in separate file  
✅ **Process 2.0** - 4 sub-processes (Tribute Wall & Interactions) - **Candle feature removed**  
✅ **Process 3.0** - 6 sub-processes (Service Providers & Reviews) - **Includes D4!**  
✅ **Process 4.0** - 5 sub-processes (Packages & Features)  
✅ **Process 5.0** - 5 sub-processes (Add-on Catalog)  
✅ **Process 6.0** - 5 sub-processes (Bookings)  
✅ **Process 7.0** - 5 sub-processes (Payments & Refunds)  
✅ **Process 8.0** - 6 sub-processes (AI Voice Memorial)  

**Total: 41 sub-processes across 8 DFD Level 2 diagrams**

All diagrams are validated against DFD Level 1 for consistency in:
- External entities
- Data stores
- Data flow labels
- Color coding
- Naming conventions
