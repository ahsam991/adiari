import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Setting } from '@/types/database';

export interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  free_shipping_threshold: number;
  shipping_fee: number;
  min_order_amount: number;
}

const defaultSettings: StoreSettings = {
  store_name: 'FreshCart',
  store_email: 'contact@freshcart.com',
  store_phone: '+91 1234567890',
  store_address: '123 Fresh Street, Mumbai, India',
  currency: 'INR',
  currency_symbol: '₹',
  tax_rate: 18,
  free_shipping_threshold: 500,
  shipping_fee: 40,
  min_order_amount: 100
};

export function useSettings() {
  const { data: rawSettings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;
      return data as Setting[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const settings: StoreSettings = rawSettings?.reduce((acc, setting) => {
    const value = typeof setting.value === 'string' 
      ? setting.value.replace(/^"|"$/g, '') 
      : setting.value;
    return { ...acc, [setting.key]: value };
  }, { ...defaultSettings }) || defaultSettings;

  const formatPrice = (price: number) => {
    return `${settings.currency_symbol}${price.toFixed(2)}`;
  };

  return {
    settings,
    isLoading,
    error,
    formatPrice
  };
}
