# SUBSIDIA SKILLS ANALYSIS & REQUIREMENTS

## 📋 SUBSIDIA BUSINESS REQUIREMENTS

### **Core Functions Needed:**
1. **Subsidy Research** - Web search, Spanish document analysis
2. **Document Generation** - PDF reports, application forms
3. **Database Management** - Subsidy program database
4. **Client Communication** - Email, SMS, follow-ups
5. **Payment Processing** - Stripe integration
6. **Deadline Tracking** - Calendar, reminders
7. **API Integration** - Government portals, data sources
8. **Code Development** - Web app, matching engine

## 🔍 AVAILABLE OPENCLAW SKILLS ANALYSIS

### **✅ ALREADY AVAILABLE:**
1. **coding-agent** - For SubsidIA web app development
2. **web_search** - For subsidy research (needs Gemini API key fix)
3. **openai-whisper-api** - Audio transcription (already configured)

### **📋 NEED TO INSTALL/ENABLE:**

#### **PRIORITY 1: DOCUMENT GENERATION**
- **nano-pdf** - PDF editing/generation
- **Install:** `uv install nano-pdf`

#### **PRIORITY 2: EMAIL COMMUNICATION**
- **himalaya** - Email management (client follow-ups)
- **Install:** `brew install himalaya` or alternative

#### **PRIORITY 3: CALENDAR/REMINDERS**
- **apple-reminders** or **things-mac** - Deadline tracking
- Need to check system compatibility

#### **PRIORITY 4: DATABASE MANAGEMENT**
- **notion** - Could use as temporary subsidy database
- **oracle** - SQL database skills

#### **PRIORITY 5: PAYMENT PROCESSING**
- Need Stripe CLI or API integration skill
- May need custom skill development

#### **PRIORITY 6: SPANISH LANGUAGE PROCESSING**
- Need OCR/document parsing for Spanish PDFs
- May need custom skill or use existing NLP models

## 🛠️ SKILL INSTALLATION PLAN

### **Phase 1: Immediate (Week 1)**
1. **Fix web_search** - Configure Gemini API key for web search
2. **Install nano-pdf** - For report generation
3. **Install himalaya** - For client communication

### **Phase 2: Core (Week 2)**
1. **Calendar integration** - Choose apple-reminders or things-mac
2. **Database setup** - Notion or SQL database skill
3. **Stripe integration** - Research/create payment skill

### **Phase 3: Advanced (Month 1)**
1. **Government API integration** - Custom skill for Spanish portals
2. **OCR for Spanish documents** - Document parsing skill
3. **Automated follow-up system** - Taskflow integration

## 🔧 TECHNICAL DEPENDENCIES

### **Required CLI Tools:**
1. **nano-pdf** - `uv install nano-pdf`
2. **himalaya** - `brew install himalaya` or `cargo install himalaya`
3. **Stripe CLI** - `brew install stripe/stripe-cli/stripe`
4. **OCR tools** - `tesseract` for Spanish OCR

### **API Keys Needed:**
1. **Gemini API** - For web_search (already have)
2. **Stripe API** - For payments
3. **Email credentials** - For himalaya (IMAP/SMTP)
4. **Government portal credentials** - Spanish subsidy portals

## 🚀 IMMEDIATE NEXT ACTIONS

1. **Fix web_search Gemini API key configuration**
2. **Install nano-pdf for PDF generation**
3. **Test document creation workflow**
4. **Begin Catalonia subsidy research with working web search**

## 💰 COST ANALYSIS

### **Skill Installation Costs:**
- **nano-pdf:** Free (open source)
- **himalaya:** Free (open source)
- **Stripe CLI:** Free
- **OCR tools:** Free

### **API Usage Costs:**
- **Gemini Flash:** $0.075/1M tokens (research)
- **Claude 3.5:** $3/1M tokens (document generation)
- **Stripe:** Transaction fees only
- **Email:** Free with existing provider

## 📅 TIMELINE

### **Day 1-2:** Fix web_search, install nano-pdf
### **Day 3-4:** Install himalaya, set up email
### **Day 5-7:** Begin subsidy research with full toolset
### **Week 2:** Add calendar, database skills
### **Week 3-4:** Payment integration, advanced features

## ⚠️ RISKS & MITIGATION

### **Risk 1:** Spanish document parsing complexity
**Mitigation:** Start with manual research, develop OCR skill gradually

### **Risk 2:** Government API integration difficulty
**Mitigation:** Manual data entry initially, automate later

### **Risk 3:** Payment processing compliance
**Mitigation:** Use Stripe (handles EU compliance)

### **Risk 4:** Client communication scalability
**Mitigation:** Start manual, automate with templates