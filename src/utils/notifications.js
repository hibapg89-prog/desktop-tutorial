import { base44 } from "@/api/base44Client";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const SWAN_MEDALLION_URL =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/62026b2d0_IMG_4373.png";

/**
 * Returns true if a notification of the same type targeting the same
 * product (or sender, for messages) already exists within the last 24 hours.
 * Fails open — returns false on any error so creation is never blocked silently.
 */
export async function isDuplicate({ type, product_id, sender_id }) {
  try {
    const filter = { type };
    if (type === "message" && sender_id) {
      filter.sender_id = sender_id;
    } else if (product_id) {
      filter.product_id = product_id;
    }
    const existing = await base44.entities.Notification.filter(
      filter,
      "-created_date",
      10
    );
    if (!Array.isArray(existing) || existing.length === 0) return false;
    const now = Date.now();
    return existing.some(
      (n) =>
        n.created_date &&
        now - new Date(n.created_date) < TWENTY_FOUR_HOURS
    );
  } catch {
    return false;
  }
}

/**
 * Creates a notification after performing the 24-hour deduplication check.
 * Returns the created entity or null if it was a duplicate / creation failed.
 */
export async function createNotification(data) {
  const duplicate = await isDuplicate({
    type: data.type,
    product_id: data.product_id,
    sender_id: data.sender_id,
  });
  if (duplicate) return null;
  try {
    return await base44.entities.Notification.create({
      read: false,
      created_date: new Date().toISOString(),
      ...data,
    });
  } catch {
    return null;
  }
}

/**
 * Seeds the WELCOME notification exactly once.
 * Idempotent — no-ops if any notification already exists for this user.
 */
export async function seedWelcomeNotification() {
  try {
    const existing = await base44.entities.Notification.list(
      "-created_date",
      1
    );
    if (Array.isArray(existing) && existing.length > 0) return;
    await base44.entities.Notification.create({
      type: "welcome",
      title: "Welcome to The Muse",
      body: "Your beauty companion awaits. Scan any product to begin.",
      read: false,
      image_url: SWAN_MEDALLION_URL,
      created_date: new Date().toISOString(),
    });
  } catch {}
}

/**
 * Marks deal / price-drop / offer notifications older than 7 days as read.
 * Call on Notifications page mount to keep the unread count relevant.
 */
export async function autoReadStaleNotifications() {
  try {
    const unread = await base44.entities.Notification.filter(
      { read: false },
      "-created_date",
      100
    );
    if (!Array.isArray(unread)) return;
    const now = Date.now();
    const stale = unread.filter(
      (n) =>
        ["deal", "price_drop", "offer"].includes(n.type) &&
        n.created_date &&
        now - new Date(n.created_date) > SEVEN_DAYS
    );
    if (stale.length === 0) return;
    await Promise.all(
      stale.map((n) =>
        base44.entities.Notification.update(n.id, { read: true })
      )
    );
  } catch {}
}