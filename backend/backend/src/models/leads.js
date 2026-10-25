'use strict';
const { makeModel } = require('./crud');
const { clean } = require('../utils/validate');

const enquirySchema = {
  customer_name: { type: 'str', required: true, min: 2, max: 100 },
  phone: { type: 'phone', required: true },
  email: { type: 'email' },
  subject: { type: 'str', max: 200 },
  source: { type: 'enum', values: ['contact', 'list_property', 'property'] },
  message: { type: 'str', required: true, min: 2, max: 2000 },
};
const visitSchema = {
  customer_name: { type: 'str', required: true, min: 2, max: 100 },
  phone: { type: 'phone', required: true },
  email: { type: 'email' },
  property_title: { type: 'str', max: 200 },
  preferred_date: { type: 'date', required: true },
  preferred_time: { type: 'str', required: true, max: 60 },
  visitors: { type: 'int', min: 1, max: 50, default: 1 },
  message: { type: 'str', max: 2000 },
};

const enquiries = makeModel({
  table: 'enquiries', cols: [...Object.keys(enquirySchema), 'property_id', 'status'],
  search: ['customer_name', 'phone', 'email', 'subject', 'message'],
  filters: { status: { col: 'status' }, source: { col: 'source' } },
});
const visits = makeModel({
  table: 'visit_requests', cols: [...Object.keys(visitSchema), 'property_id', 'status'],
  search: ['customer_name', 'phone', 'email', 'property_title'],
  filters: { status: { col: 'status' } },
});

module.exports = {
  enquiries, visits,
  validateEnquiry: (b) => clean(b, enquirySchema),
  validateVisit: (b) => clean(b, visitSchema),
  ENQUIRY_STATUS: ['New', 'Contacted', 'Completed', 'Archived'],
  VISIT_STATUS: ['New', 'Confirmed', 'Completed', 'Cancelled'],
};
