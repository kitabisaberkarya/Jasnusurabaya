
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Indent, Outdent, 
  Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, Quote, Type, 
  Heading1, Heading2, Heading3, 
  ImagePlus, Trash2, Scissors, Copy, Clipboard,
  ChevronDown, FileText, Layout
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  onUpload?: (file: File) => Promise<string | null>;
}

type TabType = 'Home' | 'Insert' | 'View';

// Helper Components moved outside to avoid re-creation and fix types
const RibbonGroup = ({ label, children, className = "" }: { label: string, children?: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col items-center justify-between px-3 border-r border-neutral-300 last:border-0 h-full py-1 ${className}`}>
     <div className="flex items-center gap-1 flex-1">{children}</div>
     <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-1 select-none">{label}</div>
  </div>
);

const RibbonButton = ({ icon: Icon, label, onClick, subLabel, large = false, active = false }: any) => {
  if (large) {
      return (
          <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-neutral-200 transition h-full min-w-[50px] ${active ? 'bg-neutral-300' : ''}`}>
              <Icon size={24} strokeWidth={1.5} className="text-neutral-700"/>
              <span className="text-[10px] font-medium text-neutral-700 leading-tight text-center">{label}</span>
              {subLabel && <span className="text-[9px] text-neutral-500">{subLabel}</span>}
          </button>
      )
  }
  return (
      <button type="button" onClick={onClick} className={`p-1 rounded hover:bg-neutral-200 transition text-neutral-700 ${active ? 'bg-neutral-300 shadow-inner' : ''}`} title={label}>
          <Icon size={16} strokeWidth={2}/>
      </button>
  )
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, placeholder, onUpload }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Sync Content
  useEffect(() => {
    if (contentRef.current) {
      if (value !== contentRef.current.innerHTML) {
        if (document.activeElement !== contentRef.current) {
            contentRef.current.innerHTML = value;
        }
      }
      // Count words
      const text = contentRef.current.innerText || "";
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [value]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput(); 
    contentRef.current?.focus();
  };

  const handleInput = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      onChange(html);
      const text = contentRef.current.innerText || "";
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
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

  // Upload Logic
  const triggerFileUpload = () => fileInputRef.current?.click();
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        if (url) {
          contentRef.current?.focus();
          exec('insertImage', url);
        }
      } catch (error) {
        alert("Gagal mengupload gambar.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Image Manipulation
  const setImageAlignment = (align: 'left' | 'center' | 'right') => {
    if (!selectedImg) return;
    selectedImg.style.display = align === 'center' ? 'block' : '';
    selectedImg.style.float = align === 'center' ? '' : align;
    selectedImg.style.margin = align === 'center' ? '0 auto 1rem auto' : (align === 'left' ? '0 1rem 0.5rem 0' : '0 0 0.5rem 1rem');
    handleInput();
    setSelectedImg(null);
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
    <div className="flex flex-col gap-2 relative group/editor font-sans">
      {label && <label className="block text-sm font-bold text-neutral-700 mb-1">{label}</label>}
      
      <div className={`flex flex-col bg-[#f3f4f6] border border-neutral-300 rounded-xl overflow-hidden shadow-md transition-all duration-300 ${isFocused ? 'ring-2 ring-primary-500/30 border-primary-500' : ''}`}>
        
        {/* 1. TOP TABS (Word Style) */}
        <div className="flex items-center bg-primary-900 text-white px-2 pt-2 gap-1 select-none">
            <div className="px-4 py-1.5 text-xs font-bold text-white/80">File</div>
            {['Home', 'Insert', 'View'].map((tab) => (
                <button 
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as TabType)}
                    className={`px-5 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${activeTab === tab ? 'bg-[#f3f4f6] text-neutral-900' : 'text-white hover:bg-white/10'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* 2. RIBBON TOOLBAR */}
        <div className="h-24 bg-[#f3f4f6] border-b border-neutral-300 flex items-stretch px-2 overflow-x-auto shadow-sm select-none">
            
            {/* --- HOME TAB --- */}
            {activeTab === 'Home' && (
                <>
                    <RibbonGroup label="Clipboard">
                         <RibbonButton icon={Clipboard} label="Paste" large onClick={() => {}} />
                         <div className="flex flex-col gap-1">
                             <RibbonButton icon={Scissors} label="Cut" onClick={() => {}} />
                             <RibbonButton icon={Copy} label="Copy" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Font">
                         <div className="flex flex-col gap-2">
                             <div className="flex gap-1 border-b border-neutral-300 pb-1">
                                 <RibbonButton icon={Bold} label="Bold" onClick={() => exec('bold')} />
                                 <RibbonButton icon={Italic} label="Italic" onClick={() => exec('italic')} />
                                 <RibbonButton icon={Underline} label="Underline" onClick={() => exec('underline')} />
                                 <RibbonButton icon={Strikethrough} label="Strikethrough" onClick={() => exec('strikeThrough')} />
                             </div>
                             <div className="flex gap-1">
                                 <select onChange={(e) => exec('formatBlock', e.target.value)} className="h-6 text-xs border border-neutral-300 rounded bg-white px-1 w-24">
                                     <option value="P">Normal</option>
                                     <option value="H2">Heading 1</option>
                                     <option value="H3">Heading 2</option>
                                     <option value="PRE">Code</option>
                                 </select>
                                 <RibbonButton icon={Type} label="Clear Format" onClick={() => exec('removeFormat')} />
                             </div>
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Paragraph">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                                <RibbonButton icon={List} label="Bullets" onClick={() => exec('insertUnorderedList')} />
                                <RibbonButton icon={ListOrdered} label="Numbering" onClick={() => exec('insertOrderedList')} />
                                <div className="w-[1px] bg-neutral-300 mx-1 h-4"></div>
                                <RibbonButton icon={Outdent} label="Outdent" onClick={() => exec('outdent')} />
                                <RibbonButton icon={Indent} label="Indent" onClick={() => exec('indent')} />
                            </div>
                            <div className="flex gap-1">
                                <RibbonButton icon={AlignLeft} label="Left" onClick={() => exec('justifyLeft')} />
                                <RibbonButton icon={AlignCenter} label="Center" onClick={() => exec('justifyCenter')} />
                                <RibbonButton icon={AlignRight} label="Right" onClick={() => exec('justifyRight')} />
                                <RibbonButton icon={AlignJustify} label="Justify" onClick={() => exec('justifyFull')} />
                            </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Editing">
                        <div className="flex flex-col gap-2">
                             <RibbonButton icon={Undo} label="Undo" onClick={() => exec('undo')} />
                             <RibbonButton icon={Redo} label="Redo" onClick={() => exec('redo')} />
                        </div>
                    </RibbonGroup>
                </>
            )}

            {/* --- INSERT TAB --- */}
            {activeTab === 'Insert' && (
                <>
                    <RibbonGroup label="Pages">
                        <RibbonButton icon={FileText} label="Cover Page" large onClick={() => {}} />
                        <RibbonButton icon={Layout} label="Blank Page" large onClick={() => {}} />
                    </RibbonGroup>

                    <RibbonGroup label="Illustrations">
                        {onUpload && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                                <RibbonButton icon={ImagePlus} label="Pictures" subLabel="From Device" large onClick={triggerFileUpload} />
                            </>
                        )}
                        <RibbonButton icon={ImageIcon} label="Online" subLabel="Pictures" large onClick={() => {
                            const url = prompt('Masukkan URL Gambar:');
                            if (url) exec('insertImage', url);
                        }} />
                    </RibbonGroup>

                    <RibbonGroup label="Links">
                        <RibbonButton icon={LinkIcon} label="Hyperlink" large onClick={() => {
                            const url = prompt('Masukkan URL Link:');
                            if (url) exec('createLink', url);
                        }} />
                    </RibbonGroup>
                    
                    <RibbonGroup label="Text">
                        <RibbonButton icon={Quote} label="Quote" large onClick={() => exec('formatBlock', 'BLOCKQUOTE')} />
                    </RibbonGroup>
                </>
            )}
            
            {/* --- VIEW TAB --- */}
             {activeTab === 'View' && (
                <RibbonGroup label="Document Views">
                    <div className="flex gap-2">
                        <RibbonButton icon={FileText} label="Print Layout" large active onClick={() => {}} />
                        <RibbonButton icon={Layout} label="Web Layout" large onClick={() => {}} />
                    </div>
                </RibbonGroup>
            )}

        </div>

        {/* 3. EDITOR WORKSPACE (Paper Style) */}
        <div className="bg-[#e5e5e5] p-4 sm:p-8 flex justify-center min-h-[500px] overflow-y-auto relative cursor-text" onClick={() => contentRef.current?.focus()}>
           
           {/* THE PAPER */}
           <div 
             ref={contentRef}
             className="bg-white w-full max-w-[816px] min-h-[800px] p-[2.5cm] shadow-xl outline-none prose max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-img:rounded-sm focus:ring-0"
             contentEditable
             onInput={handleInput}
             onClick={(e) => { e.stopPropagation(); handleEditorClick(e); }}
             onFocus={() => setIsFocused(true)}
             onBlur={() => setIsFocused(false)}
             data-placeholder={placeholder}
           />

           {/* IMAGE CONTEXT MENU (Floating) */}
           {selectedImg && (
            <div className="absolute top-10 right-10 bg-white shadow-2xl border border-neutral-200 rounded-lg p-2 flex flex-col gap-2 z-50 animate-in fade-in zoom-in duration-200 w-48">
               <div className="text-[10px] font-bold text-white bg-primary-700 -mx-2 -mt-2 p-2 rounded-t-lg mb-1 text-center">PICTURE TOOLS</div>
               
               <div className="text-[10px] font-bold text-neutral-500 uppercase">Alignment</div>
               <div className="flex items-center justify-between gap-1 border-b border-neutral-100 pb-2">
                  <button onClick={() => setImageAlignment('left')} className="p-2 hover:bg-neutral-100 rounded" title="Left"><AlignLeft size={16}/></button>
                  <button onClick={() => setImageAlignment('center')} className="p-2 hover:bg-neutral-100 rounded" title="Center"><AlignCenter size={16}/></button>
                  <button onClick={() => setImageAlignment('right')} className="p-2 hover:bg-neutral-100 rounded" title="Right"><AlignRight size={16}/></button>
               </div>

               <div className="text-[10px] font-bold text-neutral-500 uppercase">Size</div>
               <div className="grid grid-cols-4 gap-1 border-b border-neutral-100 pb-2">
                  <button onClick={() => setImageWidth('25%')} className="p-1 hover:bg-neutral-100 rounded text-[10px]">25%</button>
                  <button onClick={() => setImageWidth('50%')} className="p-1 hover:bg-neutral-100 rounded text-[10px]">50%</button>
                  <button onClick={() => setImageWidth('75%')} className="p-1 hover:bg-neutral-100 rounded text-[10px]">75%</button>
                  <button onClick={() => setImageWidth('100%')} className="p-1 hover:bg-neutral-100 rounded text-[10px]">100%</button>
               </div>

               <button onClick={removeImage} className="w-full py-1.5 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded text-xs font-bold transition">
                  <Trash2 size={14}/> Delete Image
               </button>
            </div>
          )}

           {/* UPLOAD SPINNER */}
           {isUploading && (
              <div className="absolute inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-neutral-700">Uploading Image...</span>
                  </div>
              </div>
           )}

        </div>
        
        {/* 4. STATUS BAR */}
        <div className="bg-primary-900 text-white text-[10px] px-4 py-1 flex justify-between items-center select-none">
            <div className="flex gap-4">
                <span>Page 1 of 1</span>
                <span>{wordCount} Words</span>
                <span>Indonesia</span>
            </div>
            <div className="flex gap-2">
                <span>Print Layout</span>
                <span>100%</span>
            </div>
        </div>

        <style>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: italic;
          }
          .prose {
             font-family: 'Times New Roman', Times, serif; /* Default Word Font */
             font-size: 12pt;
          }
          .prose p { margin-bottom: 0.5em; margin-top: 0.5em; line-height: 1.5; }
          .prose h2 { font-size: 18pt; font-weight: bold; color: #2e74b5; margin-top: 1em; }
          .prose h3 { font-size: 14pt; font-weight: bold; color: #2e74b5; margin-top: 1em; }
          .prose blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; color: #4b5563; font-style: italic; }
          .prose img { transition: all 0.2s; border: 1px solid transparent; }
          .prose img:hover { border-color: #3b82f6; cursor: pointer; }
        `}</style>
      </div>
    </div>
  );
};
