// ImageLightbox.jsx
import { X } from 'lucide-react';
const ImageLightbox = ({ url, onClose }) => (
  <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
    <button className="absolute top-6 right-6 text-white cursor-pointer"><X size={30} /></button>
    <img src={url} className="max-h-[90vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
  </div>
);
export default ImageLightbox;