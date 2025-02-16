import { Node, mergeAttributes } from '@tiptap/core';

export interface CitationOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      setCitation: (citation: { source: string; page?: string }) => ReturnType;
    };
  }
}

export const Citation = Node.create<CitationOptions>({
  name: 'citation',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      source: {
        default: null,
      },
      page: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-citation]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(
      { 'data-citation': '' },
      { class: 'citation inline-flex items-center rounded bg-muted px-2 py-1 text-sm' },
      HTMLAttributes
    ), `[${HTMLAttributes.source}${HTMLAttributes.page ? `, ${HTMLAttributes.page}` : ''}]`];
  },

  addCommands() {
    return {
      setCitation:
        (citation) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: citation,
          });
        },
    };
  },
}); 