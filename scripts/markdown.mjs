export function stripDuplicateLeadingTitle(body, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const duplicateTitle = new RegExp(`^\\s*#\\s+${escaped}\\s*(?:\\r?\\n)+`);
  return body.replace(duplicateTitle, '\n');
}
