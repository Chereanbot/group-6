"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Variable,
  BookOpen,
  PenTool
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Citation } from './extensions/Citation';
import { SignatureBlock } from './extensions/SignatureBlock';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const legalVariables = [
  { label: 'Client Name', value: '{{client_name}}' },
  { label: 'Client Address', value: '{{client_address}}' },
  { label: 'Matter Number', value: '{{matter_number}}' },
  { label: 'Date', value: '{{current_date}}' },
  { label: 'Attorney Name', value: '{{attorney_name}}' },
  { label: 'Firm Name', value: '{{firm_name}}' },
  { label: 'Court Name', value: '{{court_name}}' },
  { label: 'Case Number', value: '{{case_number}}' },
];

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your template content...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Citation.configure({
        HTMLAttributes: {
          class: 'citation',
        },
      }),
      SignatureBlock.configure({
        HTMLAttributes: {
          class: 'signature-block',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertVariable = (variable: string) => {
    editor.chain().focus().insertContent(variable).run();
  };

  const insertCitation = () => {
    const source = window.prompt('Enter citation source');
    if (source) {
      const page = window.prompt('Enter page number (optional)');
      editor.chain().focus().setCitation({ source, page }).run();
    }
  };

  const insertSignatureBlock = () => {
    const name = window.prompt('Enter name');
    if (name) {
      const title = window.prompt('Enter title (optional)');
      editor.chain().focus().setSignatureBlock({ name, title }).run();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Heading className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-active={editor.isActive('blockquote')}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          data-active={editor.isActive('link')}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          data-active={editor.isActive('codeBlock')}
          className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Variable className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {legalVariables.map((variable) => (
              <DropdownMenuItem 
                key={variable.value}
                onClick={() => insertVariable(variable.value)}
              >
                {variable.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {editor.isActive('table') && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              Add Column Before
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              Add Column After
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              Delete Column
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              Add Row Before
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              Add Row After
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              Delete Row
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={insertCitation}
        >
          <BookOpen className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertSignatureBlock}
        >
          <PenTool className="h-4 w-4" />
        </Button>
      </div>

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addLink}
              className={editor.isActive('link') ? 'bg-muted' : ''}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="min-h-[300px] prose-sm" />
    </div>
  );
} 