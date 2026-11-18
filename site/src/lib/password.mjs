// The real password comes from the STUDY_PASSWORD environment variable at build time.
// It is never stored in the repo.
// A production build without it STOPS, because the fallback below is public: anyone could unlock the case studies.
// Local dev and tests may use the preview password.
export function studyPassword() {
  const pw = process.env.STUDY_PASSWORD || import.meta.env?.STUDY_PASSWORD;
  if (pw) return pw;
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PREVIEW_PASSWORD !== '1') {
    throw new Error('STUDY_PASSWORD is not set. Refusing to build locked case studies with the public preview password. Set STUDY_PASSWORD (or put it in site/.env), then build again.');
  }
  console.warn('\n[portfolio] STUDY_PASSWORD is not set. Locked case studies use the preview password "preview-2026". Do not launch like this.\n');
  return 'preview-2026';
}
