// Whether vendor edits to the approval-tier fields (name, descriptions, bio,
// FAQ, team photo, video, gallery, custom essentials) are buffered into
// `suppliers.pending_changes` for admin review before going live.
//
// OFF for the pilot: the founding vendor edits their own profile directly, with
// nothing hidden behind an approval queue. The moderation infrastructure
// (pending_changes column, admin moderation UI, approve/reject emails) is left
// intact and merely bypassed — flip this back to `true` to re-enable the whole
// approval flow for future vendors without rebuilding anything.
//
// Read by both the server action (src/lib/actions/profile.ts, where it decides
// live-vs-buffered) and the client wizard (src/app/dashboard/profile-wizard.tsx,
// where it drives the "reviewed before it goes live" banner), so the two can
// never disagree about whether an edit is immediate.
export const MODERATION_ENABLED = false;
