'use client';
import dynamic from 'next/dynamic';

// The app is fully client-side (Supabase auth, localStorage, Capacitor)
// so we disable SSR to avoid issues during build/prerender
const App = dynamic(() => import('../src/App'), { ssr: false });

export default function Page() {
  return <App />;
}
