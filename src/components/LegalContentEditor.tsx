import React, { useState } from 'react';
import { FileText, Save, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LegalContentEditorProps {
  title: string;
  contentDe: string;
  contentEn: string;
  onSave: (contentDe: string, contentEn: string) => Promise<void>;
}

const LegalContentEditor: React.FC<LegalContentEditorProps> = ({
  title,
  contentDe,
  contentEn,
  onSave,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editContentDe, setEditContentDe] = useState(contentDe);
  const [editContentEn, setEditContentEn] = useState(contentEn);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(editContentDe, editContentEn);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContentDe(contentDe);
    setEditContentEn(contentEn);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="p-4 rounded-lg bg-neutral-800/50 border border-primary-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-100 flex items-center gap-2">
            <FileText size={20} />
            {title}
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-500/20 text-primary-300 rounded-md hover:bg-primary-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            {t('setup.edit')}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-2">Deutsch</h4>
            <div
              className="text-sm text-neutral-300 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: contentDe }}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-2">English</h4>
            <div
              className="text-sm text-neutral-300 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: contentEn }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-neutral-800/50 border border-primary-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-100 flex items-center gap-2">
          <FileText size={20} />
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Deutsch
          </label>
          <textarea
            value={editContentDe}
            onChange={(e) => setEditContentDe(e.target.value)}
            className="w-full h-40 px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-mono text-sm"
            placeholder="HTML-Inhalt..."
          />
          <p className="text-xs text-neutral-500 mt-1">{t('setup.htmlSupported')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            English
          </label>
          <textarea
            value={editContentEn}
            onChange={(e) => setEditContentEn(e.target.value)}
            className="w-full h-40 px-3 py-2 bg-neutral-900 border border-primary-500/30 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-mono text-sm"
            placeholder="HTML content..."
          />
          <p className="text-xs text-neutral-500 mt-1">{t('setup.htmlSupported')}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-primary-500 text-neutral-900 font-medium rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? t('setup.saving') : t('setup.save')}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 flex items-center gap-2 bg-neutral-700 text-neutral-300 rounded-md hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
          >
            <X size={18} />
            {t('songs.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalContentEditor;
