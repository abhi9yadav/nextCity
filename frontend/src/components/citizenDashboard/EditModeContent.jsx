import React from 'react';
import { MapPin } from 'lucide-react';

const EditModeContent = ({ form, setForm, theme }) => {
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-4">
      <div>
        <label className={`text-sm font-medium ${theme.textDefault}`}>Title</label>
        <input name="title" value={form.title} onChange={handleChange} className={`w-full p-2 border rounded-md ${theme.sectionBgTranslucent}`} />
      </div>
      <div>
        <label className={`text-sm font-medium ${theme.textDefault}`}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`w-full p-2 border rounded-md ${theme.sectionBgTranslucent}`} />
      </div>
      <div className={`p-3 rounded-md border ${theme.cardBorder} text-sm ${theme.textSubtle}`}>
        <MapPin size={14} className="inline mr-1" /> {form.location.address}
      </div>
    </div>
  );
};

export default EditModeContent;