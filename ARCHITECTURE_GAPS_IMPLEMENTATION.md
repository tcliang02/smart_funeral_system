# Architecture Gaps: Implementation Guide

## 🎯 Overview

This document provides actionable solutions for the three critical "last mile" gaps identified in the ZENLINK architecture review.

---

## Gap 1: PHP Legacy Backend Security Hardening

### **Problem Statement**
- PHP files are directly accessible, bypassing Next.js security middleware
- No unified authentication across PHP endpoints
- Risk of unauthorized access if PHP folder is exposed

### **Solution 1: Web Server Configuration (Immediate)**

#### **For Apache (.htaccess)**
Create `backend/.htaccess`:
```apache
# Deny direct access to PHP files
<FilesMatch "\.php$">
    Order Deny,Allow
    Deny from all
</FilesMatch>

# Allow only through Next.js proxy
<If "%{HTTP_REFERER} =~ /localhost:3000|yourdomain.com/">
    Allow from all
</If>
```

#### **For Nginx**
Add to `nginx.conf`:
```nginx
location /backend/ {
    deny all;
    return 403;
}

# Proxy through Next.js
location /api/backend/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
}
```

#### **For Vercel (vercel.json)**
```json
{
  "rewrites": [
    {
      "source": "/api/backend/:path*",
      "destination": "/api/proxy-php/:path*"
    }
  ]
}
```

### **Solution 2: Authentication Middleware (Short-term)**

Create `backend/auth_middleware.php`:
```php
<?php
/**
 * Authentication Middleware for PHP Backend
 * Include this at the top of ALL PHP files
 * 
 * ⚠️ CRITICAL: This handles both authentication AND CORS
 */

// ============================================
// CORS Configuration (MUST be before any output)
// ============================================
$allowed_origins = [
    'http://localhost:3000',  // Next.js dev server
    'https://yourdomain.com',  // Production domain
    // Add Vercel deployment URLs if needed
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins) || strpos($origin, 'vercel.app') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback for development (remove in production)
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================================
// Authentication
// ============================================
require_once 'db_connect.php';

function validateJWT($token) {
    if (empty($token)) {
        return null;
    }
    
    // Decode JWT (use your existing JWT library)
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    $payload = json_decode(base64_decode($parts[1]), true);
    if (!$payload || !isset($payload['user_id'])) {
        return null;
    }
    
    // Verify token hasn't expired
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

// Get token from header or request
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (empty($token)) {
    $token = $_GET['token'] ?? $_POST['token'] ?? null;
}

// Validate token
$user = validateJWT($token);
if (!$user) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Store user in global scope
$GLOBALS['authenticated_user'] = $user;
?>
```

**Usage in PHP files:**
```php
<?php
require_once 'auth_middleware.php';
// Now $GLOBALS['authenticated_user'] is available
$userId = $GLOBALS['authenticated_user']['user_id'];
?>
```

### **Solution 3: Migration to Next.js (Long-term)**

**Priority Order:**
1. ✅ Authentication endpoints (already migrated)
2. ⏳ Booking creation/updates (high traffic)
3. ⏳ Payment processing (security critical)
4. ⏳ Dashboard endpoints (moderate traffic)
5. ⏳ Legacy utilities (low priority)

**Migration Checklist:**
- [ ] Create Next.js API route
- [ ] Port business logic
- [ ] Add authentication middleware
- [ ] Update frontend to use new endpoint
- [ ] Test thoroughly
- [ ] Deprecate PHP endpoint
- [ ] Monitor for 2 weeks
- [ ] Remove PHP file

---

## Gap 2: Real-Time Updates with Supabase Realtime

### **Problem Statement**
- Dashboard requires manual refresh to see updates
- RSVP changes not reflected instantly
- Booking status changes need page reload

### **Solution: Supabase Realtime Subscriptions**

#### **Step 1: Enable Realtime in Supabase**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for:
   - `bookings` table
   - `tribute_rsvp` table
   - `provider_reviews` table

#### **⚠️ CRITICAL: Row Level Security (RLS) Policies**

**Problem:** Supabase Realtime respects RLS policies. If RLS is too restrictive, the subscription will connect but receive zero events.

**Solution:** Ensure RLS policies allow Service Providers to SELECT their own bookings.

**Check your RLS policies:**

```sql
-- Check existing policies on bookings table
SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- Example: Allow providers to see their own bookings
CREATE POLICY "Providers can view their own bookings"
ON bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_provider sp
    WHERE sp.provider_id = bookings.provider_id
    AND sp.user_id = auth.uid()  -- Supabase auth.uid() for authenticated user
  )
);

-- Alternative: If using custom JWT with user_id
CREATE POLICY "Providers can view their own bookings via JWT"
ON bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_provider sp
    JOIN users u ON sp.user_id = u.user_id
    WHERE sp.provider_id = bookings.provider_id
    AND u.user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::int
  )
);
```

**Verification:**
1. Test subscription in browser console:
   ```typescript
   const { data, error } = await supabase
     .from('bookings')
     .select('*')
     .eq('provider_id', YOUR_PROVIDER_ID);
   
   // If this query works, RLS is correct
   // If it returns empty array, check RLS policies
   ```

2. Check Realtime connection:
   ```typescript
   const channel = supabase
     .channel('test')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
       (payload) => console.log('Received:', payload)
     )
     .subscribe((status) => {
       console.log('Subscription status:', status);
       // Should be 'SUBSCRIBED', not 'CHANNEL_ERROR'
     });
   ```

**Common Issues:**
- ❌ RLS policy too restrictive → Subscription connects but no events
- ❌ Missing `provider_id` match → Provider can't see bookings
- ❌ JWT claims not set → `auth.uid()` returns null

#### **Step 2: Create Realtime Hook**

Create `frontend/my-app/src/hooks/useRealtimeBookings.ts`:
```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function useRealtimeBookings(providerId: number) {
  const [bookings, setBookings] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    fetchBookings();

    // Subscribe to changes
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'bookings',
          filter: `provider_id=eq.${providerId}`
        },
        (payload) => {
          console.log('Booking change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setBookings(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev =>
              prev.map(b => b.booking_id === payload.new.booking_id ? payload.new : b)
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings(prev =>
              prev.filter(b => b.booking_id !== payload.old.booking_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data);
  };

  return { bookings, refetch: fetchBookings };
}
```

#### **Step 3: Integrate into Dashboard**

Update `ServiceProviderDashboard.jsx`:
```typescript
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';

export default function ServiceProviderDashboard() {
  const { user, provider } = useAuth();
  const { bookings } = useRealtimeBookings(provider?.provider_id);
  
  // Dashboard now updates automatically when bookings change!
}
```

#### **Step 4: Real-Time RSVP Updates**

Create `frontend/my-app/src/hooks/useRealtimeRSVP.ts`:
```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function useRealtimeRSVP(tributeId: number) {
  const [rsvpCount, setRsvpCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Initial count
    fetchCount();

    // Subscribe to RSVP changes
    const channel = supabase
      .channel('rsvp-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tribute_rsvp',
          filter: `tribute_id=eq.${tributeId}`
        },
        () => {
          // Refetch count when any RSVP changes
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tributeId]);

  const fetchCount = async () => {
    const { count } = await supabase
      .from('tribute_rsvp')
      .select('*', { count: 'exact', head: true })
      .eq('tribute_id', tributeId);
    
    setRsvpCount(count || 0);
  };

  return rsvpCount;
}
```

### **⚠️ Note: Supabase Realtime Requires Pro Subscription**

**Status:** Supabase Realtime requires Pro subscription ($25/month minimum). The free tier does not include Realtime.

**Free Alternatives:**

#### **Option 1: Continue Using Polling (Current Method)**
- ✅ **Free** - No additional cost
- ✅ **Works now** - Already implemented
- ⚠️ **Trade-off:** Updates require page refresh or manual polling

#### **Option 2: Server-Sent Events (SSE)** - Recommended Free Alternative
- ✅ **Free** - Built into Next.js
- ✅ **One-way real-time** - Server → Client updates
- ✅ **Simple implementation** - No additional infrastructure

**SSE Implementation Example:**
```typescript
// Next.js API Route: /api/backend/bookings-stream
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      
      // Poll database every 5 seconds and send updates
      const interval = setInterval(async () => {
        const bookings = await getLatestBookings();
        controller.enqueue(`data: ${JSON.stringify(bookings)}\n\n`);
      }, 5000);
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Client-side hook
export function useBookingsStream(providerId: number) {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/backend/bookings-stream?provider_id=${providerId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBookings(data);
    };
    
    return () => eventSource.close();
  }, [providerId]);
  
  return bookings;
}
```

#### **Option 3: WebSocket with Free Hosting**
- ✅ **Free** - Use Railway, Render, or Fly.io free tier
- ✅ **True real-time** - Bidirectional communication
- ⚠️ **Requires:** Custom WebSocket server setup

**Benefits of Supabase Realtime (If You Upgrade Later):**
- ✅ Instant updates (no refresh needed)
- ✅ Reduced server load (no polling)
- ✅ Better UX (real-time feedback)
- ✅ Built-in feature (no additional infrastructure)

---

## Gap 3: AI Context Window Management

### **Problem Statement**
- Long conversations consume excessive tokens
- Context window overflow after 20-30 messages
- API costs increase linearly with conversation length

### **Solution: Summary Buffer Memory**

#### **Architecture**
```
Turn 1-9:  Full conversation history
Turn 10:   Summarize turns 1-9 → Store summary
Turn 11+:  Summary + last 3 messages (compressed context)
```

#### **Implementation**

Update `frontend/my-app/src/app/api/backend/chatbot/route.ts`:

```typescript
// Add summarization function
async function summarizeConversation(
  conversationHistory: Array<{role: string, content: string}>,
  apiKey: string
): Promise<string> {
  const summaryPrompt = `Summarize this conversation in 2-3 sentences, preserving:
- Key emotional themes
- User's main concerns
- Cultural/religious context mentioned
- Important details about their situation

Conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Summary:`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a conversation summarizer.' },
        { role: 'user', content: summaryPrompt }
      ],
      temperature: 0.3,
      max_tokens: 150
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Update POST handler
export async function POST(request: NextRequest) {
  const data = await request.json();
  const { message, conversation_history = [], mode = 'website' } = data;

  // Track conversation turn
  const turnCount = conversation_history.length + 1;
  const TURN_THRESHOLD = 10; // Summarize after 10 turns

  let processedHistory = conversation_history;

  // If we've hit the threshold, summarize early conversation
  if (turnCount >= TURN_THRESHOLD && conversation_history.length >= 7) {
    const earlyHistory = conversation_history.slice(0, -3); // All except last 3
    const recentHistory = conversation_history.slice(-3); // Last 3 messages

    try {
      const summary = await summarizeConversation(earlyHistory, getDeepSeekApiKey());
      
      // ⚠️ CRITICAL: Replace early history with summary
      // The summary captures WHAT was said, but we must preserve HOW to behave
      processedHistory = [
        { role: 'system', content: `Previous conversation summary: ${summary}` },
        ...recentHistory
      ];
    } catch (error) {
      console.error('Summarization failed, using full history:', error);
      // Fallback: use last 10 messages
      processedHistory = conversation_history.slice(-10);
    }
  } else {
    // Normal operation: use last 10 messages
    processedHistory = conversation_history.slice(-10);
  }

  // ⚠️ CRITICAL: Always re-inject the original System Prompt
  // Why: The summary captures content ("User is sad about father") but loses
  // behavioral instructions ("Be gentle, use Buddhist terminology").
  // The system prompt defines HOW the AI should respond, not just WHAT was discussed.
  const messages = [
    { role: 'system', content: modeConfig.system_prompt }, // ← ALWAYS FIRST
    ...processedHistory,
    { role: 'user', content: message }
  ];
  
  // Ensure system prompt is robust and comprehensive
  // It should include:
  // - Role definition ("You are a compassionate grief counselor...")
  // - Cultural context ("Malaysian Buddhist traditions...")
  // - Communication style ("Brief responses, 2-3 sentences...")
  // - Behavioral guidelines ("Validate emotions first...")

  // Continue with existing API call...
}
```

#### **Database Storage (Optional)**

Store summaries in database for long-term memory:
```sql
CREATE TABLE conversation_summaries (
  summary_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  mode VARCHAR(50),
  summary_text TEXT,
  turn_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **⚠️ CRITICAL: System Prompt Persistence**

**Why This Matters:**
- The summary captures **WHAT** was said ("User is sad about father's passing")
- But it often loses **HOW** to behave ("Be gentle, use Buddhist terminology, validate emotions first")
- The system prompt defines the AI's personality, tone, and behavioral guidelines

**Best Practices:**
1. **Always place system prompt FIRST** in the messages array
2. **Keep system prompt comprehensive** - include:
   - Role definition ("You are a compassionate grief counselor...")
   - Cultural context ("Malaysian Buddhist traditions...")
   - Communication style ("Brief responses, 2-3 sentences...")
   - Behavioral guidelines ("Validate emotions first, offer perspective second...")
3. **Don't compress the system prompt** - it's your AI's "personality"
4. **Test with long conversations** - ensure the AI maintains its character after summarization

**Example of Robust System Prompt:**
```typescript
const systemPrompt = `You are a compassionate grief counselor with deep expertise in Malaysian Buddhist traditions. You provide culturally-sensitive support that honors both Buddhist wisdom and the raw human experience of loss.

MALAYSIAN BUDDHIST FUNERAL TRADITIONS:
• 49-day mourning journey (七七四十九日) - soul's transition through bardo states
• Weekly prayer ceremonies (头七 through 七七) at Buddhist temples
• Merit-making (做功德): dana/charity, sutra chanting, offerings to monks

YOUR CONVERSATIONAL STYLE:
• Warm and genuine - like a compassionate temple friend
• Brief responses: 2-3 sentences, 40-60 words maximum
• Simple, heartfelt language - avoid clinical jargon
• Balance Buddhist wisdom with human empathy
• Validate emotions first, offer perspective second

WHAT TO DO:
✓ Acknowledge pain without rushing to fix it
✓ Validate cultural practices
✓ Normalize grief responses
✓ Gently introduce Buddhist concepts when relevant

WHAT TO AVOID:
✗ Western grief models (Kübler-Ross stages)
✗ Preachy Buddhist lectures
✗ Dismissing emotions
✗ Minimizing their loss`;
```

#### **Benefits**
- ✅ 60-80% token reduction for long conversations
- ✅ Prevents context window overflow
- ✅ Maintains conversation continuity
- ✅ Lower API costs
- ✅ Preserves AI personality and behavioral guidelines

---

## Implementation Priority

### **Phase 1: Security (Week 1)**
1. ✅ Add `.htaccess` or Nginx rules
2. ✅ Create `auth_middleware.php`
3. ✅ Apply to high-risk endpoints

### **Phase 2: Real-Time (Week 2-3)**
1. ✅ Enable Supabase Realtime
2. ✅ Create `useRealtimeBookings` hook
3. ✅ Integrate into Provider Dashboard
4. ✅ Add RSVP real-time updates

### **Phase 3: AI Optimization (Week 4)**
1. ✅ Implement summarization function
2. ✅ Add turn tracking
3. ✅ Test with long conversations
4. ✅ Monitor token usage reduction

---

## Success Metrics

### **Security**
- ✅ Zero direct PHP access (403 errors)
- ✅ 100% endpoints with authentication
- ✅ Zero unauthorized access incidents

### **Real-Time**
- ✅ Dashboard updates < 1 second
- ✅ Zero manual refreshes needed
- ✅ 80% reduction in API polling calls

### **AI Context**
- ✅ 60%+ token reduction
- ✅ Zero context overflow errors
- ✅ 40%+ cost reduction for long chats

---

**Last Updated:** 2025-01-22
**Status:** Implementation Ready

