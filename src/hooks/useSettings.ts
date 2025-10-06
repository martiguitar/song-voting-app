import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Settings {
  downvoteEnabled: boolean;
  imprintContentDe: string;
  imprintContentEn: string;
  privacyContentDe: string;
  privacyContentEn: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    downvoteEnabled: true,
    imprintContentDe: '',
    imprintContentEn: '',
    privacyContentDe: '',
    privacyContentEn: ''
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
          downvoteEnabled: settingsMap.downvote_enabled === 'true',
          imprintContentDe: settingsMap.imprint_content_de || '',
          imprintContentEn: settingsMap.imprint_content_en || '',
          privacyContentDe: settingsMap.privacy_content_de || '',
          privacyContentEn: settingsMap.privacy_content_en || ''
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
        .upsert({ key, value }, { onConflict: 'key' });

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
    setSettings(prev => ({ ...prev, downvoteEnabled: newValue }));
    await updateSetting('downvote_enabled', newValue.toString());
  };

  const updateLegalContent = async (
    type: 'imprint' | 'privacy',
    language: 'de' | 'en',
    content: string
  ) => {
    const key = `${type}_content_${language}`;
    const settingKey = type === 'imprint'
      ? (language === 'de' ? 'imprintContentDe' : 'imprintContentEn')
      : (language === 'de' ? 'privacyContentDe' : 'privacyContentEn');

    setSettings(prev => ({ ...prev, [settingKey]: content }));
    await updateSetting(key, content);
  };

  return {
    settings,
    loading,
    toggleDownvote,
    updateLegalContent
  };
};