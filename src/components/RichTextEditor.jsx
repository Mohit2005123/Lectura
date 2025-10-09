'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const RichTextEditor = forwardRef(function RichTextEditor({ value, onChange, placeholder = 'Start typing...', showToolbar = true, onFocus }, ref) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Keep innerHTML in sync when value changes from parent
  useEffect(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    if (value !== currentHtml) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Update active formatting state on selection change within this editor
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      const selection = document.getSelection();
      if (!selection) return;
      if (!editorRef.current.contains(selection.anchorNode)) return;
      try {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
        // Save the selection range for later restoration (e.g., toolbar clicks)
        if (selection.rangeCount > 0) {
          savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        }
      } catch (_) {}
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const exec = (cmd, value = null) => {
    if (!editorRef.current) return;
    // Restore selection before executing command to ensure it applies to intended text
    const sel = document.getSelection();
    if (savedRangeRef.current && sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      } catch (_) {}
    }
    editorRef.current.focus();
    try {
      document.execCommand(cmd, false, value);
    } catch (_) {}
    // propagate updated HTML
    if (typeof onChange === 'function') {
      onChange(editorRef.current.innerHTML);
    }
  };

  useImperativeHandle(ref, () => ({
    exec,
    focus: () => editorRef.current?.focus(),
    getHTML: () => editorRef.current?.innerHTML || ''
  }));

  const handleInput = () => {
    if (!editorRef.current) return;
    if (typeof onChange === 'function') {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    // Paste as plain text to avoid messy external styles
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e) => {
    // List indent/outdent disabled as lists are removed
  };

  const handleEditorMouseUp = () => {
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  return (
    <div className="w-full">
      {showToolbar && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => exec('bold')}
            className={`px-2 py-1 rounded border border-gray-700 text-white ${isBold ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className={`px-2 py-1 rounded border border-gray-700 text-white italic ${isItalic ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className={`px-2 py-1 rounded border border-gray-700 text-white underline ${isUnderline ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            title="Underline"
          >
            U
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onMouseUp={handleEditorMouseUp}
        onFocus={onFocus}
        className="rte-area text-gray-300 leading-relaxed whitespace-pre-wrap outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 min-h-[80px] bg-transparent border border-gray-700/50"
        data-placeholder={placeholder}
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280; /* gray-500 */
        }
        .rte-area ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin: 0.25rem 0 0.5rem 0;
        }
        .rte-area ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin: 0.25rem 0 0.5rem 0;
        }
        .rte-area li {
          margin: 0.125rem 0;
        }
      `}</style>
    </div>
  );
});

export default RichTextEditor;


