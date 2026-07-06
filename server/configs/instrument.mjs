import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://545b181eb7bdf220e21ac84b9cd88c73@o4510952464449536.ingest.de.sentry.io/4510952472772688",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});