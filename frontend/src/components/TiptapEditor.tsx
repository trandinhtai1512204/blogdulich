'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import {
  Bold, Italic, Strikethrough, Link2, Image as ImageIcon,
  List, ListOrdered, Quote, Minus, Undo, Redo, Upload,
} from 'lucide-react';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ value, onChange, placeholder = 'Nhập nội dung bài viết...' }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-violet-600 underline' } }),
      Image.configure({ HTMLAttributes: { class: 'mx-auto rounded-xl max-w-full' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
  });

  // Sync external value changes (e.g. when editing existing post)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value);
  }, [value]);

  const addLink = () => {
    if (!editor) return;
    const url = prompt('Nhập URL:');
    if (!url) return;
    editor.chain().focus().toggleLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const url = prompt('Nhập URL ảnh:');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm') || /<[^>]+>/.test(text);
      if (isHtml) {
        editor.commands.setContent(text);
      } else {
        // Plain text / markdown: convert newlines to paragraphs
        const html = text
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('');
        editor.commands.setContent(html);
      }
      onChange(editor.getHTML());
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const ToolbarBtn = ({
    active, onClick, title, children,
  }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-violet-100 text-violet-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  );

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-400">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        {/* Headings */}
        <button type="button" title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          H1
        </button>
        <button type="button" title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          H2
        </button>
        <button type="button" title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          H3
        </button>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn title="Bold" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Gạch ngang" active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn title="Danh sách" active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Danh sách số" active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Trích dẫn" active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Đường kẻ ngang"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn title="Chèn link" active={editor.isActive('link')} onClick={addLink}>
          <Link2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Chèn ảnh (URL)" onClick={addImage}>
          <ImageIcon size={14} />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </ToolbarBtn>

        <span className="flex-1" />

        {/* File import */}
        <button type="button" title="Import file (.html, .txt)"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Upload size={13} />
          <span>Import</span>
        </button>
        <input ref={fileInputRef} type="file" accept=".html,.htm,.txt" className="hidden" onChange={importFile} />
      </div>

      {/* Editor area */}
      <div className="bg-white min-h-[320px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
