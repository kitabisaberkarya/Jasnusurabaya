
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Indent, Outdent, 
  Link as LinkIcon, Image as ImageIcon, Video, 
  Undo, Redo, Quote, RemoveFormatting, 
  Type, Heading1, Heading2, Palette, MoreHorizontal
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, placeholder }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal content with value prop only when not focused to prevent cursor jumping
  useEffect(() => {
    if (contentRef.current && !isFocused && value !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = value;
    }
  }, [value, isFocused]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput(); // Trigger update
    contentRef.current?.focus();
  };

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    cmd, 
    arg, 
    title,
    isActive = false 
  }: { icon: any, cmd: string, arg?: string, title: string, isActive?: boolean }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        exec(cmd, arg);
      }}
      className={`p-1.5 rounded-md transition-all duration-200 hover:bg-neutral-100 text-neutral-600 ${isActive ? 'bg-primary-50 text-primary-700' : ''}`}
      title={title}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );

  const handleInsertLink = () => {
    const url = prompt('Masukkan URL Link:');
    if (url) exec('createLink', url);
  };

  const handleInsertImage = () => {
    const url = prompt('Masukkan URL Gambar:');
    if (url) exec('insertImage', url);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block text-xs font-bold text-neutral-500 uppercase">{label}</label>}
      
      <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isFocused ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-lg' : 'border-neutral-300 shadow-sm'}`}>
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50/50">
          
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

          {/* Color & Inserts */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <div className="relative flex items-center justify-center p-1.5 hover:bg-neutral-100 rounded-md cursor-pointer" title="Warna Teks">
               <Palette size={18} className="text-neutral-600" />
               <input 
                 type="color" 
                 onChange={(e) => exec('foreColor', e.target.value)}
                 className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
               />
            </div>
            <button type="button" onClick={handleInsertLink} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-600" title="Insert Link"><LinkIcon size={18} /></button>
            <button type="button" onClick={handleInsertImage} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-600" title="Insert Image via URL"><ImageIcon size={18} /></button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="Align Left" />
            <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="Align Center" />
            <ToolbarButton icon={AlignRight} cmd="justifyRight" title="Align Right" />
            <ToolbarButton icon={AlignJustify} cmd="justifyFull" title="Justify" />
          </div>

          {/* Lists & Indent */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
            <ToolbarButton icon={List} cmd="insertUnorderedList" title="Bulleted List" />
            <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" title="Numbered List" />
            <ToolbarButton icon={Indent} cmd="indent" title="Indent" />
            <ToolbarButton icon={Outdent} cmd="outdent" title="Outdent" />
          </div>

          {/* Misc */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton icon={Quote} cmd="formatBlock" arg="BLOCKQUOTE" title="Quote" />
            <ToolbarButton icon={RemoveFormatting} cmd="removeFormat" title="Clear Formatting" />
          </div>
        </div>

        {/* EDITOR AREA */}
        <div 
          ref={contentRef}
          className="min-h-[400px] p-6 outline-none prose max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-md focus:bg-white bg-white overflow-y-auto"
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }} // Initial value only, managed by ref afterwards
          style={{
             minHeight: '400px',
             maxHeight: '600px'
          }}
          data-placeholder={placeholder}
        />
        
        <style>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: italic;
          }
        `}</style>
      </div>
      <p className="text-[10px] text-neutral-400 text-right">* Gunakan Ctrl+B, Ctrl+I, Ctrl+U untuk shortcut cepat.</p>
    </div>
  );
};
