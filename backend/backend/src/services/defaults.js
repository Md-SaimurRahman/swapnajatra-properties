'use strict';
/**
 * Default settings & content. Values are taken from the existing Swapnajatra website
 * (company name, address, phones, tagline, service list). Nothing here is invented.
 */
const SETTINGS = {
  company: {
    name: 'SWAPNAJATRA PROPERTIES LTD.',
    tagline: 'HONESTY • EFFICIENCY • TRUST',
    address: 'Kohinoor Tower-03, Road #7\nHouse #7-SW(E), 3rd Floor\nGulshan-1, Dhaka',
    email: '',
    phone1: '01310 094 907',
    phone2: '01726 191 921',
    phone3: '01870 763 179',
    hours: '',
  },
  social: { whatsapp: '8801310094907', facebook: '', linkedin: '', youtube: '', maps: '' },
  brand: { title: 'Swapnajatra Properties Ltd.', logo: '', favicon: '', defaultImage: '' },
  prefs: { lang: 'en', theme: 'light', showWa: true, showMenu: true },
  prop: { listing: 'buy', type: '', perPage: 12, featured: true, sold: true, rented: true },
  lead: { email: '', waNumber: '', notifyEnquiry: false, notifyVisit: false, autoReply: '' },
  site: { status: 'online', message: 'Our website is under maintenance. Please check back soon.' },
};

// key -> [English, Bangla]. Bangla only where the original site already had an exact translation.
const CONTENT = {
  hero_heading: ['Property Decisions Made With Confidence.', 'আপনার মনের মতো একটি ঠিকানা খুঁজে নিন।'],
  hero_subtitle: [
    'From residential and commercial land to flats, joint-venture development, land-share construction and property management — Swapnajatra Properties Ltd. provides practical real-estate solutions with professionalism, transparency and trust.',
    'স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড আপনাকে জমি, ফ্ল্যাট ও যৌথ উদ্যোগ প্রকল্প কেনা-বেচা ও নির্মাণে সাহায্য করে — স্বচ্ছ কাগজপত্র ও সৎ পরামর্শসহ।',
  ],
  hero_button: ['Explore properties', 'প্রপার্টি দেখুন'],
  hero_image: ['', ''],
  about_heading: ['', ''],
  about_description: ['', ''],
  about_image: ['', ''],
  owner_name: ['Md. Helal Uddin', 'মোঃ হেলাল উদ্দিন'],
  owner_title: ['Chairman', 'চেয়ারম্যান'],
  owner_message: ['', ''],
  owner_image: ['', ''],
  services_heading: ['Real-estate solutions under one trusted roof.', ''],
  services_description: [
    'From buying and selling to development, land consultancy and ongoing property care — our core services are built around practical support and clear communication.', '',
  ],
  footer_description: ['Honesty · Efficiency · Trust', 'সততা · দক্ষতা · বিশ্বাস'],
  footer_copyright: ['© 2026 Swapnajatra Properties Ltd. All rights reserved.', '© ২০২৬ স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড। সর্বস্বত্ব সংরক্ষিত।'],
};
const IMAGE_CONTENT_KEYS = ['hero_image', 'about_image', 'owner_image'];
const IMAGE_SETTING_KEYS = { brand: ['logo', 'favicon', 'defaultImage'] };

// The five services of the existing site (titles/descriptions as on the page).
const SERVICES = [
  { title: 'Buy & Sell', title_bn: 'আবাসিক ও বাণিজ্যিক জমি এবং নতুন ও পুরাতন ফ্ল্যাট ক্রয়-বিক্রয় সহযোগিতা',
    description: 'Residential and commercial land, new flats and resale flats — with guided property selection and transaction support.',
    cta_label: 'Explore properties →', cta_href: '#properties' },
  { title: 'Joint Venture Development', title_bn: 'যৌথ উদ্যোগে ভবন নির্মাণ (Joint Venture)',
    description: 'Support for landowners who want to develop property through a structured joint-venture process.',
    cta_label: 'Discuss your land →', cta_href: '#contact' },
  { title: 'Land Share Development', title_bn: 'ল্যান্ড শেয়ার বিক্রয়ের মাধ্যমে ভবন নির্মাণ',
    description: 'Building development opportunities through land-share sales, planned around the project and its stakeholders.',
    cta_label: 'Discuss a project →', cta_href: '#contact' },
  { title: 'Land Management Consultancy', title_bn: 'ভূমি ব্যবস্থাপনা / Land Consultancy',
    description: 'Guidance on ownership verification, registration, mutation and document review. This is professional guidance, not government certification.',
    description_bn: 'মালিকানা স্বত্ব যাচাই, রেজিস্ট্রেশন, মিউটেশন ইত্যাদি বিষয়ে কনসালটেন্সি সেবা',
    cta_label: 'Request guidance →', cta_href: '#contact' },
  { title: 'Property & Facility Management', title_bn: 'প্রপার্টি ম্যানেজমেন্ট ও ফেসিলিটি ম্যানেজমেন্ট বিষয়ক সকল সেবা',
    description: 'Professional support for ongoing property and facility management needs.',
    cta_label: 'Talk to our team →', cta_href: '#contact' },
];

module.exports = { SETTINGS, CONTENT, SERVICES, IMAGE_CONTENT_KEYS, IMAGE_SETTING_KEYS };
