import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export type Plan = 'free' | 'pro' | 'campus';

interface Subscription {
  id: string;
  plan: Plan;
  status: string;
  offline_enabled: boolean;
  expires_at: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, plan, status, offline_enabled, expires_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) { setSubscription(null); setLoading(false); return; }
    if (data) {
      setSubscription(data as Subscription);
    } else {
      const { data: newSub } = await supabase
        .from('subscriptions')
        .insert({ plan: 'free', status: 'active', offline_enabled: false })
        .select('id, plan, status, offline_enabled, expires_at')
        .maybeSingle();
      setSubscription(newSub as Subscription | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const subscribe = useCallback(async (plan: Plan) => {
    if (!user) return { error: 'Not signed in' };
    const offlineEnabled = plan !== 'free';
    const expiresAt = plan !== 'free' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;
    const { data: existing } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ plan, status: 'active', offline_enabled: offlineEnabled, expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select('id, plan, status, offline_enabled, expires_at')
        .maybeSingle();
      if (error) return { error: error.message };
      setSubscription(data as Subscription);
      return { error: null };
    }
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: user.id, plan, status: 'active', offline_enabled: offlineEnabled, expires_at: expiresAt })
      .select('id, plan, status, offline_enabled, expires_at')
      .maybeSingle();
    if (error) return { error: error.message };
    setSubscription(data as Subscription);
    return { error: null };
  }, [user]);

  const cancelSubscription = useCallback(async () => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan: 'free', status: 'canceled', offline_enabled: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) return { error: error.message };
    await fetchSubscription();
    return { error: null };
  }, [user, fetchSubscription]);

  return {
    subscription, loading,
    plan: subscription?.plan ?? 'free',
    isPro: subscription?.plan === 'pro' || subscription?.plan === 'campus',
    offlineEnabled: subscription?.offline_enabled ?? false,
    subscribe, cancelSubscription, refresh: fetchSubscription,
  };
}
