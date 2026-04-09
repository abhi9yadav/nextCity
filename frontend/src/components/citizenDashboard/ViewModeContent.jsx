import React from 'react';
import { MapPin } from 'lucide-react';

const InfoBlock = ({ label, children, theme }) => (
  <div>
    <label className={`text-xs font-semibold uppercase tracking-wider ${theme.textSubtle}`}>{label}</label>
    <div className={`text-base mt-1 ${theme.textDefault}`}>{children}</div>
  </div>
);

const ViewModeContent = ({ complaint, theme }) => (
  <>
    <InfoBlock label="Title" theme={theme}><p>{complaint.title}</p></InfoBlock>
    <InfoBlock label="Description" theme={theme}><p className="whitespace-pre-line">{complaint.description}</p></InfoBlock>
    <InfoBlock label="Status" theme={theme}>
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        {complaint.status}
      </span>
    </InfoBlock>
    <InfoBlock label="Location" theme={theme}>
      <p className="flex items-center gap-2"><MapPin size={14} className={theme.primaryAccentText} /> {complaint.location?.address}</p>
    </InfoBlock>
  </>
);

export default ViewModeContent;