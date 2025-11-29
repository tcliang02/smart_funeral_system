# 🎓 How to Train Your AI Grief Support Model

## ✅ What I Just Fixed:

### **1. Strict Conversation Rules**
Changed the AI prompt to be MUCH more strict:
- ✅ Maximum 1-2 sentences (20-40 words)
- ✅ Casual, natural language (not essays)
- ✅ Specific examples of good vs bad responses
- ✅ First-person perspective ("I miss you too" not "The deceased would say...")

### **2. Token Limits**
- ✅ Reduced max tokens from 1000 → 100 (forces shorter responses)
- ✅ Increased temperature from 0.8 → 0.9 (more natural/creative)

### **3. Conversation Memory**
- ✅ AI now remembers last 5 messages in conversation
- ✅ Responses feel more connected and natural
- ✅ Can reference what was just discussed

---

## 🎯 How to "Train" Your Model (Data Collection)

The AI learns from the **memories and personality traits** you provide. Here's how to do it right:

### **Step 1: Add Quality Personality Traits**

Good examples:
```
Category: Speaking Style
Value: "Spoke with a Southern accent, used phrases like 'bless your heart' and 'y'all'"

Category: Humor
Value: "Had a dry wit, loved puns, laughed at own jokes"

Category: Values
Value: "Family first, deeply religious, believed in hard work"

Category: Habits
Value: "Started every morning with coffee, hummed while cooking"
```

Bad examples (too vague):
```
Category: Personality
Value: "Nice person"  ❌ Too generic

Category: Traits  
Value: "Good"  ❌ No useful info
```

### **Step 2: Add Specific Memories**

Good examples:
```
Memory Type: Family Story
Text: "Every Sunday, Dad would make his famous pancakes shaped like Mickey Mouse ears. He'd flip them high in the air to make us laugh, even though Mom said he was making a mess."

Memory Type: Personal Quirk
Text: "She couldn't walk past a dog without stopping to pet it. Once spent 20 minutes talking to a stranger's corgi about how 'distinguished' it looked."

Memory Type: Life Lesson
Text: "Always said 'If you're going to do something, do it right the first time.' Taught me to take pride in my work, no matter how small."
```

Bad examples (too generic):
```
Memory Type: General
Text: "Was a good father"  ❌ No specific details

Memory Type: Life
Text: "Liked sports"  ❌ Too vague, which sports? How?
```

### **Step 3: Test Different Conversation Types**

Try these test messages to see if the AI responds naturally:

**Emotional:**
- "I miss you so much, Dad"
- "I wish you were here to see your grandkids"
- "Today was hard without you"

**Memory-Based:**
- "Remember when we went fishing?"
- "Tell me about your favorite holiday"
- "What was your proudest moment?"

**Casual:**
- "How are you?"
- "What do you think about..."
- "I have some news to share"

**Expected Response Style:**
- ✅ "I miss you too, sweetheart. You know I'm always with you." (1 sentence, warm)
- ❌ "I miss you too. It must be difficult without me. I remember when we used to..." (Too long, essay-like)

---

## 🔧 Adjusting the AI Personality

### **Make it More Casual:**
```php
define('DEEPSEEK_TEMPERATURE', 1.0);  // More creative/casual
```

### **Make it More Formal:**
```php
define('DEEPSEEK_TEMPERATURE', 0.7);  // More focused/serious
```

### **Make Responses Even Shorter:**
```php
define('DEEPSEEK_MAX_TOKENS', 50);   // ~20 words max
```

### **Allow Longer Responses:**
```php
define('DEEPSEEK_MAX_TOKENS', 150);  // ~60 words max
```

---

## 📊 Quality Checklist

Before launching to users, test that:

✅ Responses are 1-2 sentences (not paragraphs)  
✅ AI speaks in first person ("I remember..." not "They remembered...")  
✅ Tone matches the personality traits  
✅ AI remembers context from previous messages  
✅ Responses feel warm and authentic  
✅ No robotic or formal language  
✅ References specific memories when relevant  

---

## 💡 Pro Tips

### **1. Add More Memories Over Time**
- The more specific memories you add, the more personalized responses become
- Aim for at least 10-15 good memories per person

### **2. Include Speech Patterns**
Add traits like:
- "Often said 'you betcha' and 'for crying out loud'"
- "Called everyone 'kiddo' or 'sport'"
- "Had a habit of clearing throat before important statements"

### **3. Add Emotional Context**
- "Got teary-eyed when talking about grandkids"
- "Laughed loudly at bad jokes"
- "Voice got soft when sharing serious advice"

### **4. Test with Real Users**
Ask family members to chat and give feedback:
- Does it sound like them?
- Is the tone right?
- Are responses too long/short?

---

## 🎬 Example Training Session

**Step 1:** Add these traits
```
Speaking Style: "Used sports metaphors constantly, called life a 'game of inches'"
Humor: "Self-deprecating, made jokes about balding and getting old"
Values: "Believed in second chances, said 'everyone deserves a comeback'"
```

**Step 2:** Add these memories
```
"Coached Little League for 15 years. Famous for the 'ice cream after losses' tradition."
"Proposed to Mom at a baseball game, message on the jumbotron"
"Every Saturday morning, watched sports highlights while drinking coffee"
```

**Step 3:** Test chat
- User: "I miss watching baseball with you"
- AI: "Those Saturday mornings were the best. Did the Yankees win today?"
- ✅ SHORT, personal, references shared memory

---

## 🚀 You're Ready!

The AI is now configured to give natural, conversational responses instead of essays. 

**Try it now** and let me know if responses are still too long! 🎉
