# DFD Level 2 - Complete Guide
## Smart Funeral Management System
### All 8 Processes Decomposed

**Date:** November 1, 2025

---

## Overview

This guide provides DFD Level 2 diagrams for all 8 processes from Level 1. Each Level 2 diagram shows the detailed sub-processes within each main process.

**Structure:**
- Each Level 1 process (P1.0 - P8.0) gets its own Level 2 diagram
- Sub-processes are numbered: P1.1, P1.2, P1.3, etc.
- Same data stores from Level 1 are used
- Same external entities connect to relevant sub-processes

---

## Table of Contents

1. [DFD Level 2 - Process 1.0: Manage Memorial Tributes](#process-10)
2. [DFD Level 2 - Process 2.0: Manage Tribute Wall & Interactions](#process-20)
3. [DFD Level 2 - Process 3.0: Manage Service Providers & Reviews](#process-30)
4. [DFD Level 2 - Process 4.0: Manage Service Packages & Features](#process-40)
5. [DFD Level 2 - Process 5.0: Manage Add-on Catalog & Provider Add-ons](#process-50)
6. [DFD Level 2 - Process 6.0: Manage Funeral Service Bookings](#process-60)
7. [DFD Level 2 - Process 7.0: Manage Payments & Refunds](#process-70)
8. [DFD Level 2 - Process 8.0: Manage AI Voice Memorial](#process-80)

---

<a name="process-10"></a>
## 1. DFD Level 2 - Process 1.0: Manage Memorial Tributes

### Sub-Processes:

**P1.1** - Authenticate User  
**P1.2** - Create Tribute  
**P1.3** - Edit Tribute  
**P1.4** - View Tributes  
**P1.5** - Manage Privacy Settings  

### External Entities:
- Customer/Family
- Guest Visitor

### Data Stores:
- D1: users
- D5: tributes

### Mermaid Code:

```mermaid
flowchart TB
    Customer["Customer/Family"]
    Guest["Guest Visitor"]
    
    P1_1["1.1<br>Authenticate User"]
    P1_2["1.2<br>Create Tribute"]
    P1_3["1.3<br>Edit Tribute"]
    P1_4["1.4<br>View Tributes"]
    P1_5["1.5<br>Manage Privacy<br>Settings"]
    
    D1[("D1 | users")]
    D5[("D5 | tributes")]
    
    %% External to Process
    Customer -- Login Credentials --> P1_1
    Customer -- Tribute Details --> P1_2
    Customer -- Updated Details --> P1_3
    Customer -- Tribute ID --> P1_4
    Customer -- Privacy Settings --> P1_5
    Guest -- Tribute Search --> P1_4
    
    %% Process to External
    P1_1 -- Auth Token --> Customer
    P1_2 -- Tribute Confirmation --> Customer
    P1_3 -- Update Confirmation --> Customer
    P1_4 -- Public Tributes --> Guest
    P1_4 -- Tribute Details --> Customer
    P1_5 -- Settings Confirmation --> Customer
    
    %% Process to Data Store
    P1_1 -- User Info --> D1
    D1 -- User Info --> P1_1
    P1_2 -- New Tribute --> D5
    P1_2 -- User ID --> D1
    P1_3 -- Updated Tribute --> D5
    D5 -- Tribute Data --> P1_3
    P1_4 -- Read Request --> D5
    D5 -- Tribute Data --> P1_4
    P1_5 -- Privacy Update --> D5
    D5 -- Current Settings --> P1_5
    
    %% Inter-Process
    P1_1 -. Authenticated User .-> P1_2
    P1_1 -. Authenticated User .-> P1_3
    P1_2 -. Tribute Created .-> P1_4
    P1_3 -. Tribute Updated .-> P1_4
    
    classDef external fill:#d4edda,stroke:#28a745,stroke-width:3px
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px
    classDef datastore fill:#fff3cd,stroke:#856404,stroke-width:2px
    
    Customer:::external
    Guest:::external
    P1_1:::process
    P1_2:::process
    P1_3:::process
    P1_4:::process
    P1_5:::process
    D1:::datastore
    D5:::datastore
```

### Lucidchart Instructions:

1. **Title:** "DFD Level 2 - Process 1.0: Manage Memorial Tributes"
2. **External Entities:** Customer/Family (left), Guest Visitor (right)
3. **Sub-Processes:** Draw 5 rounded rectangles labeled 1.1 through 1.5
4. **Data Stores:** D1 (users), D5 (tributes)
5. **Flows:** Follow the arrows from Mermaid code above

---

<a name="process-20"></a>
## 2. DFD Level 2 - Process 2.0: Manage Tribute Wall & Interactions

### Sub-Processes:

**P2.1** - Post Condolence Message  
**P2.2** - Upload Memorial Photo  
**P2.3** - Submit RSVP  
**P2.4** - Moderate Content  

### External Entities:
- Guest Visitor
- Email System

### Data Stores:
- D5: tributes
- D6: tribute_messages
- D7: tribute_photos
- D8: tribute_rsvp

### Mermaid Code:

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
    P2_5:::process
    D5:::datastore
    D6:::datastore
    D7:::datastore
    D8:::datastore
```

---

<a name="process-30"></a>
## 3. DFD Level 2 - Process 3.0: Manage Service Providers & Reviews

### Sub-Processes:

**P3.1** - Register Provider  
**P3.2** - Update Provider Profile  
**P3.3** - Manage Availability  
**P3.4** - Submit Review  
**P3.5** - Calculate Rating  
**P3.6** - Track Activity Log  

### External Entities:
- Service Provider
- Customer/Family

### Data Stores:
- D1: users
- D2: service_provider
- D3: provider_availability
- D4: profile_activity_log
- D16: provider_reviews

### Mermaid Code:

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
    Provider -- Registration Details --> P3_1
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
    P3_6 -- Activity Data --> D4
    D4 -- Activity History --> P3_6
    
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

<a name="process-40"></a>
## 4. DFD Level 2 - Process 4.0: Manage Service Packages & Features

### Sub-Processes:

**P4.1** - Create Package  
**P4.2** - Edit Package  
**P4.3** - Manage Package Features  
**P4.4** - Activate/Deactivate Package  
**P4.5** - View Package Catalog  

### External Entities:
- Service Provider
- Customer/Family

### Data Stores:
- D2: service_provider
- D9: packages
- D10: package_features

### Mermaid Code:

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
    P4_1 -- Provider ID --> D2
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

<a name="process-50"></a>
## 5. DFD Level 2 - Process 5.0: Manage Add-on Catalog & Provider Add-ons

### Sub-Processes:

**P5.1** - Create Add-on Category  
**P5.2** - Manage Add-on Templates  
**P5.3** - Assign Add-on to Provider  
**P5.4** - Update Provider Add-on  
**P5.5** - View Add-on Catalog  

### External Entities:
- Service Provider

### Data Stores:
- D2: service_provider
- D11: addon_categories
- D12: addon_templates
- D13: provider_addons

### Mermaid Code:

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
    P5_2 -- New Template --> D12
    P5_2 -- Category ID --> D11
    D12 -- Template Data --> P5_2
    P5_3 -- Provider ID --> D2
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

<a name="process-60"></a>
## 6. DFD Level 2 - Process 6.0: Manage Funeral Service Bookings

### Sub-Processes:

**P6.1** - Create Booking  
**P6.2** - Select Add-ons  
**P6.3** - Calculate Total  
**P6.4** - Update Booking Status  
**P6.5** - Send Notifications  

### External Entities:
- Customer/Family
- Service Provider
- Email System

### Data Stores:
- D1: users
- D2: service_provider
- D9: packages
- D13: provider_addons
- D14: bookings
- D15: booking_addons

### Mermaid Code:

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
    Customer -- Booking Request --> P6_1
    Customer -- Add-on Selection --> P6_2
    Provider -- Status Update --> P6_4
    
    %% Process to External
    P6_1 -- Booking Reference --> Customer
    P6_2 -- Add-on Confirmation --> Customer
    P6_3 -- Total Amount --> Customer
    P6_4 -- Status Update --> Customer
    P6_4 -- Status Update --> Provider
    P6_5 -- Booking Notification --> Email
    Email -- Delivery Status --> P6_5
    
    %% Process to Data Store
    P6_1 -- User ID --> D1
    P6_1 -- Package ID --> D9
    P6_1 -- Provider ID --> D2
    P6_1 -- New Booking --> D14
    P6_2 -- Booking ID --> D14
    P6_2 -- Add-on IDs --> D13
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

<a name="process-70"></a>
## 7. DFD Level 2 - Process 7.0: Manage Payments & Refunds

### Sub-Processes:

**P7.1** - Process Payment  
**P7.2** - Verify Payment  
**P7.3** - Update Payment Status  
**P7.4** - Generate Receipt  
**P7.5** - Process Refund  

### External Entities:
- Customer/Family
- Payment Gateway
- Email System

### Data Stores:
- D14: bookings

### Mermaid Code:

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
    P7_5 -- Refund Status --> D14
    
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

<a name="process-80"></a>
## 8. DFD Level 2 - Process 8.0: Manage AI Voice Memorial

### Sub-Processes:

**P8.1** - Create Voice Model  
**P8.2** - Set Personality Traits  
**P8.3** - Store Memories  
**P8.4** - Configure Chat Settings  
**P8.5** - Process Voice Chat  
**P8.6** - Store Conversation  

### External Entities:
- Guest Visitor

### Data Stores:
- D5: tributes
- D17: voice_models
- D18: personality_traits
- D19: memories_database
- D20: voice_chat_settings
- D21: voice_conversations

### Mermaid Code:

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
    Guest -- User Message --> P8_5
    
    %% Process to External
    P8_5 -- AI Voice Response --> Guest
    
    %% Process to Data Store
    P8_1 -- Tribute ID --> D5
    P8_1 -- New Voice Model --> D17
    P8_2 -- Voice Model ID --> D17
    P8_2 -- Trait Data --> D18
    P8_3 -- Tribute Context --> D5
    P8_3 -- Memory Data --> D19
    P8_4 -- Voice Model ID --> D17
    P8_4 -- Settings Data --> D20
    P8_5 -- Read Tribute --> D5
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
    P8_4:::process
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

## General Guidelines for Drawing DFD Level 2

### Layout Tips:

1. **Sub-process arrangement:**
   - Arrange in logical flow order (left to right, top to bottom)
   - Group related sub-processes close together

2. **Data stores:**
   - Place near the sub-processes that use them most
   - Can be repeated if used by multiple sub-processes

3. **External entities:**
   - Keep same positions as Level 1
   - Only show entities that interact with this process

4. **Arrows:**
   - Use solid arrows for data flows
   - Use dotted arrows for inter-sub-process flows
   - Label every arrow clearly

### Color Coding:

- **External Entities:** Light Green (#D4EDDA), Border: Dark Green (#28A745)
- **Sub-Processes:** Light Blue (#D1ECF1), Border: Dark Blue (#0C5460)
- **Data Stores:** Light Yellow (#FFF3CD), Border: Dark Yellow (#856404)

### Numbering Convention:

- Process 1.0 → Sub-processes: 1.1, 1.2, 1.3, 1.4, 1.5
- Process 2.0 → Sub-processes: 2.1, 2.2, 2.3, 2.4, 2.5
- And so on...

---

## Summary

You now have 8 complete DFD Level 2 diagrams, one for each Level 1 process:

1. ✅ **P1.0** - 5 sub-processes (Manage Memorial Tributes)
2. ✅ **P2.0** - 4 sub-processes (Manage Tribute Wall & Interactions) - **Candle feature removed**
3. ✅ **P3.0** - 6 sub-processes (Manage Service Providers & Reviews)
4. ✅ **P4.0** - 5 sub-processes (Manage Service Packages & Features)
5. ✅ **P5.0** - 5 sub-processes (Manage Add-on Catalog & Provider Add-ons)
6. ✅ **P6.0** - 5 sub-processes (Manage Funeral Service Bookings)
7. ✅ **P7.0** - 5 sub-processes (Manage Payments & Refunds)
8. ✅ **P8.0** - 6 sub-processes (Manage AI Voice Memorial)

**Total Sub-Processes:** 41

Each diagram can be drawn in Lucidchart using the same techniques from the Level 1 guide, just with sub-processes instead of main processes.

---

**Good luck with your DFD Level 2 diagrams! 🎨**
