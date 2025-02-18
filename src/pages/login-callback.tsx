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
        .then(() => {
          console.log('Logged in');
          // Redirect to main page or wherever
          router.push('/');
        })
        .catch((err) => console.error('Error signing in with custom token', err));
    }
  }, [router]);

  return (
    <div>
      <h1>Logging you in...</h1>
    </div>
  );
};

export default LoginCallbackPage;
