import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <GoogleOAuthProvider clientId={clientId}>
                <App {...props} />
            </GoogleOAuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
