"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { 
    Bold, Italic, Underline as UnderlineIcon, 
    Link as LinkIcon, Image as ImageIcon, 
    Heading1, Heading2, List, ListOrdered, 
    Quote, Redo, Undo 
} from "lucide-react";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt("Enter image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const buttons = [
        { icon: <Bold className="w-4 h-4" />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
        { icon: <Italic className="w-4 h-4" />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
        { icon: <UnderlineIcon className="w-4 h-4" />, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), title: "Underline" },
        { type: "divider" },
        { icon: <Heading1 className="w-4 h-4" />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), title: "H1" },
        { icon: <Heading2 className="w-4 h-4" />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "H2" },
        { type: "divider" },
        { icon: <List className="w-4 h-4" />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet List" },
        { icon: <ListOrdered className="w-4 h-4" />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Ordered List" },
        { icon: <Quote className="w-4 h-4" />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), title: "Quote" },
        { type: "divider" },
        { icon: <LinkIcon className="w-4 h-4" />, action: setLink, active: editor.isActive("link"), title: "Link" },
        { icon: <ImageIcon className="w-4 h-4" />, action: addImage, active: false, title: "Image" },
        { type: "divider" },
        { icon: <Undo className="w-4 h-4" />, action: () => editor.chain().focus().undo().run(), active: false, title: "Undo" },
        { icon: <Redo className="w-4 h-4" />, action: () => editor.chain().focus().redo().run(), active: false, title: "Redo" },
    ];

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-xl">
            {buttons.map((btn, i) => btn.type === "divider" ? (
                <div key={i} className="w-px h-6 bg-gray-200 mx-1 self-center" />
            ) : (
                <button
                    key={i}
                    type="button"
                    onClick={btn.action}
                    className={`p-2 rounded-lg transition-colors ${btn.active ? "bg-primary text-white" : "text-primary/60 hover:bg-white hover:text-primary"}`}
                    title={btn.title}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Image,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-6 text-primary",
            },
        },
    });

    // Update content if it changes from outside (e.g. when loading an existing article)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="w-full border border-gray-200 rounded-xl overflow-hidden focus-within:border-secondary transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
}

import { useEffect } from "react";
