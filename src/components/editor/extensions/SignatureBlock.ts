import { Node, mergeAttributes } from '@tiptap/core';

export interface SignatureBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    signatureBlock: {
      setSignatureBlock: (details: { name: string; title?: string }) => ReturnType;
    };
  }
}

export const SignatureBlock = Node.create<SignatureBlockOptions>({
  name: 'signatureBlock',
  group: 'block',
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-signature-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(
      { 'data-signature-block': '' },
      { class: 'signature-block border-t mt-8 pt-4' },
      HTMLAttributes
    ), [
      ['div', { class: 'h-16 mb-2' }], // Space for signature
      ['div', { class: 'font-medium' }, HTMLAttributes.name],
      ['div', { class: 'text-sm text-muted-foreground' }, HTMLAttributes.title],
    ]];
  },

  addCommands() {
    return {
      setSignatureBlock:
        (details) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: details,
          });
        },
    };
  },
}); 