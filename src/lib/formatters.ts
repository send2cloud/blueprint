 /**
  * Format a date string as a relative time (e.g., "just now", "5m ago", "2d ago")
  */
 export function formatRelative(iso: string): string {
   const timestamp = Date.parse(iso);
   if (Number.isNaN(timestamp)) return 'just now';
   const diffMs = Date.now() - timestamp;
   const diffMins = Math.floor(diffMs / 60000);
   if (diffMins < 1) return 'just now';
   if (diffMins < 60) return `${diffMins}m ago`;
   const diffHours = Math.floor(diffMins / 60);
   if (diffHours < 24) return `${diffHours}h ago`;
   const diffDays = Math.floor(diffHours / 24);
   return `${diffDays}d ago`;
 }