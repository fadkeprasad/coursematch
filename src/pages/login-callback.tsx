import React, { useEffect } from 'react';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useRouter } from 'next/router';  // if using Next.js

const LoginCallbackPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const token = new URL(window.location.href).searchParams.get('token');
    if (token) {
      const auth = getAuth();
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('✅ User UID:', user.uid);

          // Save lastSeen directly in localStorage
          const now = Date.now();
          const lastSeen = localStorage.getItem('lastSeen');
          localStorage.setItem('lastSeen', now.toString());
          console.log('✅ lastSeen saved in localStorage:', new Date(now).toLocaleString());

          // Determine if onboarding should show
          const lastSignIn = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null;
          if (!lastSeen || (now - Number(lastSeen)) / (1000 * 60 * 60) >= 72) {
            localStorage.setItem('showOnboarding', 'true');
            localStorage.setItem('onboardingStep', '1');
        } else {
            localStorage.removeItem('showOnboarding');
            localStorage.removeItem('onboardingStep');
        }

          console.log('✅ Logged in, redirecting...');
          router.push('/');
        })
        .catch((err) => {
          console.error('❌ Error signing in with custom token:', err);
        });
    }
  }, [router]);

  return (
    <div>
      <h1>Logging you in...</h1>
    </div>
  );
};

export default LoginCallbackPage;
