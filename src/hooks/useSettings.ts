import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Settings {
  downvoteEnabled: boolean;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    downvoteEnabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value');

        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }

        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>) || {};

        setSettings({
          downvoteEnabled: settingsMap.downvote_enabled === 'true'
        });
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to settings changes
    const settingsSubscription = supabase
      .channel('settings_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'settings'
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      settingsSubscription.unsubscribe();
    };
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value });

      if (error) {
        console.error('Error updating setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateSetting:', error);
      throw error;
    }
  };

  const toggleDownvote = async () => {
    const newValue = !settings.downvoteEnabled;
    await updateSetting('downvote_enabled', newValue.toString());
  };

  return {
    settings,
    loading,
    toggleDownvote
  };
};