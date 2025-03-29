import { config } from "dotenv";
config();

const appconfig = {
    URI: process.env.DATABASE_URI,
    PORT: process.env.PORT,

    REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_HOST:process.env.REDIS_HOST,
    REDIS_PORT:process.env.REDIS_PORT,
    REDIS_PASSWORD:process.env.REDIS_PASSWORD,

    EMAILJS_USER_ID: process.env.EMAILJS_USER_ID,
    EMAILJS_USER_SECRET: process.env.EMAILJS_USER_SECRET,
    EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
    EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
    EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
    
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET:process.env.STRIPE_WEBHOOK_SECRET,

};

export default appconfig;
