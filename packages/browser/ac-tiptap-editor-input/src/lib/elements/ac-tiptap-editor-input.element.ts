/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import Heading from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";

interface ToolbarItem {
  label: string;
  command: () => void;
  activeCheck?: () => boolean;
}

export class AcTiptapEditorInput extends AcInputBase {
  editor!: Editor;
  editorContainer?: HTMLDivElement;
  toolbar?: HTMLDivElement;
  headingSelect?: HTMLSelectElement;
  listSelect?: HTMLSelectElement;

  constructor() {
    super();
  }

  override get value(): any {
    return this.editor ? this.editor.getHTML() : super.value;
  }

  override set value(v: string) {
    if (this.editor && v !== this.editor.getHTML()) {
      this.editor.commands.setContent(v || '', { emitUpdate: false });
    }
    super.value = v;
  }

  private refreshActiveButtons() {
    this.querySelectorAll('button[ac-tiptap-action]').forEach((btn) => {
      const action = btn.getAttribute('ac-tiptap-action');
      if (!action) return;
      const isActive =
        (action === 'bold' && this.editor.isActive('bold')) ||
        (action === 'italic' && this.editor.isActive('italic')) ||
        (action === 'underline' && this.editor.isActive('underline')) ||
        (action === 'strike' && this.editor.isActive('strike')) ||
        (action === 'blockquote' && this.editor.isActive('blockquote')) ||
        (action === 'codeBlock' && this.editor.isActive('codeBlock')) ||
        (action === 'link' && this.editor.isActive('link'));
      btn.classList.toggle('active', !!isActive);
    });
  }

  private runAction(action: string) {
    const e = this.editor.chain().focus();
    switch (action) {
      case 'undo': e.undo().run(); break;
      case 'redo': e.redo().run(); break;
      case 'bold': e.toggleBold().run(); break;
      case 'italic': e.toggleItalic().run(); break;
      case 'underline': e.toggleUnderline().run(); break;
      case 'strike': e.toggleStrike().run(); break;
      case 'blockquote': e.toggleBlockquote().run(); break;
      case 'codeBlock': e.toggleCodeBlock().run(); break;
      // case 'link': this.handleLink(); break;
      // case 'image': this.handleImage(); break;
      // case 'highlight': this.handleHighlight(); break;
      case 'alignLeft': e.setTextAlign('left').run(); break;
      case 'alignCenter': e.setTextAlign('center').run(); break;
      case 'alignRight': e.setTextAlign('right').run(); break;
      case 'alignJustify': e.setTextAlign('justify').run(); break;
      default: break;
    }
    this.refreshActiveButtons();
  }

  updateToolbar() {
    const buttons = this.querySelectorAll('button[ac-tooltip]') as NodeListOf<HTMLButtonElement>;
    const activeChecks: { [key: string]: () => boolean } = {
      'Undo': () => false,
      'Redo': () => false,
      'Format text as heading': () => this.editor.isActive('heading'),
      'List options': () => this.editor.isActive('bulletList') || this.editor.isActive('orderedList') || this.editor.isActive('taskList'),
      'Blockquote': () => this.editor.isActive('blockquote'),
      'Code Block': () => this.editor.isActive('codeBlock'),
      'Bold': () => this.editor.isActive('bold'),
      'Italic': () => this.editor.isActive('italic'),
      'Strike': () => this.editor.isActive('strike'),
      'Code': () => this.editor.isActive('code'),
      'Underline': () => this.editor.isActive('underline'),
      'Highlight': () => this.editor.isActive('highlight'),
      'Link': () => this.editor.isActive('link'),
      // 'Superscript': () => this.editor.isActive('superscript'),
      // 'Subscript': () => this.editor.isActive('subscript'),
      'Align left': () => {
        const align = (this.editor.getAttributes('textAlign') as any).textAlign || 'left';
        return align === 'left';
      },
      'Align center': () => {
        const align = (this.editor.getAttributes('textAlign') as any).textAlign || 'left';
        return align === 'center';
      },
      'Align right': () => {
        const align = (this.editor.getAttributes('textAlign') as any).textAlign || 'left';
        return align === 'right';
      },
      'Align justify': () => {
        const align = (this.editor.getAttributes('textAlign') as any).textAlign || 'left';
        return align === 'justify';
      },
      'Add image': () => false,
      'Switch to light mode': () => false,
    };

    buttons.forEach(btn => {
      const label = btn.getAttribute('ac-tooltip');
      if (label && activeChecks[label]) {
        const isActive = activeChecks[label]();
        btn.setAttribute('aria-pressed', isActive.toString());
        btn.setAttribute('data-active-state', isActive ? 'on' : 'off');
      }
    });

    // Handle undo/redo disabled state
    const undoBtn = this.querySelector('button[ac-tooltip="Undo"]') as HTMLButtonElement;
    if (undoBtn) undoBtn.disabled = !this.editor.can().undo();

    const redoBtn = this.querySelector('button[ac-tooltip="Redo"]') as HTMLButtonElement;
    if (redoBtn) redoBtn.disabled = !this.editor.can().redo();

    // Update selects
    if (this.headingSelect) {
      const { level } = this.editor.getAttributes('heading');
      this.headingSelect.value = level ? level.toString() : '';
    }

    if (this.listSelect) {
      if (this.editor.isActive('bulletList')) {
        this.listSelect.value = 'bulletList';
      } else if (this.editor.isActive('orderedList')) {
        this.listSelect.value = 'orderedList';
      } else if (this.editor.isActive('taskList')) {
        this.listSelect.value = 'taskList';
      } else {
        this.listSelect.value = '';
      }
    }
  }

  setEditorUi(): string {
    const html: string = `
    <div class="simple-editor-wrapper">
      <div data-variant="fixed" class="tiptap-toolbar">
        <div style="flex: 1"></div>
        <div role="group" class="tiptap-toolbar-group">
          <button ac-tiptap-action="undo" class="tiptap-button" ac-tooltip="Undo" type="button"><ac-svg-icon>${ACI_SVG_SOLID.rotateLeft}</ac-svg-icon></button>
          <button ac-tiptap-action="redo" class="tiptap-button" ac-tooltip="Redo" type="button"><ac-svg-icon>${ACI_SVG_SOLID.rotateRight}</ac-svg-icon></button>
        </div>
        <div class="tiptap-separator" data-orientation="vertical" role="none"></div>
        <div role="group" class="tiptap-toolbar-group">
            <select ac-tiptap-action="header" class="heading-select">
                <option value="">Paragraph</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="4">Heading 4</option>
                <option value="5">Heading 5</option>
                <option value="6">Heading 6</option>
            </select>
            <select ac-tiptap-action="list" class="list-select">
                <option value="">Text</option>
                <option value="bulletList">Bullet List</option>
                <option value="orderedList">Ordered List</option>
                <option value="taskList">Task List</option>
            </select>
            <button ac-tiptap-action="quote" class="tiptap-button" ac-tooltip="Blockquote" type="button"><ac-svg-icon>${ACI_SVG_SOLID.quoteRight}</ac-svg-icon></button>
            <button ac-tiptap-action="codeBlock" class="tiptap-button" ac-tooltip="Code Block" type="button"><ac-svg-icon>${ACI_SVG_SOLID.squareTerminal}</ac-svg-icon></button>
        </div>
        <div class="tiptap-separator" data-orientation="vertical" role="none"></div>
        <div role="group" class="tiptap-toolbar-group">
            <button ac-tiptap-action="bold" class="tiptap-button" ac-tooltip="Bold" type="button"><ac-svg-icon>${ACI_SVG_SOLID.bold}</ac-svg-icon></button>
            <button ac-tiptap-action="italic" class="tiptap-button" ac-tooltip="Italic" type="button"><ac-svg-icon>${ACI_SVG_SOLID.italic}</ac-svg-icon></button>
            <button ac-tiptap-action="strikeThrough" class="tiptap-button" ac-tooltip="Strike" type="button"><ac-svg-icon>${ACI_SVG_SOLID.strikethrough}</ac-svg-icon></button>
            <button ac-tiptap-action="code" class="tiptap-button" ac-tooltip="Code" type="button"><ac-svg-icon>${ACI_SVG_SOLID.code}</ac-svg-icon></button>
            <button ac-tiptap-action="underline" class="tiptap-button" ac-tooltip="Underline" type="button"><ac-svg-icon>${ACI_SVG_SOLID.underline}</ac-svg-icon></button>
            <button ac-tiptap-action="highlight" class="tiptap-button" ac-tooltip="Highlight" type="button"><ac-svg-icon>${ACI_SVG_SOLID.highlighter}</ac-svg-icon></button>
            <button ac-tiptap-action="link" class="tiptap-button" ac-tooltip="Link" type="button"><ac-svg-icon>${ACI_SVG_SOLID.link}</ac-svg-icon></button>
        </div>
        <div class="tiptap-separator" data-orientation="vertical" role="none"></div>
        <div role="group" class="tiptap-toolbar-group">
            <button ac-tiptap-action="superscript" class="tiptap-button" ac-tooltip="Superscript" type="button"><ac-svg-icon>${ACI_SVG_SOLID.superscript}</ac-svg-icon></button>
            <button ac-tiptap-action="subscript" class="tiptap-button" ac-tooltip="Subscript" type="button"><ac-svg-icon>${ACI_SVG_SOLID.subscript}</ac-svg-icon></button>
        </div>
        <div class="tiptap-separator" data-orientation="vertical" role="none"></div>
        <div role="group" class="tiptap-toolbar-group">
            <button ac-tiptap-action="alignLeft" class="tiptap-button" ac-tooltip="Align left" type="button"><ac-svg-icon>${ACI_SVG_SOLID.alignLeft}</ac-svg-icon></button>
            <button ac-tiptap-action="alignCenter" class="tiptap-button" ac-tooltip="Align center" type="button"><ac-svg-icon>${ACI_SVG_SOLID.alignCenter}</ac-svg-icon></button>
            <button ac-tiptap-action="alignRight" class="tiptap-button" ac-tooltip="Align right" type="button"><ac-svg-icon>${ACI_SVG_SOLID.alignRight}</ac-svg-icon></button>
            <button ac-tiptap-action="alignJustify" class="tiptap-button" ac-tooltip="Align justify" type="button"><ac-svg-icon>${ACI_SVG_SOLID.alignJustify}</ac-svg-icon></button>
        </div>
        <div class="tiptap-separator" data-orientation="vertical" role="none"></div>
        <div role="group" class="tiptap-toolbar-group">
            <button ac-tiptap-action="addImage" class="tiptap-button" ac-tooltip="Add image" type="button" ><span class="tiptap-button-text">Add</span> <ac-svg-icon>${ACI_SVG_SOLID.image}</ac-svg-icon></button>
        </div>
        <div style="flex: 1"></div>
        <div role="group" class="tiptap-toolbar-group">
            <button ac-tiptap-action="switchMode" class="tiptap-button" ac-tooltip="Switch mode"><ac-svg-icon>${ACI_SVG_SOLID.eclipse}</ac-svg-icon></button>
        </div>
    </div>
    <div class="simple-editor-content" editable></div>
</div>
    `;
    return html;
  }

  override connectedCallback() {
    super.connectedCallback();
    console.dir(this);

    this.innerHTML = this.setEditorUi();

    this.editorContainer = this.querySelector('.simple-editor-content') as HTMLDivElement;
    this.toolbar = this.querySelector('.tiptap-toolbar') as HTMLDivElement;
    this.headingSelect = this.querySelector('.heading-select') as HTMLSelectElement;
    this.listSelect = this.querySelector('.list-select') as HTMLSelectElement;

    this.inputElement = this.editorContainer as unknown as HTMLTextAreaElement; // maintain type compatibility

    // Bind select events
    if (this.headingSelect) {
      this.headingSelect.addEventListener('change', (e) => {
        const level = (e.target as HTMLSelectElement).value;
        if (level) {
          this.editor.chain().focus().toggleHeading({ level: parseInt(level) }).run();
        } else {
          this.editor.chain().focus().setParagraph().run();
        }
        this.headingSelect!.value = '';
      });
    }

    if (this.listSelect) {
      this.listSelect.addEventListener('change', (e) => {
        const type = (e.target as HTMLSelectElement).value;
        if (type === 'bulletList') {
          this.editor.chain().focus().toggleBulletList().run();
        } else if (type === 'orderedList') {
          this.editor.chain().focus().toggleOrderedList().run();
        } else if (type === 'taskList') {
          this.editor.chain().focus().toggleTaskList().run();
        }
        this.listSelect!.value = '';
      });
    }

    // Initialize Tiptap Editor
    this.editor = new Editor({
      element: this.editorContainer,
      extensions: [
        StarterKit,
        // History,
        Placeholder.configure({
          placeholder: "Write something …",
          emptyNodeClass: "is-empty",
        }),
        Underline,
        Strike,
        Image.configure({
          inline: false,
          allowBase64: true,
        }),
        TaskList,
        TaskItem.configure({
          HTMLAttributes: {
            class: 'task-list-item',
          },
        }),
        TextAlign.configure({
          types: [
            'heading',
            'paragraph',
          ],
        }),
        HorizontalRule,
        Superscript,
        Subscript,
        Highlight.configure({
          multicolor: true,
        }),
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'ProseMirror',
        },
      },
      onCreate: () => {
        this.updateToolbar();
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.value = html;
        this.dispatchEvent(new Event('input', { bubbles: true }));
        this.updateToolbar();
      },
      onSelectionUpdate: () => {
        this.updateToolbar();
      },
      onTransaction: () => {
        this.updateToolbar();
      },
    });

    // Set value if provided
    if (this.value) {
      this.editor.commands.setContent(this.value, { emitUpdate: false });
    }

    this.querySelectorAll('button[ac-tiptap-action]').forEach((btn) => {
      const action = btn.getAttribute('ac-tiptap-action');
      btn.addEventListener('click', () => this.runAction(action!));
    });


    this.updateToolbar();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.editor?.destroy();
  }
}

acRegisterCustomElement({ tag: 'ac-tiptap-editor-input', type: AcTiptapEditorInput });
