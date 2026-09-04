import {
  Organization, User, Lead, Contact, Company, Customer, Deal, Job,
  ProductService, Quote, Invoice, Payment, Expense, KirkolSale,
  Task, Activity, DocumentRecord, SupportTicket, InAppNotification,
  AuditLog, AutomationRule, PreApprovedUser, RoleType, SocialQuery, SocialPlatform
} from '../types';

// Mock Initial Organizations
const initialOrganizations: Organization[] = [
  {
    id: 'org_aluzer',
    name: 'Al Uzer Common Services',
    tagline: 'CSC & Digital Business Solutions',
    email: 'info@aluzer.com',
    phone: '+91 98765 43210',
    address: 'Main Bazaar Road, Shop #14',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    taxNumber: '27AABCU9603R1ZM',
    plan: 'yearly',
    paidStartDate: '2026-01-01',
    paidEndDate: '2027-01-01',
    maxUsers: 15,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'org_apex',
    name: 'Apex Digital Logistics',
    tagline: 'Smart Supply Chain & Courier Services',
    email: 'contact@apexlogistics.in',
    phone: '+91 98111 22334',
    address: 'Sector 18, Commercial Hub',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    plan: 'trial',
    trialStartDate: '2026-09-01',
    trialEndDate: '2026-09-08',
    maxUsers: 5,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  }
];

// Mock Users
const initialUsers: User[] = [
  {
    id: 'user_super_admin',
    organizationId: 'system',
    name: 'Vajahat Shaikh (VRYS Owner)',
    email: 'vajahat@vrys.io',
    phone: '+91 99999 00001',
    role: 'SUPER_ADMIN',
    roleName: 'VRYS System Owner',
    status: 'active',
    lastLogin: '2026-09-03T21:45:00Z',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user_aluzer_owner',
    organizationId: 'org_aluzer',
    name: 'Ahmed Khan',
    email: 'ahmed@aluzer.com',
    phone: '+91 98765 43210',
    role: 'COMPANY_OWNER',
    roleName: 'Business Owner',
    status: 'active',
    lastLogin: '2026-09-03T20:30:00Z',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user_sales_1',
    organizationId: 'org_aluzer',
    name: 'Rohit Sharma',
    email: 'rohit@aluzer.com',
    phone: '+91 98765 11111',
    role: 'SALES',
    roleName: 'Sales Executive',
    status: 'active',
    lastLogin: '2026-09-03T18:15:00Z',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'user_ops_1',
    organizationId: 'org_aluzer',
    name: 'Suhail Patel',
    email: 'suhail@aluzer.com',
    phone: '+91 98765 22222',
    role: 'OPERATIONS',
    roleName: 'Operations Lead',
    status: 'active',
    lastLogin: '2026-09-03T19:00:00Z',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'user_accountant_1',
    organizationId: 'org_aluzer',
    name: 'Pooja Verma',
    email: 'pooja@aluzer.com',
    phone: '+91 98765 33333',
    role: 'ACCOUNTANT',
    roleName: 'Senior Accountant',
    status: 'active',
    lastLogin: '2026-09-03T17:40:00Z',
    createdAt: '2026-02-01T00:00:00Z'
  }
];

// Pre-Approved Access List for System Owner
const initialPreApproved: PreApprovedUser[] = [
  {
    id: 'pre_1',
    mobile: '+91 98222 33445',
    email: 'sharma.traders@gmail.com',
    name: 'Rajesh Sharma',
    companyName: 'Sharma & Sons Trading',
    accessDays: 30,
    status: 'pending',
    notes: 'Granted during expo conference',
    createdAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'pre_2',
    mobile: '+91 97654 09876',
    email: 'fatima@zenithdocs.in',
    name: 'Fatima Sayyed',
    companyName: 'Zenith Legal Documentation',
    accessDays: 90,
    status: 'pending',
    notes: 'Special referral access',
    createdAt: '2026-09-02T14:30:00Z'
  }
];

// Companies / Accounts
const initialCompanies: Company[] = [
  {
    id: 'comp_1',
    organizationId: 'org_aluzer',
    name: 'Qureshi Import Export Pvt Ltd',
    industry: 'International Trade & Logistics',
    phone: '+91 98210 55443',
    email: 'contact@qureshitraders.com',
    website: 'https://qureshitraders.com',
    address: 'Plot 45, APMC Market, Vashi',
    city: 'Navi Mumbai',
    tags: ['VIP Client', 'Corporate Tax', 'High Volume'],
    ownerId: 'user_aluzer_owner',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'comp_2',
    organizationId: 'org_aluzer',
    name: 'Roy Creative Studio',
    industry: 'Design & Media Production',
    phone: '+91 98300 22119',
    email: 'hello@roycreativestudio.in',
    website: 'https://roycreativestudio.in',
    address: 'B-302, Green Acres, Andheri East',
    city: 'Mumbai',
    tags: ['Digital Solutions', 'Fast Payer'],
    ownerId: 'user_sales_1',
    createdAt: '2026-02-14T11:20:00Z'
  },
  {
    id: 'comp_3',
    organizationId: 'org_aluzer',
    name: 'Memon Logistics LLC',
    industry: 'Freight & Transportation',
    phone: '+91 98112 33441',
    email: 'info@memonlogistics.com',
    website: 'https://memonlogistics.com',
    address: 'Gala 12, Cargo Complex, Sahar',
    city: 'Mumbai',
    tags: ['Fleet Vehicles', 'Follow-up Due'],
    ownerId: 'user_aluzer_owner',
    createdAt: '2026-03-05T09:15:00Z'
  },
  {
    id: 'comp_4',
    organizationId: 'org_aluzer',
    name: 'Ansari Textiles & Weaving',
    industry: 'Textiles & Garment Manufacturing',
    phone: '+91 98200 11223',
    email: 'ansari.textiles@gmail.com',
    address: 'Bhiwandi Textile Cluster',
    city: 'Bhiwandi',
    tags: ['Prospective Lead', 'Quarterly Compliance'],
    ownerId: 'user_sales_1',
    createdAt: '2026-09-01T10:00:00Z'
  }
];

// Contacts
const initialContacts: Contact[] = [
  {
    id: 'cont_1',
    organizationId: 'org_aluzer',
    companyId: 'comp_1',
    firstName: 'Tariq',
    lastName: 'Qureshi',
    mobile: '+91 98210 55443',
    alternateMobile: '+91 98210 55444',
    email: 'tariq@qureshitraders.com',
    address: 'Plot 45, APMC Market',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    dateOfBirth: '1982-04-15',
    tags: ['Director', 'Signatory'],
    ownerId: 'user_aluzer_owner',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'cont_2',
    organizationId: 'org_aluzer',
    companyId: 'comp_2',
    firstName: 'Ananya',
    lastName: 'Roy',
    mobile: '+91 98300 22119',
    email: 'ananya.roy@gmail.com',
    address: 'B-302, Green Acres',
    city: 'Mumbai',
    state: 'Maharashtra',
    dateOfBirth: '1991-11-20',
    tags: ['Founder', 'Lead Designer'],
    ownerId: 'user_sales_1',
    createdAt: '2026-02-14T11:20:00Z'
  },
  {
    id: 'cont_3',
    organizationId: 'org_aluzer',
    companyId: 'comp_3',
    firstName: 'Kashif',
    lastName: 'Memon',
    mobile: '+91 98112 33441',
    email: 'kashif@memonlogistics.com',
    address: 'Gala 12, Cargo Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    dateOfBirth: '1985-08-05',
    tags: ['Managing Partner'],
    ownerId: 'user_aluzer_owner',
    createdAt: '2026-03-05T09:15:00Z'
  },
  {
    id: 'cont_4',
    organizationId: 'org_aluzer',
    companyId: 'comp_4',
    firstName: 'Farhan',
    lastName: 'Ansari',
    mobile: '+91 98200 11223',
    email: 'farhan.ansari@gmail.com',
    address: 'Bhiwandi',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    tags: ['Commercial Lead'],
    ownerId: 'user_sales_1',
    createdAt: '2026-09-01T10:00:00Z'
  }
];

// Products & Services
const initialProducts: ProductService[] = [
  {
    id: 'srv_passport',
    organizationId: 'org_aluzer',
    name: 'Fresh Passport Application (Tatkaal/Normal)',
    sku: 'SRV-PSP-01',
    category: 'Government Services',
    description: 'Online registration, appointment booking, and document verification assist.',
    sellingPrice: 2000,
    internalCost: 300,
    governmentFee: 1500,
    taxRate: 18,
    profit: 1700,
    durationDays: 14,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'srv_pan',
    organizationId: 'org_aluzer',
    name: 'New PAN Card Registration & Correction',
    sku: 'SRV-PAN-02',
    category: 'Government Services',
    description: 'UTI/NSDL PAN processing with biometric/eKYC.',
    sellingPrice: 350,
    internalCost: 50,
    governmentFee: 107,
    taxRate: 18,
    profit: 300,
    durationDays: 7,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'srv_gst',
    organizationId: 'org_aluzer',
    name: 'GST Monthly Filing & Reconciliation',
    sku: 'SRV-GST-03',
    category: 'Tax & Compliance',
    description: 'GSTR-1, GSTR-3B monthly return and ITC match.',
    sellingPrice: 1500,
    internalCost: 200,
    governmentFee: 0,
    taxRate: 18,
    profit: 1300,
    durationDays: 3,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'srv_web',
    organizationId: 'org_aluzer',
    name: 'Custom Business Website & CRM Setup',
    sku: 'SRV-WEB-04',
    category: 'Digital Services',
    description: 'High-speed business portal with automated WhatsApp lead capture.',
    sellingPrice: 25000,
    internalCost: 4000,
    governmentFee: 0,
    taxRate: 18,
    profit: 21000,
    durationDays: 10,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// Leads
const initialLeads: Lead[] = [
  {
    id: 'lead_1',
    organizationId: 'org_aluzer',
    name: 'Farhan Ansari',
    mobile: '+91 98200 11223',
    email: 'farhan.ansari@gmail.com',
    companyName: 'Ansari Textiles',
    location: 'Bhiwandi, Mumbai',
    source: 'WhatsApp',
    interestedService: 'GST Monthly Filing & Reconciliation',
    estimatedValue: 18000,
    priority: 'high',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'Proposal Sent',
    aiScore: 88,
    aiScoreReason: 'High engagement on WhatsApp, immediate quarterly tax deadline.',
    nextFollowUp: '2026-09-04T11:00:00Z',
    notes: 'Needs yearly compliance package for 3 partnership firms.',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-03T15:00:00Z'
  },
  {
    id: 'lead_2',
    organizationId: 'org_aluzer',
    name: 'Dr. Priya Nambiar',
    mobile: '+91 98333 44556',
    email: 'priya.clinic@hotmail.com',
    companyName: 'Aura Dental Clinic',
    location: 'Bandra West, Mumbai',
    source: 'Website',
    interestedService: 'Custom Business Website & CRM Setup',
    estimatedValue: 25000,
    priority: 'urgent',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'Negotiation',
    aiScore: 94,
    aiScoreReason: 'Requested live demo, confirmed budget approval.',
    nextFollowUp: '2026-09-04T15:30:00Z',
    notes: 'Demo completed. Wants appointment booking calendar integrated.',
    createdAt: '2026-08-30T12:00:00Z',
    updatedAt: '2026-09-03T16:30:00Z'
  },
  {
    id: 'lead_3',
    organizationId: 'org_aluzer',
    name: 'Imran Merchant',
    mobile: '+91 98450 67890',
    location: 'Kurla West',
    source: 'Walk-in',
    interestedService: 'Fresh Passport Application (Tatkaal/Normal)',
    estimatedValue: 2000,
    priority: 'medium',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'Qualified',
    aiScore: 72,
    aiScoreReason: 'Walk-in customer with all original KYC documents ready.',
    nextFollowUp: '2026-09-05T10:30:00Z',
    createdAt: '2026-09-02T09:30:00Z',
    updatedAt: '2026-09-02T09:30:00Z'
  },
  {
    id: 'lead_4',
    organizationId: 'org_aluzer',
    name: 'Sanjay Deshmukh',
    mobile: '+91 98199 88776',
    email: 'sanjay@deshmukhind.com',
    companyName: 'Deshmukh Industries',
    location: 'Thane',
    source: 'Referral',
    interestedService: 'GST Monthly Filing & Reconciliation',
    estimatedValue: 15000,
    priority: 'medium',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'New',
    aiScore: 65,
    nextFollowUp: '2026-09-04T14:00:00Z',
    createdAt: '2026-09-03T14:00:00Z',
    updatedAt: '2026-09-03T14:00:00Z'
  },
  {
    id: 'lead_5',
    organizationId: 'org_aluzer',
    name: 'Amira Shaikh',
    mobile: '+91 98920 44321',
    email: 'amira.designs@gmail.com',
    companyName: 'Amira Couture Studio',
    location: 'Lokhandwala, Andheri',
    source: 'Instagram',
    socialHandle: '@amira_couture_official',
    interestedService: 'Custom Business Website & CRM Setup',
    estimatedValue: 35000,
    priority: 'urgent',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'Qualified',
    aiScore: 92,
    aiScoreReason: 'Sent DM inquiry on Instagram about online boutique store and automated order notifications.',
    nextFollowUp: '2026-09-05T12:00:00Z',
    notes: 'Came via Instagram Reel on e-commerce catalog setup. Active follower.',
    createdAt: '2026-09-03T16:20:00Z',
    updatedAt: '2026-09-04T10:00:00Z'
  },
  {
    id: 'lead_6',
    organizationId: 'org_aluzer',
    name: 'Vikramaditya Solanki',
    mobile: '+91 98721 88990',
    email: 'vikram.tours@gmail.com',
    companyName: 'Solanki Heritage Tours',
    location: 'Colaba, Mumbai',
    source: 'Instagram',
    socialHandle: '@solanki_heritage_tours',
    interestedService: 'Fresh Passport Application (Tatkaal/Normal)',
    estimatedValue: 8000,
    priority: 'high',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'New',
    aiScore: 85,
    aiScoreReason: 'Instagram Direct Message inquiry for 4 family members Tatkaal passport appointment.',
    nextFollowUp: '2026-09-04T16:00:00Z',
    notes: 'Family urgent trip to Dubai scheduled end of month.',
    createdAt: '2026-09-04T09:15:00Z',
    updatedAt: '2026-09-04T09:15:00Z'
  },
  {
    id: 'lead_7',
    organizationId: 'org_aluzer',
    name: 'Rajeev & Anita Mehra',
    mobile: '+91 98104 33221',
    email: 'rajeev.mehra@mehraexports.in',
    companyName: 'Mehra Handicrafts LLP',
    location: 'Vashi, Navi Mumbai',
    source: 'Facebook',
    socialHandle: 'fb.com/mehrahandicrafts',
    interestedService: 'GST Monthly Filing & Reconciliation',
    estimatedValue: 24000,
    priority: 'high',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'Proposal Sent',
    aiScore: 89,
    aiScoreReason: 'Filled Facebook Lead Form from Sponsored Business Tax Ad campaign.',
    nextFollowUp: '2026-09-05T14:30:00Z',
    notes: 'Looking for complete quarterly filing, e-Way bills, and input credit optimization.',
    createdAt: '2026-09-02T15:40:00Z',
    updatedAt: '2026-09-03T11:20:00Z'
  },
  {
    id: 'lead_8',
    organizationId: 'org_aluzer',
    name: 'Harish Chawla',
    mobile: '+91 98311 77665',
    companyName: 'Chawla Auto Spares',
    location: 'Goregaon East',
    source: 'Facebook',
    socialHandle: 'fb.com/chawla.autospares',
    interestedService: 'New PAN Card Registration & Correction',
    estimatedValue: 1500,
    priority: 'medium',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    status: 'Contacted',
    aiScore: 70,
    aiScoreReason: 'Commented on Facebook post regarding firm PAN corrections.',
    nextFollowUp: '2026-09-04T17:00:00Z',
    notes: 'Needs correction in director name on entity PAN card.',
    createdAt: '2026-09-03T18:00:00Z',
    updatedAt: '2026-09-04T08:30:00Z'
  }
];

// Social Queries / DMs from Social Platforms (Instagram, Facebook, WhatsApp, Website)
const initialSocialQueries: SocialQuery[] = [
  {
    id: 'sq_ig_1',
    organizationId: 'org_aluzer',
    platform: 'Instagram',
    customerName: 'Amira Shaikh',
    customerHandle: '@amira_couture_official',
    customerMobile: '+91 98920 44321',
    customerEmail: 'amira.designs@gmail.com',
    queryText: 'Hi team! Saw your reel on custom business website and CRM automation. Do you provide automated WhatsApp invoices & catalog sync for luxury boutique clients?',
    interestedService: 'Custom Business Website & CRM Setup',
    receivedAt: '2026-09-04T08:30:00Z',
    status: 'converted',
    leadId: 'lead_5',
    replies: [
      {
        id: 'rep_1',
        sender: 'user',
        text: 'Hello Amira! Yes absolutely, our system includes full catalog management, WhatsApp PDF invoices, and automated follow-ups.',
        timestamp: '2026-09-04T08:45:00Z'
      },
      {
        id: 'rep_2',
        sender: 'customer',
        text: 'That is awesome! Can we schedule a 15-min demo call tomorrow?',
        timestamp: '2026-09-04T09:00:00Z'
      }
    ]
  },
  {
    id: 'sq_ig_2',
    organizationId: 'org_aluzer',
    platform: 'Instagram',
    customerName: 'Vikramaditya Solanki',
    customerHandle: '@solanki_heritage_tours',
    customerMobile: '+91 98721 88990',
    queryText: 'Hello! Can you help with Tatkaal passport appointment at PSK BKC for 4 family members? Travel date is approaching in 3 weeks.',
    interestedService: 'Fresh Passport Application (Tatkaal/Normal)',
    receivedAt: '2026-09-04T09:15:00Z',
    status: 'new',
    leadId: 'lead_6',
    replies: [
      {
        id: 'rep_3',
        sender: 'user',
        text: 'Hi Vikramaditya! Yes, we can process Tatkaal passport bookings with priority appointment slots and complete document checks.',
        timestamp: '2026-09-04T09:20:00Z'
      }
    ]
  },
  {
    id: 'sq_ig_3',
    organizationId: 'org_aluzer',
    platform: 'Instagram',
    customerName: 'Zoya Fatima Khan',
    customerHandle: '@zoyakhan_artistry',
    customerMobile: '+91 98234 11229',
    queryText: 'Hi! What are the required documents for urgent Trade License & GST registration for a new beauty salon in Bandra?',
    interestedService: 'GST Monthly Filing & Reconciliation',
    receivedAt: '2026-09-04T11:40:00Z',
    status: 'new',
    replies: []
  },
  {
    id: 'sq_fb_1',
    organizationId: 'org_aluzer',
    platform: 'Facebook',
    customerName: 'Rajeev & Anita Mehra',
    customerHandle: 'fb.com/mehrahandicrafts',
    customerMobile: '+91 98104 33221',
    customerEmail: 'rajeev.mehra@mehraexports.in',
    queryText: '[Facebook Lead Ad]: Interested in Annual GST & Corporate Accounting Package for Handicrafts Export LLP. Please send corporate quote and turnaround times.',
    interestedService: 'GST Monthly Filing & Reconciliation',
    receivedAt: '2026-09-02T15:40:00Z',
    status: 'converted',
    leadId: 'lead_7',
    replies: [
      {
        id: 'rep_4',
        sender: 'user',
        text: 'Greetings Mr. Mehra! We have received your inquiry from Facebook. Our corporate specialist Rohit will share our customized export GST package.',
        timestamp: '2026-09-02T16:00:00Z'
      }
    ]
  },
  {
    id: 'sq_fb_2',
    organizationId: 'org_aluzer',
    platform: 'Facebook',
    customerName: 'Harish Chawla',
    customerHandle: 'fb.com/chawla.autospares',
    customerMobile: '+91 98311 77665',
    queryText: 'Hi, we need to update our director name and registered address across PAN card and GST certificate. What is the fee and timeline?',
    interestedService: 'New PAN Card Registration & Correction',
    receivedAt: '2026-09-03T18:00:00Z',
    status: 'replied',
    leadId: 'lead_8',
    replies: [
      {
        id: 'rep_5',
        sender: 'user',
        text: 'Hello Harish ji! PAN name & address correction takes approx 5-7 working days. Total service fee is ₹350 per application.',
        timestamp: '2026-09-03T18:30:00Z'
      }
    ]
  },
  {
    id: 'sq_fb_3',
    organizationId: 'org_aluzer',
    platform: 'Facebook',
    customerName: 'Devendra Joshi',
    customerHandle: 'fb.com/devendra.joshi.92',
    customerMobile: '+91 97650 99881',
    queryText: 'Hello! I saw your post regarding Business Tax Audits. Do you also provide fast Income Tax Return (ITR-4) filing for retailers?',
    interestedService: 'GST Monthly Filing & Reconciliation',
    receivedAt: '2026-09-04T13:10:00Z',
    status: 'new',
    replies: []
  },
  {
    id: 'sq_wa_1',
    organizationId: 'org_aluzer',
    platform: 'WhatsApp',
    customerName: 'Farhan Ansari',
    customerMobile: '+91 98200 11223',
    queryText: 'As-salamu alaykum Rohit bhai, we need urgent GST filing done before the 10th. Can you send the quotation for 3 firms?',
    interestedService: 'GST Monthly Filing & Reconciliation',
    receivedAt: '2026-09-01T10:00:00Z',
    status: 'converted',
    leadId: 'lead_1',
    replies: [
      {
        id: 'rep_6',
        sender: 'user',
        text: 'Wa alaykumu s-salam Farhan bhai! Sure, preparing the package proposal right away.',
        timestamp: '2026-09-01T10:15:00Z'
      }
    ]
  }
];

// Customers
const initialCustomers: Customer[] = [
  {
    id: 'cust_1',
    organizationId: 'org_aluzer',
    name: 'Tariq Qureshi',
    customerCode: 'CUST-00101',
    mobile: '+91 98210 55443',
    email: 'tariq@qureshitraders.com',
    companyName: 'Qureshi Import Export',
    address: 'Plot 45, APMC Market, Vashi',
    city: 'Navi Mumbai',
    category: 'Corporate VIP',
    lifetimeValue: 84000,
    outstandingAmount: 4500,
    totalRevenue: 84000,
    tags: ['VIP', 'Repeat Buyer', 'GST Client'],
    ownerId: 'user_aluzer_owner',
    status: 'vip',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'cust_2',
    organizationId: 'org_aluzer',
    name: 'Ananya Roy',
    customerCode: 'CUST-00102',
    mobile: '+91 98300 22119',
    email: 'ananya.roy@gmail.com',
    companyName: 'Roy Creative Studio',
    address: 'B-302, Green Acres, Andheri East',
    city: 'Mumbai',
    category: 'Individual',
    lifetimeValue: 28500,
    outstandingAmount: 0,
    totalRevenue: 28500,
    tags: ['Punctual Payer', 'Digital'],
    ownerId: 'user_sales_1',
    status: 'active',
    createdAt: '2026-02-14T11:20:00Z'
  },
  {
    id: 'cust_3',
    organizationId: 'org_aluzer',
    name: 'Kashif Memon',
    customerCode: 'CUST-00103',
    mobile: '+91 98112 33441',
    email: 'kashif@memonlogistics.com',
    companyName: 'Memon Logistics LLC',
    address: 'Gala 12, Cargo Complex, Sahar',
    city: 'Mumbai',
    category: 'Commercial',
    lifetimeValue: 52000,
    outstandingAmount: 12000,
    totalRevenue: 52000,
    tags: ['Follow-up Required', 'High Volume'],
    ownerId: 'user_aluzer_owner',
    status: 'at_risk',
    createdAt: '2026-03-05T09:15:00Z'
  }
];

// Deals
const initialDeals: Deal[] = [
  {
    id: 'deal_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    title: 'Annual GST & Corporate Filing 2026-27',
    pipelineId: 'pipe_default',
    stage: 'Negotiation',
    value: 36000,
    probability: 80,
    expectedCloseDate: '2026-09-15',
    ownerId: 'user_aluzer_owner',
    ownerName: 'Ahmed Khan',
    source: 'Existing Customer',
    notes: 'Discussed 10% volume discount for upfront annual payment.',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z'
  },
  {
    id: 'deal_2',
    organizationId: 'org_aluzer',
    customerId: 'cust_2',
    customerName: 'Ananya Roy',
    title: 'E-Commerce Portal & WhatsApp Automation',
    pipelineId: 'pipe_default',
    stage: 'Closed Won',
    value: 25000,
    probability: 100,
    expectedCloseDate: '2026-09-01',
    ownerId: 'user_sales_1',
    ownerName: 'Rohit Sharma',
    source: 'Website',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-01T14:30:00Z'
  }
];

// Jobs
const initialJobs: Job[] = [
  {
    id: 'job_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    customerPhone: '+91 98210 55443',
    jobNumber: 'JOB-2026-089',
    title: 'Director Passport Renewal (Tatkaal)',
    serviceName: 'Fresh Passport Application (Tatkaal/Normal)',
    status: 'In Progress',
    priority: 'urgent',
    assignedTo: 'user_ops_1',
    assignedToName: 'Suhail Patel',
    totalAmount: 2000,
    workExpense: 300,
    paidAmount: 1000,
    balanceAmount: 1000,
    requiredDocuments: ['Old Passport Copy', 'Aadhaar Card', 'Annexure E', 'Electricity Bill'],
    receivedDocuments: ['Old Passport Copy', 'Aadhaar Card'],
    deliveryDate: '2026-09-08',
    notes: 'Appointment scheduled for Sep 6 at BKC PSK.',
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'job_2',
    organizationId: 'org_aluzer',
    customerId: 'cust_2',
    customerName: 'Ananya Roy',
    customerPhone: '+91 98300 22119',
    jobNumber: 'JOB-2026-090',
    title: 'Roy Studio Website Deployment',
    serviceName: 'Custom Business Website & CRM Setup',
    status: 'Ready',
    priority: 'high',
    assignedTo: 'user_ops_1',
    assignedToName: 'Suhail Patel',
    totalAmount: 25000,
    workExpense: 4000,
    paidAmount: 25000,
    balanceAmount: 0,
    requiredDocuments: ['Domain Details', 'Brand Assets', 'Service List'],
    receivedDocuments: ['Domain Details', 'Brand Assets', 'Service List'],
    deliveryDate: '2026-09-04',
    notes: 'Final testing done. Ready for live customer handover.',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-09-03T17:00:00Z'
  },
  {
    id: 'job_3',
    organizationId: 'org_aluzer',
    customerId: 'cust_3',
    customerName: 'Kashif Memon',
    customerPhone: '+91 98112 33441',
    jobNumber: 'JOB-2026-091',
    title: 'Fleet Vehicle GST & Tax Clearance',
    serviceName: 'GST Monthly Filing & Reconciliation',
    status: 'Al Uzer',
    priority: 'medium',
    assignedTo: 'user_aluzer_owner',
    assignedToName: 'Ahmed Khan',
    totalAmount: 12000,
    workExpense: 1500,
    paidAmount: 0,
    balanceAmount: 12000,
    requiredDocuments: ['Vehicle RC Book', 'Commercial Invoices', 'Bank Statements'],
    receivedDocuments: ['Vehicle RC Book'],
    deliveryDate: '2026-09-10',
    notes: 'Waiting for August bank statement from client.',
    createdAt: '2026-09-02T12:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z'
  }
];

// Quotes & Estimates
const initialQuotes: Quote[] = [
  {
    id: 'quote_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    customerEmail: 'tariq@qureshitraders.com',
    quoteNumber: 'QUO-2026-001',
    issueDate: '2026-09-01',
    expiryDate: '2026-09-16',
    items: [
      {
        id: 'li_1',
        name: 'Tatkaal Passport Facilitation',
        description: 'Online registration, appointment booking, and document verification assist.',
        quantity: 1,
        unitPrice: 2000,
        discount: 0,
        tax: 360,
        total: 2360
      }
    ],
    subtotal: 2000,
    discountTotal: 0,
    taxTotal: 360,
    total: 2360,
    status: 'Sent',
    notes: 'Quotation valid for 15 days.',
    createdBy: 'Rohit Sharma',
    createdAt: '2026-09-01T10:30:00Z'
  },
  {
    id: 'quote_2',
    organizationId: 'org_aluzer',
    customerId: 'cust_3',
    customerName: 'Kashif Memon',
    customerEmail: 'kashif@memonlogistics.com',
    quoteNumber: 'QUO-2026-002',
    issueDate: '2026-09-02',
    expiryDate: '2026-09-17',
    items: [
      {
        id: 'li_2',
        name: 'Annual GST Return & Corporate Compliance',
        description: 'Comprehensive quarterly returns and reconciliation.',
        quantity: 1,
        unitPrice: 15000,
        discount: 1000,
        tax: 2520,
        total: 16520
      }
    ],
    subtotal: 14000,
    discountTotal: 1000,
    taxTotal: 2520,
    total: 16520,
    status: 'Accepted',
    notes: 'Approved during review call. Ready for invoice conversion.',
    createdBy: 'Ahmed Khan',
    createdAt: '2026-09-02T11:45:00Z'
  }
];

// Invoices
const initialInvoices: Invoice[] = [
  {
    id: 'inv_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_2',
    customerName: 'Ananya Roy',
    customerPhone: '+91 98300 22119',
    jobId: 'job_2',
    invoiceNumber: 'INV-2026-0044',
    issueDate: '2026-09-01',
    dueDate: '2026-09-05',
    items: [
      {
        id: 'item_1',
        name: 'Custom Business Website & CRM Setup',
        quantity: 1,
        unitPrice: 21186.44,
        discount: 0,
        tax: 3813.56,
        total: 25000
      }
    ],
    subtotal: 21186.44,
    discountTotal: 0,
    taxTotal: 3813.56,
    total: 25000,
    paidAmount: 25000,
    balanceAmount: 0,
    status: 'Paid',
    notes: 'Paid via UPI. Thank you for your business.',
    createdAt: '2026-09-01T15:00:00Z'
  },
  {
    id: 'inv_2',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    customerPhone: '+91 98210 55443',
    jobId: 'job_1',
    invoiceNumber: 'INV-2026-0045',
    issueDate: '2026-09-01',
    dueDate: '2026-09-08',
    items: [
      {
        id: 'item_2',
        name: 'Fresh Passport Application (Tatkaal)',
        quantity: 1,
        unitPrice: 2000,
        discount: 0,
        tax: 0,
        total: 2000
      }
    ],
    subtotal: 2000,
    discountTotal: 0,
    taxTotal: 0,
    total: 2000,
    paidAmount: 1000,
    balanceAmount: 1000,
    status: 'Partially Paid',
    notes: '50% advance received. Balance on document handover.',
    createdAt: '2026-09-01T11:30:00Z'
  }
];

// Payments
const initialPayments: Payment[] = [
  {
    id: 'pay_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_2',
    customerName: 'Ananya Roy',
    invoiceId: 'inv_1',
    jobId: 'job_2',
    amount: 25000,
    paymentMethod: 'UPI',
    transactionReference: 'UPI/234901992019/PAYTM',
    paymentDate: '2026-09-01',
    receiptNumber: 'REC-2026-0044',
    recordedBy: 'Rohit Sharma',
    notes: 'Full payment received.',
    createdAt: '2026-09-01T15:05:00Z'
  },
  {
    id: 'pay_2',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    invoiceId: 'inv_2',
    jobId: 'job_1',
    amount: 1000,
    paymentMethod: 'Cash',
    paymentDate: '2026-09-01',
    receiptNumber: 'REC-2026-0045',
    recordedBy: 'Ahmed Khan',
    notes: 'Advance booking deposit.',
    createdAt: '2026-09-01T11:40:00Z'
  }
];

// Expenses
const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    organizationId: 'org_aluzer',
    category: 'Shop Rent & Utilities',
    amount: 15000,
    date: '2026-09-01',
    description: 'Shop monthly rent for September 2026',
    paymentMethod: 'Bank Transfer',
    recordedBy: 'Ahmed Khan',
    createdAt: '2026-09-01T09:00:00Z'
  },
  {
    id: 'exp_2',
    organizationId: 'org_aluzer',
    category: 'Internet & Fiber',
    amount: 1200,
    date: '2026-09-02',
    description: 'High-speed Jio Fiber 300 Mbps monthly bill',
    paymentMethod: 'UPI',
    recordedBy: 'Ahmed Khan',
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'exp_3',
    organizationId: 'org_aluzer',
    category: 'Printer Supplies & Paper',
    amount: 2400,
    date: '2026-09-02',
    description: '2 Box A4 75GSM JK Copier Paper + HP Black Toner Cartridge',
    paymentMethod: 'Cash',
    recordedBy: 'Suhail Patel',
    createdAt: '2026-09-02T16:00:00Z'
  }
];

// Counter Sales / Kirkol Income
const initialKirkol: KirkolSale[] = [
  {
    id: 'kir_1',
    organizationId: 'org_aluzer',
    category: 'Printing & Xerox',
    description: 'Legal document sets color printing & 40 B&W copies',
    amount: 450,
    paymentMethod: 'UPI',
    date: '2026-09-03',
    recordedBy: 'Suhail Patel',
    createdAt: '2026-09-03T11:20:00Z'
  },
  {
    id: 'kir_2',
    organizationId: 'org_aluzer',
    category: 'Lamination',
    description: '5 Degree certificates lamination (Military grade)',
    amount: 250,
    paymentMethod: 'Cash',
    date: '2026-09-03',
    recordedBy: 'Suhail Patel',
    createdAt: '2026-09-03T14:15:00Z'
  },
  {
    id: 'kir_3',
    organizationId: 'org_aluzer',
    category: 'Ticket Booking',
    description: 'IRCTC Tatkaal Train Ticket Booking Mumbai to Delhi',
    amount: 300,
    paymentMethod: 'UPI',
    date: '2026-09-03',
    recordedBy: 'Ahmed Khan',
    createdAt: '2026-09-03T10:05:00Z'
  },
  {
    id: 'kir_4',
    organizationId: 'org_aluzer',
    category: 'Scanning & Email',
    description: '15 Property deeds scan to PDF and secure email',
    amount: 150,
    paymentMethod: 'Cash',
    date: '2026-09-03',
    recordedBy: 'Suhail Patel',
    createdAt: '2026-09-03T16:45:00Z'
  }
];

// Tasks
const initialTasks: Task[] = [
  {
    id: 'task_1',
    organizationId: 'org_aluzer',
    title: 'Call Farhan Ansari to finalize GST contract',
    description: 'Clarify quarterly billing terms and send digital onboarding link.',
    assignedTo: 'user_sales_1',
    assignedToName: 'Rohit Sharma',
    createdBy: 'Ahmed Khan',
    relatedType: 'lead',
    relatedId: 'lead_1',
    relatedTitle: 'Farhan Ansari',
    priority: 'high',
    status: 'To Do',
    dueDate: '2026-09-04T11:00:00Z',
    createdAt: '2026-09-03T15:30:00Z'
  },
  {
    id: 'task_2',
    organizationId: 'org_aluzer',
    title: 'Collect pending Bank Statement from Kashif Memon',
    description: 'Needed for Fleet Vehicle GST clearance before filing deadline.',
    assignedTo: 'user_ops_1',
    assignedToName: 'Suhail Patel',
    createdBy: 'Ahmed Khan',
    relatedType: 'job',
    relatedId: 'job_3',
    relatedTitle: 'JOB-2026-091',
    priority: 'urgent',
    status: 'In Progress',
    dueDate: '2026-09-04T14:00:00Z',
    createdAt: '2026-09-02T13:00:00Z'
  },
  {
    id: 'task_3',
    organizationId: 'org_aluzer',
    title: 'Handover completed website to Ananya Roy',
    description: 'Provide admin login credentials and run 15-min walkthrough.',
    assignedTo: 'user_ops_1',
    assignedToName: 'Suhail Patel',
    createdBy: 'Rohit Sharma',
    relatedType: 'job',
    relatedId: 'job_2',
    relatedTitle: 'JOB-2026-090',
    priority: 'medium',
    status: 'To Do',
    dueDate: '2026-09-04T16:00:00Z',
    createdAt: '2026-09-03T17:15:00Z'
  }
];

// Activities
const initialActivities: Activity[] = [
  {
    id: 'act_1',
    organizationId: 'org_aluzer',
    type: 'WhatsApp',
    subject: 'Sent GST Proposal via WhatsApp',
    description: 'Sent PDF quote #Q-2026-012 for ₹18,000/yr.',
    userId: 'user_sales_1',
    userName: 'Rohit Sharma',
    relatedType: 'lead',
    relatedId: 'lead_1',
    occurredAt: '2026-09-03T15:00:00Z'
  },
  {
    id: 'act_2',
    organizationId: 'org_aluzer',
    type: 'Payment',
    subject: 'Payment Received ₹25,000',
    description: 'Received full payment for Web & CRM Setup via UPI.',
    userId: 'user_sales_1',
    userName: 'Rohit Sharma',
    relatedType: 'customer',
    relatedId: 'cust_2',
    occurredAt: '2026-09-01T15:05:00Z'
  }
];

// Document Vault Records
const initialDocuments: DocumentRecord[] = [
  {
    id: 'doc_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    jobId: 'job_1',
    name: 'Director Original Passport Scan (Old).pdf',
    category: 'Passport & Travel',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    expiryDate: '2026-09-20',
    uploadedBy: 'Suhail Patel',
    createdAt: '2026-09-01T11:05:00Z'
  },
  {
    id: 'doc_2',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    jobId: 'job_1',
    name: 'Aadhaar Card Color eKYC.pdf',
    category: 'Government ID',
    fileType: 'PDF',
    fileSize: '1.1 MB',
    uploadedBy: 'Suhail Patel',
    createdAt: '2026-09-01T11:06:00Z'
  },
  {
    id: 'doc_3',
    organizationId: 'org_aluzer',
    customerId: 'cust_3',
    customerName: 'Kashif Memon',
    jobId: 'job_3',
    name: 'Commercial Fleet Vehicle RC Book.pdf',
    category: 'Vehicle & Transport',
    fileType: 'PDF',
    fileSize: '3.8 MB',
    expiryDate: '2026-09-18',
    uploadedBy: 'Ahmed Khan',
    createdAt: '2026-09-02T12:10:00Z'
  },
  {
    id: 'doc_4',
    organizationId: 'org_aluzer',
    customerId: 'cust_2',
    customerName: 'Ananya Roy',
    jobId: 'job_2',
    name: 'Roy Creative Studio GST Registration Certificate.pdf',
    category: 'Tax & Corporate',
    fileType: 'PDF',
    fileSize: '850 KB',
    uploadedBy: 'Rohit Sharma',
    createdAt: '2026-08-25T14:15:00Z'
  }
];

// Support Tickets
const initialTickets: SupportTicket[] = [
  {
    id: 'tkt_1',
    organizationId: 'org_aluzer',
    customerId: 'cust_1',
    customerName: 'Tariq Qureshi',
    ticketNumber: 'TCK-2026-01',
    subject: 'Need expedited appointment slot for PSK BKC',
    description: 'Client needs earlier slot due to emergency flight on Sep 12.',
    priority: 'high',
    status: 'In Progress',
    category: 'Urgent Reschedule',
    assignedTo: 'user_ops_1',
    assignedToName: 'Suhail Patel',
    slaDueAt: '2026-09-04T12:00:00Z',
    createdAt: '2026-09-03T09:00:00Z'
  }
];

// Automation Rules
const initialAutomationRules: AutomationRule[] = [
  {
    id: 'auto_1',
    organizationId: 'org_aluzer',
    name: 'Auto WhatsApp Greeting on New Lead',
    trigger: 'lead_created',
    actionType: 'send_whatsapp',
    actionConfig: {
      template: 'Hi {{name}}, thanks for contacting Al Uzer Services! An executive is reviewing your requirement.'
    },
    isActive: true,
    executionCount: 28,
    lastExecutedAt: '2026-09-03T14:00:00Z'
  },
  {
    id: 'auto_2',
    organizationId: 'org_aluzer',
    name: 'Follow-up Task on Job Delivery',
    trigger: 'job_status_changed',
    conditionField: 'status',
    conditionOperator: 'equals',
    conditionValue: 'Delivered',
    actionType: 'create_task',
    actionConfig: {
      title: 'Customer Satisfaction Check & Google Review Request',
      delayDays: 3
    },
    isActive: true,
    executionCount: 14,
    lastExecutedAt: '2026-08-30T16:00:00Z'
  }
];

// In-App Notifications
const initialNotifications: InAppNotification[] = [
  {
    id: 'notif_1',
    organizationId: 'org_aluzer',
    type: 'payment',
    title: 'Payment Received',
    message: '₹25,000 received from Ananya Roy for Website & CRM Setup.',
    read: false,
    createdAt: '2026-09-01T15:05:00Z'
  },
  {
    id: 'notif_2',
    organizationId: 'org_aluzer',
    type: 'lead',
    title: 'High-Score Lead Captured',
    message: 'Dr. Priya Nambiar (AI Score: 94) requested immediate demo.',
    read: false,
    createdAt: '2026-08-30T12:00:00Z'
  }
];

// Audit Logs
const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud_1',
    organizationId: 'org_aluzer',
    userId: 'user_aluzer_owner',
    userName: 'Ahmed Khan',
    action: 'JOB_CREATED',
    entityType: 'Job',
    entityId: 'job_1',
    details: 'Created Director Passport Renewal for Tariq Qureshi',
    timestamp: '2026-09-01T11:00:00Z'
  },
  {
    id: 'aud_2',
    organizationId: 'system',
    userId: 'user_super_admin',
    userName: 'Vajahat Shaikh (Owner)',
    action: 'TRIAL_EXTENDED',
    entityType: 'Organization',
    entityId: 'org_apex',
    details: 'Extended trial period by 7 days for Apex Digital Logistics',
    timestamp: '2026-09-02T18:00:00Z'
  }
];

// LocalStorage Helper
const STORAGE_PREFIX = 'vrys_crm_';

function loadOrInit<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  } catch (e) {
    return initial;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed saving ${key} to localStorage:`, e);
  }
}

// Unified VRYS Data Service
class VRYSDataStore {
  private orgs: Organization[];
  private users: User[];
  private preApproved: PreApprovedUser[];
  private products: ProductService[];
  private companies: Company[];
  private contacts: Contact[];
  private leads: Lead[];
  private customers: Customer[];
  private deals: Deal[];
  private jobs: Job[];
  private documents: DocumentRecord[];
  private quotes: Quote[];
  private invoices: Invoice[];
  private payments: Payment[];
  private expenses: Expense[];
  private kirkol: KirkolSale[];
  private tasks: Task[];
  private activities: Activity[];
  private tickets: SupportTicket[];
  private notifications: InAppNotification[];
  private auditLogs: AuditLog[];
  private automationRules: AutomationRule[];
  private socialQueries: SocialQuery[];

  constructor() {
    this.orgs = loadOrInit('orgs', initialOrganizations);
    this.users = loadOrInit('users', initialUsers);
    this.preApproved = loadOrInit('preApproved', initialPreApproved);
    this.companies = loadOrInit('companies', initialCompanies);
    this.contacts = loadOrInit('contacts', initialContacts);
    this.products = loadOrInit('products', initialProducts);
    this.leads = loadOrInit('leads', initialLeads);
    this.customers = loadOrInit('customers', initialCustomers);
    this.deals = loadOrInit('deals', initialDeals);
    this.jobs = loadOrInit('jobs', initialJobs);
    this.documents = loadOrInit('documents', initialDocuments);
    this.quotes = loadOrInit('quotes', initialQuotes);
    this.invoices = loadOrInit('invoices', initialInvoices);
    this.payments = loadOrInit('payments', initialPayments);
    this.expenses = loadOrInit('expenses', initialExpenses);
    this.kirkol = loadOrInit('kirkol', initialKirkol);
    this.tasks = loadOrInit('tasks', initialTasks);
    this.activities = loadOrInit('activities', initialActivities);
    this.tickets = loadOrInit('tickets', initialTickets);
    this.notifications = loadOrInit('notifications', initialNotifications);
    this.auditLogs = loadOrInit('auditLogs', initialAuditLogs);
    this.automationRules = loadOrInit('automationRules', initialAutomationRules);
    this.socialQueries = loadOrInit('socialQueries', initialSocialQueries);
  }

  // Multi-tenant Org filtering helper
  private filterByOrg<T extends { organizationId: string }>(items: T[], orgId: string): T[] {
    if (orgId === 'ALL') return items; // System Owner global view
    return items.filter(item => item.organizationId === orgId);
  }

  // Organizations
  getOrganizations(): Organization[] {
    return [...this.orgs];
  }

  getOrganizationById(id: string): Organization | undefined {
    return this.orgs.find(o => o.id === id);
  }

  createOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Organization {
    const newOrg: Organization = {
      ...org,
      id: 'org_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orgs.unshift(newOrg);
    save('orgs', this.orgs);
    return newOrg;
  }

  updateOrganization(id: string, updates: Partial<Organization>): Organization {
    this.orgs = this.orgs.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o);
    save('orgs', this.orgs);
    return this.getOrganizationById(id)!;
  }

  extendTrial(orgId: string, days: number, adminUser: User): Organization {
    const org = this.getOrganizationById(orgId);
    if (!org) throw new Error('Organization not found');

    const currentExpiry = org.trialEndDate ? new Date(org.trialEndDate).getTime() : Date.now();
    const newExpiry = new Date(Math.max(Date.now(), currentExpiry) + days * 24 * 60 * 60 * 1000).toISOString();

    const updated = this.updateOrganization(orgId, {
      trialEndDate: newExpiry,
      plan: 'trial'
    });

    this.logAudit(
      orgId,
      adminUser.id,
      adminUser.name,
      'TRIAL_EXTENDED',
      'Organization',
      orgId,
      `Extended trial by ${days} days until ${new Date(newExpiry).toLocaleDateString()}`
    );

    return updated;
  }

  grantFreeAccess(orgId: string, isFree: boolean, adminUser: User): Organization {
    const org = this.getOrganizationById(orgId);
    if (!org) throw new Error('Organization not found');

    const updated = this.updateOrganization(orgId, {
      plan: isFree ? 'free_granted' : 'trial'
    });

    this.logAudit(
      orgId,
      adminUser.id,
      adminUser.name,
      'ACCESS_GRANTED',
      'Organization',
      orgId,
      isFree ? 'Granted permanent VIP free access' : 'Revoked free access grant'
    );

    return updated;
  }

  upgradeSubscription(orgId: string, plan: 'monthly' | 'yearly', paymentRef: string): Organization {
    const org = this.getOrganizationById(orgId);
    if (!org) throw new Error('Organization not found');

    const paidEndDate = new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    const updated = this.updateOrganization(orgId, {
      plan,
      paidStartDate: new Date().toISOString(),
      paidEndDate
    });

    this.logAudit(
      orgId,
      'system_razorpay',
      'Razorpay Gateway',
      'PLAN_UPGRADED',
      'Subscription',
      paymentRef,
      `Upgraded subscription to ${plan.toUpperCase()} tier (Ref: ${paymentRef})`
    );

    return updated;
  }

  // Users
  getUsers(orgId: string): User[] {
    return this.filterByOrg(this.users, orgId);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: 'user_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    save('users', this.users);
    return newUser;
  }

  // Pre-Approved Access
  getPreApprovedUsers(): PreApprovedUser[] {
    return [...this.preApproved];
  }

  addPreApprovedUser(item: Omit<PreApprovedUser, 'id' | 'createdAt' | 'status'>): PreApprovedUser {
    const newItem: PreApprovedUser = {
      ...item,
      id: 'pre_' + Date.now().toString(36),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.preApproved.unshift(newItem);
    save('preApproved', this.preApproved);
    return newItem;
  }

  deletePreApprovedUser(id: string): void {
    this.preApproved = this.preApproved.filter(p => p.id !== id);
    save('preApproved', this.preApproved);
  }

  // Companies / Accounts
  getCompanies(orgId: string): Company[] {
    return this.filterByOrg(this.companies, orgId);
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies.find(c => c.id === id);
  }

  createCompany(company: Omit<Company, 'id' | 'createdAt'>): Company {
    const newCompany: Company = {
      ...company,
      id: 'comp_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.companies.unshift(newCompany);
    save('companies', this.companies);
    return newCompany;
  }

  updateCompany(id: string, updates: Partial<Company>): Company {
    this.companies = this.companies.map(c => c.id === id ? { ...c, ...updates } : c);
    save('companies', this.companies);
    return this.getCompanyById(id)!;
  }

  // Contacts
  getContacts(orgId: string): Contact[] {
    return this.filterByOrg(this.contacts, orgId);
  }

  getContactById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  createContact(contact: Omit<Contact, 'id' | 'createdAt'>): Contact {
    const newContact: Contact = {
      ...contact,
      id: 'cont_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.contacts.unshift(newContact);
    save('contacts', this.contacts);
    return newContact;
  }

  updateContact(id: string, updates: Partial<Contact>): Contact {
    this.contacts = this.contacts.map(c => c.id === id ? { ...c, ...updates } : c);
    save('contacts', this.contacts);
    return this.getContactById(id)!;
  }

  // Duplicate Detection across Leads, Contacts, Customers
  checkDuplicate(orgId: string, mobile: string, email?: string): { isDuplicate: boolean; matchedEntity?: string; message?: string } {
    const cleanMobile = mobile.replace(/[\s\-\(\)]/g, '');
    const cleanEmail = email?.trim().toLowerCase();

    // Check Contacts
    const existingContact = this.getContacts(orgId).find(c =>
      c.mobile.replace(/[\s\-\(\)]/g, '') === cleanMobile ||
      (cleanEmail && c.email?.toLowerCase() === cleanEmail)
    );
    if (existingContact) {
      return {
        isDuplicate: true,
        matchedEntity: `Contact: ${existingContact.firstName} ${existingContact.lastName}`,
        message: `A contact with phone ${mobile} or email ${email} already exists.`
      };
    }

    // Check Customers
    const existingCust = this.getCustomers(orgId).find(c =>
      c.mobile.replace(/[\s\-\(\)]/g, '') === cleanMobile ||
      (cleanEmail && c.email?.toLowerCase() === cleanEmail)
    );
    if (existingCust) {
      return {
        isDuplicate: true,
        matchedEntity: `Customer: ${existingCust.name} (${existingCust.customerCode})`,
        message: `An active customer with phone ${mobile} already exists.`
      };
    }

    // Check Leads
    const existingLead = this.getLeads(orgId).find(l =>
      l.mobile.replace(/[\s\-\(\)]/g, '') === cleanMobile ||
      (cleanEmail && l.email?.toLowerCase() === cleanEmail)
    );
    if (existingLead) {
      return {
        isDuplicate: true,
        matchedEntity: `Lead: ${existingLead.name} (${existingLead.status})`,
        message: `An active lead with phone ${mobile} is already registered.`
      };
    }

    return { isDuplicate: false };
  }

  // Leads
  getLeads(orgId: string): Lead[] {
    return this.filterByOrg(this.leads, orgId);
  }

  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: 'lead_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.leads.unshift(newLead);
    save('leads', this.leads);
    this.logAudit(lead.organizationId, lead.ownerId, lead.ownerName, 'LEAD_CREATED', 'Lead', newLead.id, `Captured lead ${newLead.name}`);
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead {
    this.leads = this.leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l);
    save('leads', this.leads);
    return this.leads.find(l => l.id === id)!;
  }

  deleteLead(id: string): void {
    this.leads = this.leads.filter(l => l.id !== id);
    save('leads', this.leads);
  }

  // Social Queries & Inquiries (Instagram, Facebook, WhatsApp, etc.)
  getSocialQueries(orgId: string, platform?: SocialPlatform | 'ALL'): SocialQuery[] {
    const orgQueries = this.filterByOrg(this.socialQueries, orgId);
    if (!platform || platform === 'ALL') return orgQueries;
    return orgQueries.filter(q => q.platform.toLowerCase() === platform.toLowerCase());
  }

  createSocialQuery(query: Omit<SocialQuery, 'id' | 'receivedAt' | 'status' | 'replies'>): SocialQuery {
    const newQuery: SocialQuery = {
      ...query,
      id: 'sq_' + Date.now().toString(36),
      receivedAt: new Date().toISOString(),
      status: 'new',
      replies: []
    };
    this.socialQueries.unshift(newQuery);
    save('socialQueries', this.socialQueries);
    return newQuery;
  }

  replyToSocialQuery(queryId: string, replyText: string, sender: 'user' | 'bot' = 'user'): SocialQuery | null {
    const query = this.socialQueries.find(q => q.id === queryId);
    if (!query) return null;

    const newReply = {
      id: 'rep_' + Date.now().toString(36),
      sender,
      text: replyText,
      timestamp: new Date().toISOString()
    };

    const updatedReplies = [...(query.replies || []), newReply];
    const newStatus = query.status === 'converted' ? 'converted' : 'replied';

    this.socialQueries = this.socialQueries.map(q =>
      q.id === queryId ? { ...q, replies: updatedReplies, status: newStatus } : q
    );
    save('socialQueries', this.socialQueries);
    return this.socialQueries.find(q => q.id === queryId) || null;
  }

  updateSocialQueryStatus(queryId: string, status: 'new' | 'replied' | 'converted' | 'archived', leadId?: string): void {
    this.socialQueries = this.socialQueries.map(q =>
      q.id === queryId ? { ...q, status, ...(leadId ? { leadId } : {}) } : q
    );
    save('socialQueries', this.socialQueries);
  }

  convertSocialQueryToLead(queryId: string, leadData: {
    organizationId: string;
    ownerId: string;
    ownerName: string;
    estimatedValue: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Lead {
    const query = this.socialQueries.find(q => q.id === queryId);
    if (!query) throw new Error('Social query not found');

    const newLead = this.createLead({
      organizationId: leadData.organizationId,
      name: query.customerName,
      mobile: query.customerMobile || '+91 98000 00000',
      email: query.customerEmail,
      source: query.platform as any,
      socialHandle: query.customerHandle,
      interestedService: query.interestedService || 'General Consultation',
      estimatedValue: leadData.estimatedValue || 5000,
      priority: leadData.priority || 'high',
      ownerId: leadData.ownerId,
      ownerName: leadData.ownerName,
      status: 'New',
      aiScore: 88,
      aiScoreReason: `Converted directly from ${query.platform} customer inquiry: "${query.queryText.slice(0, 60)}..."`,
      notes: `Original ${query.platform} message: ${query.queryText}`
    });

    this.updateSocialQueryStatus(queryId, 'converted', newLead.id);
    return newLead;
  }

  // Customers
  getCustomers(orgId: string): Customer[] {
    return this.filterByOrg(this.customers, orgId);
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  createCustomer(cust: Omit<Customer, 'id' | 'createdAt' | 'customerCode'>): Customer {
    const nextNum = (this.customers.length + 101).toString().padStart(5, '0');
    const newCust: Customer = {
      ...cust,
      id: 'cust_' + Date.now().toString(36),
      customerCode: `CUST-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    this.customers.unshift(newCust);
    save('customers', this.customers);
    return newCust;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer {
    this.customers = this.customers.map(c => c.id === id ? { ...c, ...updates } : c);
    save('customers', this.customers);
    return this.getCustomerById(id)!;
  }

  // Deals
  getDeals(orgId: string): Deal[] {
    return this.filterByOrg(this.deals, orgId);
  }

  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal {
    const newDeal: Deal = {
      ...deal,
      id: 'deal_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.deals.unshift(newDeal);
    save('deals', this.deals);
    return newDeal;
  }

  updateDeal(id: string, updates: Partial<Deal>): Deal {
    this.deals = this.deals.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
    save('deals', this.deals);
    return this.deals.find(d => d.id === id)!;
  }

  // Jobs
  getJobs(orgId: string): Job[] {
    return this.filterByOrg(this.jobs, orgId);
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find(j => j.id === id);
  }

  createJob(job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt' | 'balanceAmount'>): Job {
    const balanceAmount = Number(job.totalAmount) - Number(job.paidAmount || 0);
    const jobNumber = `JOB-2026-${(this.jobs.length + 90).toString().padStart(3, '0')}`;
    const newJob: Job = {
      ...job,
      id: 'job_' + Date.now().toString(36),
      jobNumber,
      balanceAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.jobs.unshift(newJob);
    save('jobs', this.jobs);
    return newJob;
  }

  updateJob(id: string, updates: Partial<Job>): Job {
    this.jobs = this.jobs.map(j => {
      if (j.id === id) {
        const total = updates.totalAmount !== undefined ? updates.totalAmount : j.totalAmount;
        const paid = updates.paidAmount !== undefined ? updates.paidAmount : j.paidAmount;
        const balance = total - paid;
        return { ...j, ...updates, balanceAmount: balance, updatedAt: new Date().toISOString() };
      }
      return j;
    });
    save('jobs', this.jobs);
    return this.getJobById(id)!;
  }

  // Documents Vault
  getDocuments(orgId: string): DocumentRecord[] {
    return this.filterByOrg(this.documents, orgId);
  }

  createDocument(doc: Omit<DocumentRecord, 'id' | 'createdAt'>): DocumentRecord {
    const newDoc: DocumentRecord = {
      ...doc,
      id: 'doc_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.documents.unshift(newDoc);
    save('documents', this.documents);
    return newDoc;
  }

  deleteDocument(id: string): void {
    this.documents = this.documents.filter(d => d.id !== id);
    save('documents', this.documents);
  }

  getExpiringDocuments(orgId: string, daysThreshold = 30): { doc: DocumentRecord; daysLeft: number }[] {
    const now = new Date().getTime();
    return this.getDocuments(orgId)
      .filter(d => d.expiryDate)
      .map(d => {
        const expTime = new Date(d.expiryDate!).getTime();
        const daysLeft = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
        return { doc: d, daysLeft };
      })
      .filter(item => item.daysLeft <= daysThreshold)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }

  // Products & Services
  getProducts(orgId: string): ProductService[] {
    return this.filterByOrg(this.products, orgId);
  }

  createProduct(prod: Omit<ProductService, 'id' | 'createdAt' | 'profit'>): ProductService {
    const profit = Number(prod.sellingPrice) - Number(prod.internalCost);
    const newProd: ProductService = {
      ...prod,
      id: 'srv_' + Date.now().toString(36),
      profit,
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProd);
    save('products', this.products);
    return newProd;
  }

  // Quotes & Estimates
  getQuotes(orgId: string): Quote[] {
    return this.filterByOrg(this.quotes, orgId);
  }

  getQuoteById(id: string): Quote | undefined {
    return this.quotes.find(q => q.id === id);
  }

  createQuote(quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>): Quote {
    const nextNum = (this.quotes.length + 1).toString().padStart(3, '0');
    const newQuote: Quote = {
      ...quote,
      id: 'quote_' + Date.now().toString(36),
      quoteNumber: `QUO-2026-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    this.quotes.unshift(newQuote);
    save('quotes', this.quotes);
    return newQuote;
  }

  updateQuote(id: string, updates: Partial<Quote>): Quote {
    this.quotes = this.quotes.map(q => q.id === id ? { ...q, ...updates } : q);
    save('quotes', this.quotes);
    return this.getQuoteById(id)!;
  }

  convertQuoteToInvoice(quoteId: string, currentUser: User): Invoice {
    const quote = this.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');

    const customer = this.getCustomerById(quote.customerId);

    // Create Invoice from Quote Line Items
    const invoiceItems = quote.items.map(item => ({
      id: 'inv_item_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      tax: item.tax,
      total: item.total
    }));

    const newInvoice = this.createInvoice({
      organizationId: quote.organizationId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: customer?.mobile || '+91 98000 00000',
      customerAddress: customer?.address,
      items: invoiceItems,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      discountTotal: quote.discountTotal,
      total: quote.total,
      paidAmount: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Sent',
      notes: `Converted from Quote #${quote.quoteNumber}`
    });

    // Mark quote as converted
    this.updateQuote(quoteId, { status: 'Accepted' });

    // Update Customer outstanding balance
    if (customer) {
      this.updateCustomer(customer.id, {
        outstandingAmount: customer.outstandingAmount + quote.total
      });
    }

    // Record Audit & Timeline
    this.recordActivity({
      organizationId: quote.organizationId,
      type: 'System Event',
      subject: `Converted Quote ${quote.quoteNumber} to Invoice ${newInvoice.invoiceNumber}`,
      description: `Official Tax Invoice issued for ${quote.customerName} for ₹${quote.total.toLocaleString('en-IN')}`,
      userId: currentUser.id,
      userName: currentUser.name,
      relatedType: 'customer',
      relatedId: quote.customerId
    });

    return newInvoice;
  }

  // Invoices & Payments
  getInvoices(orgId: string): Invoice[] {
    return this.filterByOrg(this.invoices, orgId);
  }

  getOverdueInvoices(orgId: string): Invoice[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getInvoices(orgId).filter(
      inv => inv.status !== 'Paid' && inv.status !== 'Cancelled' && inv.dueDate < today
    );
  }

  createInvoice(inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'balanceAmount'>): Invoice {
    const balanceAmount = Number(inv.total) - Number(inv.paidAmount || 0);
    const nextNum = (this.invoices.length + 46).toString().padStart(4, '0');
    const newInv: Invoice = {
      ...inv,
      id: 'inv_' + Date.now().toString(36),
      invoiceNumber: `INV-2026-${nextNum}`,
      balanceAmount,
      createdAt: new Date().toISOString()
    };
    this.invoices.unshift(newInv);
    save('invoices', this.invoices);
    return newInv;
  }

  getPayments(orgId: string): Payment[] {
    return this.filterByOrg(this.payments, orgId);
  }

  recordPayment(payment: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>): Payment {
    const nextNum = (this.payments.length + 46).toString().padStart(4, '0');
    const newPay: Payment = {
      ...payment,
      id: 'pay_' + Date.now().toString(36),
      receiptNumber: `REC-2026-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(newPay);
    save('payments', this.payments);

    // Update corresponding invoice if exists
    if (payment.invoiceId) {
      const inv = this.invoices.find(i => i.id === payment.invoiceId);
      if (inv) {
        const newPaid = Number(inv.paidAmount) + Number(payment.amount);
        const newBal = Number(inv.total) - newPaid;
        const newStatus = newBal <= 0 ? 'Paid' : 'Partially Paid';
        this.invoices = this.invoices.map(i => i.id === inv.id ? { ...i, paidAmount: newPaid, balanceAmount: newBal, status: newStatus } : i);
        save('invoices', this.invoices);
      }
    }

    // Update corresponding job if exists
    if (payment.jobId) {
      const job = this.jobs.find(j => j.id === payment.jobId);
      if (job) {
        const newPaid = Number(job.paidAmount) + Number(payment.amount);
        const newBal = Number(job.totalAmount) - newPaid;
        this.jobs = this.jobs.map(j => j.id === job.id ? { ...j, paidAmount: newPaid, balanceAmount: newBal } : j);
        save('jobs', this.jobs);
      }
    }

    // Update customer lifetime balance and revenue
    const cust = this.customers.find(c => c.id === payment.customerId);
    if (cust) {
      const newOut = Math.max(0, Number(cust.outstandingAmount) - Number(payment.amount));
      this.customers = this.customers.map(c => c.id === cust.id ? { ...c, outstandingAmount: newOut } : c);
      save('customers', this.customers);
    }

    return newPay;
  }

  // Expenses
  getExpenses(orgId: string): Expense[] {
    return this.filterByOrg(this.expenses, orgId);
  }

  createExpense(exp: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const newExp: Expense = {
      ...exp,
      id: 'exp_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.expenses.unshift(newExp);
    save('expenses', this.expenses);
    return newExp;
  }

  // Kirkol / Counter Sales
  getKirkol(orgId: string): KirkolSale[] {
    return this.filterByOrg(this.kirkol, orgId);
  }

  recordKirkol(sale: Omit<KirkolSale, 'id' | 'createdAt'>): KirkolSale {
    const newSale: KirkolSale = {
      ...sale,
      id: 'kir_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.kirkol.unshift(newSale);
    save('kirkol', this.kirkol);
    return newSale;
  }

  // Tasks & Activities
  getTasks(orgId: string): Task[] {
    return this.filterByOrg(this.tasks, orgId);
  }

  createTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: 'task_' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.tasks.unshift(newTask);
    save('tasks', this.tasks);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    save('tasks', this.tasks);
    return this.tasks.find(t => t.id === id)!;
  }

  getActivities(orgId: string): Activity[] {
    return this.filterByOrg(this.activities, orgId);
  }

  recordActivity(act: Omit<Activity, 'id' | 'occurredAt'>): Activity {
    const newAct: Activity = {
      ...act,
      id: 'act_' + Date.now().toString(36),
      occurredAt: new Date().toISOString()
    };
    this.activities.unshift(newAct);
    save('activities', this.activities);
    return newAct;
  }

  // Tickets
  getTickets(orgId: string): SupportTicket[] {
    return this.filterByOrg(this.tickets, orgId);
  }

  createTicket(tkt: Omit<SupportTicket, 'id' | 'createdAt' | 'ticketNumber'>): SupportTicket {
    const num = (this.tickets.length + 1).toString().padStart(2, '0');
    const newTkt: SupportTicket = {
      ...tkt,
      id: 'tkt_' + Date.now().toString(36),
      ticketNumber: `TCK-2026-${num}`,
      createdAt: new Date().toISOString()
    };
    this.tickets.unshift(newTkt);
    save('tickets', this.tickets);
    return newTkt;
  }

  // Notifications
  getNotifications(orgId: string): InAppNotification[] {
    return this.filterByOrg(this.notifications, orgId);
  }

  markNotificationRead(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    save('notifications', this.notifications);
  }

  // Automation
  getAutomationRules(orgId: string): AutomationRule[] {
    return this.filterByOrg(this.automationRules, orgId);
  }

  toggleAutomationRule(id: string): void {
    this.automationRules = this.automationRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    save('automationRules', this.automationRules);
  }

  // Audit Logging
  getAuditLogs(orgId: string): AuditLog[] {
    return this.filterByOrg(this.auditLogs, orgId);
  }

  logAudit(orgId: string, userId: string, userName: string, action: string, entityType: string, entityId: string, details: string): void {
    const log: AuditLog = {
      id: 'aud_' + Date.now().toString(36),
      organizationId: orgId,
      userId,
      userName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    save('auditLogs', this.auditLogs);
  }

  // Centralized Financial Formulas (Spec Section 17 & 44)
  getFinancialMetrics(orgId: string) {
    const orgJobs = this.getJobs(orgId);
    const orgKirkol = this.getKirkol(orgId);
    const orgExpenses = this.getExpenses(orgId);
    const orgCustomers = this.getCustomers(orgId);
    const orgPayments = this.getPayments(orgId);

    // Customer Service Profit: Total Amount - Work Expense
    const totalJobAmount = orgJobs.reduce((sum, j) => sum + (Number(j.totalAmount) || 0), 0);
    const totalWorkExpense = orgJobs.reduce((sum, j) => sum + (Number(j.workExpense) || 0), 0);
    const customerServiceProfit = totalJobAmount - totalWorkExpense;

    // Kirkol Revenue
    const kirkolRevenue = orgKirkol.reduce((sum, k) => sum + (Number(k.amount) || 0), 0);

    // Business Income = Customer Service Profit + Kirkol Revenue
    const businessIncome = customerServiceProfit + kirkolRevenue;

    // Business Spending = Recorded Business Expenses
    const businessSpending = orgExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Net Profit = Business Income - Business Spending
    const netProfit = businessIncome - businessSpending;

    // Outstanding Balance across all jobs/invoices
    const totalCollected = orgPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalOutstanding = orgJobs.reduce((sum, j) => sum + (Number(j.balanceAmount) || 0), 0);

    return {
      totalJobAmount,
      totalWorkExpense,
      customerServiceProfit,
      kirkolRevenue,
      businessIncome,
      businessSpending,
      netProfit,
      totalCollected,
      totalOutstanding,
      activeCustomerCount: orgCustomers.length,
      jobCount: orgJobs.length
    };
  }
}

export const dataStore = new VRYSDataStore();
