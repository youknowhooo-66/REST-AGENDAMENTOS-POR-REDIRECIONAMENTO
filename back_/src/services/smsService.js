// back_/src/services/smsService.js

import { env } from '../../env.js';
import twilio from 'twilio';

// Check for Twilio credentials
const accountSid = env.twilioAccountSid;
const authToken = env.twilioAuthToken;
const twilioPhoneNumber = env.twilioPhoneNumber;

const isTwilioConfigured = accountSid && authToken && twilioPhoneNumber;

let client;
if (isTwilioConfigured) {
  client = twilio(accountSid, authToken);
  console.log('Twilio SMS service configured.');
} else {
  console.warn('Twilio SMS service is not configured. SMS sending will be disabled.');
  console.warn('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.');
}

/**
 * Sends an SMS message using Twilio.
 * @param {string} to The recipient's phone number (e.g., '+15558675309')
 * @param {string} body The text message to send.
 */
export async function sendSms(to, body) {
  if (!isTwilioConfigured) {
    console.warn(`SMS not sent to ${to} because Twilio is not configured.`);
    return; // Do nothing if not configured
  }

  if (!to) {
    console.warn('SMS not sent: Recipient phone number is missing.');
    return;
  }

  try {
    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });
    console.log(`SMS sent successfully to ${to}. Message SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}. Error:`, error);
    // Depending on the desired behavior, you might want to throw the error
    // or handle it gracefully here. For now, we just log it.
  }
}
