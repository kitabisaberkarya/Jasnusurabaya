
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Indent, Outdent, 
  Link as LinkIcon, Image as ImageIcon, Video, 
  Undo, Redo, Quote, RemoveFormatting, 
  Type, Heading1, Heading2, Palette, MoreHorizontal,
  ImagePlus, Trash2, Monitor, Smartphone, Maximize, Move
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  onUpload?: (file: File) => Promise<string | null>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, placeholder, onUpload }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync internal content with value prop only when not focused to prevent cursor jumping
  // and only if value is substantially different (basic check)
  useEffect(() => {
    if (contentRef.current && !isFocused && value !== contentRef.current.innerHTML) {
      // Basic check to avoid resetting cursor if simple updates happen, 
      // but here we trust value prop is "source of truth" when blurred.
      if (document.activeElement !== contentRef.current) {
          contentRef.current.innerHTML = value;
      }
    }
  }, [value, isFocused]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput(); 
    contentRef.current?.focus();
  };

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImg(target as HTMLImageElement);
    } else {
      setSelectedImg(null);
    }
  };

  const handleKeyUp = () => {
    // Check selection for active formatting if we want to highlight toolbar buttons (skipped for brevity)
    handleInput();
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    cmd, 
    arg, 
    title,
    onClick,
    isActive = false,
    className = ""
  }: { icon: any, cmd?: string, arg?: string, title: string, onClick?: () => void, isActive?: boolean, className?: string }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        else if (cmd) exec(cmd, arg);
      }}
      className={`p-1.5 rounded-md transition-all duration-200 hover:bg-neutral-100 text-neutral-600 ${isActive ? 'bg-primary-50 text-primary-700' : ''} ${className}`}
      title={title}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );

  const handleInsertLink = () => {
    const url = prompt('Masukkan URL Link:');
    if (url) exec('createLink', url);
  };

  const handleInsertImageURL = () => {
    const url = prompt('Masukkan URL Gambar:');
    if (url) exec('insertImage', url);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        // Save current selection
        const selection = document.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

        const url = await onUpload(file);
        
        if (url) {
          // Restore selection if lost (focus editor first)
          contentRef.current?.focus();
          if (range) {
             selection?.removeAllRanges();
             selection?.addRange(range);
          }
          exec('insertImage', url);
        }
      } catch (error) {
        console.error("Failed to upload image inside editor", error);
        alert("Gagal mengupload gambar.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Image Manipulation Functions
  const setImageAlignment = (align: 'left' | 'center' | 'right') => {
    if (!selectedImg) return;
    
    // Reset styles
    selectedImg.style.display = '';
    selectedImg.style.float = '';
    selectedImg.style.margin = '';
    
    if (align === 'left') {
      selectedImg.style.float = 'left';
      selectedImg.style.marginRight = '1rem';
      selectedImg.style.marginBottom = '0.5rem';
    } else if (align === 'right') {
      selectedImg.style.float = 'right';
      selectedImg.style.marginLeft = '1rem';
      selectedImg.style.marginBottom = '0.5rem';
    } else if (align === 'center') {
      selectedImg.style.display = 'block';
      selectedImg.style.margin = '0 auto 1rem auto';
    }
    handleInput();
    setSelectedImg(null); // Deselect after action
  };

  const setImageWidth = (width: string) => {
    if (!selectedImg) return;
    selectedImg.style.width = width;
    selectedImg.style.height = 'auto';
    handleInput();
  };

  const removeImage = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    handleInput();
    setSelectedImg(null);
  };

  return (
    <div className="flex flex-col gap-2 relative group/editor">
      {label && <label className="block text-xs font-bold text-neutral-500 uppercase">{label}</label>}
      
      <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isFocused ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-lg' : 'border-neutral-300 shadow-sm'}`}>
        
        {/* MAIN TOOLBAR */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50/50 sticky top-0 z-10">
          
          {/* History */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <ToolbarButton icon={Undo} cmd="undo" title="Undo" />
            <ToolbarButton icon={Redo} cmd="redo" title="Redo" />
          </div>

          {/* Typography */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
             <div className="relative group">
                <button type="button" className="p-1.5 flex items-center gap-1 hover:bg-neutral-100 rounded-md text-xs font-bold text-neutral-600">
                   <Type size={18} /> Normal <MoreHorizontal size={12}/>
                </button>
                <div className="absolute top-full left-0 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 hidden group-hover:block z-50 min-w-[150px]">
                   <button type="button" onClick={() => exec('formatBlock', 'P')} className="block w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm">Normal Paragraph</button>
                   <button type="button" onClick={() => exec('formatBlock', 'H2')} className="block w-full text-left px-4 py-2 hover:bg-neutral-50 text-lg font-bold">Judul Besar (H2)</button>
                   <button type="button" onClick={() => exec('formatBlock', 'H3')} className="block w-full text-left px-4 py-2 hover:bg-neutral-50 text-md font-bold">Sub Judul (H3)</button>
                   <button type="button" onClick={() => exec('formatBlock', 'PRE')} className="block w-full text-left px-4 py-2 hover:bg-neutral-50 font-mono text-xs bg-neutral-100 mt-1 mx-2 rounded">Code Block</button>
                </div>
             </div>
          </div>

          {/* Styling */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <ToolbarButton icon={Bold} cmd="bold" title="Bold (Ctrl+B)" />
            <ToolbarButton icon={Italic} cmd="italic" title="Italic (Ctrl+I)" />
            <ToolbarButton icon={Underline} cmd="underline" title="Underline (Ctrl+U)" />
            <ToolbarButton icon={Strikethrough} cmd="strikeThrough" title="Strikethrough" />
          </div>

          {/* Inserts */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <ToolbarButton icon={LinkIcon} onClick={handleInsertLink} title="Insert Link" />
            
            {onUpload && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/gif, image/webp"
                />
                <button 
                  type="button"
                  onClick={triggerFileUpload}
                  disabled={isUploading}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-neutral-100 text-neutral-600 relative"
                  title="Upload & Insert Image"
                >
                  <ImagePlus size={18} strokeWidth={2} className={isUploading ? 'opacity-30' : ''} />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              </>
            )}
            
            <ToolbarButton icon={ImageIcon} onClick={handleInsertImageURL} title="Insert Image via URL" />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="Align Left" />
            <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="Align Center" />
            <ToolbarButton icon={AlignRight} cmd="justifyRight" title="Align Right" />
            <ToolbarButton icon={AlignJustify} cmd="justifyFull" title="Justify" />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton icon={List} cmd="insertUnorderedList" title="Bulleted List" />
            <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" title="Numbered List" />
            <ToolbarButton icon={Quote} cmd="formatBlock" arg="BLOCKQUOTE" title="Quote" />
          </div>
        </div>

        {/* EDITOR CONTENT */}
        <div className="relative">
          <div 
            ref={contentRef}
            className="min-h-[400px] p-6 outline-none prose max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-md prose-img:cursor-pointer focus:bg-white bg-white overflow-y-auto"
            contentEditable
            onInput={handleInput}
            onClick={handleEditorClick}
            onKeyUp={handleKeyUp}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            dangerouslySetInnerHTML={{ __html: value }} 
            style={{
              minHeight: '400px',
              maxHeight: '700px'
            }}
            data-placeholder={placeholder}
          />

          {/* IMAGE CONTEXT TOOLBAR (Visible when an image is selected) */}
          {selectedImg && (
            <div className="absolute top-4 right-4 bg-white shadow-2xl border border-neutral-200 rounded-lg p-2 flex flex-col gap-2 z-50 animate-in fade-in zoom-in duration-200">
               <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center mb-1">Atur Gambar</div>
               
               <div className="flex items-center justify-center gap-1 border-b border-neutral-100 pb-2">
                  <button onClick={() => setImageAlignment('left')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600" title="Align Left (Wrap Text)"><AlignLeft size={16}/></button>
                  <button onClick={() => setImageAlignment('center')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600" title="Center"><AlignCenter size={16}/></button>
                  <button onClick={() => setImageAlignment('right')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600" title="Align Right (Wrap Text)"><AlignRight size={16}/></button>
               </div>

               <div className="flex items-center justify-center gap-1 border-b border-neutral-100 pb-2">
                  <button onClick={() => setImageWidth('25%')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600 text-xs font-bold">25%</button>
                  <button onClick={() => setImageWidth('50%')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600 text-xs font-bold">50%</button>
                  <button onClick={() => setImageWidth('75%')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600 text-xs font-bold">75%</button>
                  <button onClick={() => setImageWidth('100%')} className="p-2 hover:bg-neutral-100 rounded text-neutral-600 text-xs font-bold">100%</button>
               </div>

               <button onClick={removeImage} className="w-full py-1.5 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded text-xs font-bold transition">
                  <Trash2 size={14}/> Hapus Gambar
               </button>
            </div>
          )}
        </div>
        
        <style>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: italic;
          }
          /* Custom styles for image floats visibility in editor */
          .prose img { transition: all 0.2s; border: 2px solid transparent; }
          .prose img:hover { border-color: #3b82f6; }
        `}</style>
      </div>
      <p className="text-[10px] text-neutral-400 text-right flex items-center justify-end gap-2">
         {isUploading ? <span className="text-primary-600 animate-pulse font-bold">Sedang mengupload gambar...</span> : <span>* Klik gambar untuk mengatur posisi (kiri/tengah/kanan) dan ukuran.</span>}
      </p>
    </div>
  );
};
