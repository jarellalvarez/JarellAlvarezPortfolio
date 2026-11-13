// The real password comes from the STUDY_PASSWORD environment variable at build time.
// It is never stored in the repo. Without it, a preview password is used and the build says so.
export function studyPassword() {
  if (process.env.STUDY_PASSWORD) return process.env.STUDY_PASSWORD;
  console.warn('\n[portfolio] STUDY_PASSWORD is not set. Locked case studies use the preview password "preview-2026". Do not launch like this.\n');
  return 'preview-2026';
}
