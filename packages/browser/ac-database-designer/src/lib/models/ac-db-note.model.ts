/** Canvas sticky-note — a simple text annotation on the diagram. */
export interface AcDbNote {
  noteId: string;
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createNote(partial: Partial<AcDbNote> & { noteId: string }): AcDbNote {
  return {
    noteId: partial.noteId,
    text: partial.text ?? '',
    color: partial.color ?? '#fff3bf',
    x: partial.x ?? 100,
    y: partial.y ?? 100,
    width: partial.width ?? 180,
    height: partial.height ?? 100,
  };
}
