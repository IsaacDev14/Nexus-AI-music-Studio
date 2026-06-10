import React, { useCallback, useRef, useState } from 'react';
import { ArrowUpTrayIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

const ACCEPT = 'audio/*,video/mp4,video/webm,video/quicktime,.mp3,.wav,.m4a,.ogg,.flac,.mp4,.mov,.webm';

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  label?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelected,
  disabled = false,
  label = 'Drop audio or video here',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || disabled) return;
      onFileSelected(files[0]);
    },
    [disabled, onFileSelected]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
        dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500 mt-2">MP3, WAV, M4A, OGG, FLAC, MP4, MOV, WEBM (max 50 MB)</p>
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-indigo-600 font-medium">
        <MusicalNoteIcon className="w-4 h-4" />
        Detects BPM, key, and chord progression
      </div>
    </div>
  );
};

export default FileUploadZone;
