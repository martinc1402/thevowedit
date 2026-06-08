// Pre-launch gate. While true, only the homepage (/) and /privacy are live;
// the directory routes (browse, category/location, supplier) return 404 and are
// not prebuilt. Flip to false to bring the full directory back online.
export const MVP_LAUNCH = true;
