export const DEFAULT_SETTINGS: NoteSettings = {
  url: "",
  actions: {
    highlight: "",
    unhighlight: "",
    get_highlights: "",
    reaction: "",
    get_reactions: ""
  },
  bugId: ""
};

export interface NoteSettings {
  url: string;
  actions: {
    highlight: string;
    unhighlight: string;
    get_highlights: string;
    reaction: string;
    get_reactions: string
  };
  bugId: string;
}

export async function getSettings(): Promise<NoteSettings> {
  const el : HTMLInputElement = document.querySelector<HTMLInputElement>('#imaticNoteHighlighting')!;
  const data = el.dataset.data;
  if (!data) {
    throw new Error('Missing data attribute on #imaticNoteHighlighting element');
  }
  return JSON.parse(data);
}



