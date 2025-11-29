# System Usability Scale (SUS) Questionnaire - Google Form Template

## Instructions for Creating the Google Form

1. Go to https://forms.google.com
2. Create a new form
3. Title: **System Usability Scale (SUS) - Smart Funeral Management System**
4. Copy and paste the sections below exactly as written

---

## Form Header

**Form Title:** System Usability Scale (SUS) - Smart Funeral Management System

**Form Description:**
```
Thank you for participating in this usability evaluation!

IMPORTANT INSTRUCTIONS:
1. Please use the Smart Funeral Management System for at least 30 minutes before completing this questionnaire
2. Access the system at: http://localhost:5173 (or provide your live URL)
3. Try different features: booking, tributes, virtual offerings, dashboard, etc.
4. Answer honestly based on your actual experience with the system

This survey uses the standard System Usability Scale (SUS) methodology and will take approximately 3-5 minutes to complete.
```

---

## Section 1: Respondent Information

**Section Title:** Your Information

### Question 1: User Role
**Type:** Multiple choice (Required)
- Family Member
- Service Provider
- Funeral Attendee/Guest

### Question 2: How long did you explore the system?
**Type:** Multiple choice (Required)
- Less than 30 minutes
- 30-45 minutes
- 45-60 minutes
- More than 60 minutes

---

## Section 2: System Usability Scale (SUS) Questions

**Section Title:** System Usability Scale (SUS) Evaluation

**Section Description:**
```
Please rate your agreement with each statement based on your experience using the Smart Funeral Management System.

Scale:
1 = Strongly Disagree
2 = Disagree
3 = Neutral
4 = Agree
5 = Strongly Agree
```

### Question 3: SUS Question 1
**Type:** Linear scale (1-5, Required)
**Question:** I think that I would like to use this system frequently

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 4: SUS Question 2
**Type:** Linear scale (1-5, Required)
**Question:** I found the system unnecessarily complex

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 5: SUS Question 3
**Type:** Linear scale (1-5, Required)
**Question:** I thought the system was easy to use

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 6: SUS Question 4
**Type:** Linear scale (1-5, Required)
**Question:** I think that I would need the support of a technical person to be able to use this system

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 7: SUS Question 5
**Type:** Linear scale (1-5, Required)
**Question:** I found the various functions in this system were well integrated

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 8: SUS Question 6
**Type:** Linear scale (1-5, Required)
**Question:** I thought there was too much inconsistency in this system

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 9: SUS Question 7
**Type:** Linear scale (1-5, Required)
**Question:** I would imagine that most people would learn to use this system very quickly

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 10: SUS Question 8
**Type:** Linear scale (1-5, Required)
**Question:** I found the system very cumbersome to use

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 11: SUS Question 9
**Type:** Linear scale (1-5, Required)
**Question:** I felt very confident using the system

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

### Question 12: SUS Question 10
**Type:** Linear scale (1-5, Required)
**Question:** I needed to learn a lot of things before I could get going with this system

**Labels:**
- 1: Strongly Disagree
- 5: Strongly Agree

---

## Section 3: Optional Feedback

**Section Title:** Additional Comments (Optional)

### Question 13: What did you like most about the system?
**Type:** Paragraph text (Optional)

### Question 14: What challenges did you face while using the system?
**Type:** Paragraph text (Optional)

### Question 15: Any suggestions for improvement?
**Type:** Paragraph text (Optional)

---

## Form Closing Message

**Confirmation Message:**
```
Thank you for completing the System Usability Scale evaluation!

Your feedback is valuable in assessing the usability of the Smart Funeral Management System. Your responses will be analyzed according to the standard SUS calculation methodology.

If you have any questions, please contact [your email].
```

---

## After Creating the Form

### Step 1: Test the Form
- Preview the form and ensure all questions appear correctly
- Test submitting a response to verify data collection

### Step 2: Distribution Strategy
You need 20 respondents distributed as follows:
- **8 Family Members** - People who would use booking, tributes, AI features
- **7 Service Providers** - People who would manage packages, bookings, dashboard
- **5 Funeral Attendees** - People who would use RSVP, virtual offerings, guest features

### Step 3: Data Collection Timeline
- Week 14 of development (as stated in Chapter 6)
- Give respondents 1-2 days to explore the system
- Collect responses within 3-5 days

### Step 4: Calculate SUS Scores
Use the formula in Section 6.4.2 of your CHAPTER_6_TESTING.md:
1. For odd questions (1,3,5,7,9): subtract 1 from user response
2. For even questions (2,4,6,8,10): subtract user response from 5
3. Sum all converted scores
4. Multiply by 2.5 to get final SUS score (0-100)

### Step 5: Analyze Results
- Calculate individual SUS scores for all 20 respondents
- Calculate average by user role (Family Members, Service Providers, Attendees)
- Calculate overall average
- Compare against the 68 threshold (above = good usability)

---

## Google Form Link

After creating the form, save the shareable link here:
- **Form Link:** [Insert your Google Form link here]
- **Response Spreadsheet:** [Link to your Google Sheets with responses]

---

## Quick Setup Checklist

- [ ] Create Google Form with title and description
- [ ] Add Section 1: Respondent Information (2 questions)
- [ ] Add Section 2: SUS Questions 1-10 (10 linear scale questions, 1-5)
- [ ] Add Section 3: Optional Feedback (3 paragraph questions)
- [ ] Set form to require sign-in or allow anonymous responses
- [ ] Test form by submitting a sample response
- [ ] Get shareable link
- [ ] Create response collection spreadsheet
- [ ] Distribute to 20 target respondents
- [ ] Collect responses during Week 14
- [ ] Calculate SUS scores using the formula
- [ ] Update Chapter 6 with actual results

---

## Notes

⚠️ **CRITICAL REMINDERS:**
1. The 10 SUS questions MUST use the exact wording provided - no modifications
2. The scale MUST be 1-5 (Strongly Disagree to Strongly Agree)
3. Users MUST test the LIVE SYSTEM for 30+ minutes before responding
4. You need exactly 20 respondents with the specified role distribution
5. This is different from your Chapter 4 requirements survey (that one stays separate)
