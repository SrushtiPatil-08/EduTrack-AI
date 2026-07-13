declare module '@/services/auth' {
  export function signUpWithEmail(name: string, email: string, password: string): Promise<{ user?: any; session?: any; error?: string }>;
  export function signInWithEmail(email: string, password: string): Promise<{ user?: any; session?: any; error?: string }>;
  export function signOut(): Promise<{ error?: any }>;
  export function getSession(): Promise<{ session?: any; error?: any }>;
  export function getCurrentUser(): Promise<{ user?: any; error?: any }>;
  export function onAuthStateChange(callback: (session: any) => void): { unsubscribe: () => void };
}

declare module '@/services/supabase' {
  const supabase: any;
  export default supabase;
}

declare module '@/services/groq' {
  export function askGroq(prompt: string, context?: any): Promise<{ reply?: string; error?: string | null }>;
}

declare module '@/services/resend' {
  export function sendEmail(opts: any): Promise<{ error?: string }>;
  export function sendBulkEmails(recipients: any[], template?: any): Promise<{ error?: string }>;
}

declare module '@/services/scanner' {
  export function startScan(): Promise<{ error?: string }>;
  export function processScanResult(data: any): Promise<{ error?: string }>;
}

declare module '@/services/analytics' {
  export function getOverview(): Promise<{ data?: any; error?: string | null }>;
  export function getAttendanceTrend(range?: string): Promise<{ data?: any; error?: string | null }>;
}
