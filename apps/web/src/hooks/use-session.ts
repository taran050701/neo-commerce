'use client';

import useSWR from 'swr';

const fetchSession = async () => {
  const response = await fetch('/api/auth/session', { credentials: 'include' });
  if (!response.ok) return null;
  return response.json();
};

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR('session', fetchSession, {
    suspense: false,
    revalidateOnFocus: false,
  });

  return {
    session: data,
    isLoading,
    error,
    mutate,
  };
}
