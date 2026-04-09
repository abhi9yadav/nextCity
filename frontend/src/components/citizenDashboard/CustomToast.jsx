// CustomToast.jsx
import { CheckCircle, AlertTriangle } from 'lucide-react';
const CustomToast = ({ message, type }) => (
  <div className={`fixed bottom-10 right-10 px-6 py-4 rounded-xl border flex items-center gap-3 z-[9999] ${type === 'success' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
    {type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
    <span className="font-medium">{message}</span>
  </div>
);

export default CustomToast;