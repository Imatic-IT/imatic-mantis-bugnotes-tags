export const DEFAULT_SETTINGS: NoteSettings = {
  url: "",
  csrfToken: "",
  actions: {
    highlight: "",
    unhighlight: "",
    get_highlights: "",
    reaction: "",
    unsave_reaction: "",
    get_reactions: "",
    collapse: "",
    uncollapse: "",
    get_collapsed: "",
    set_fold_mode: "",
    get_fold_mode: "",
    collapse_all: "",
    uncollapse_all: "",
  },
  bugId: "",
  lang: {
    fold_unsaved: "Hide unsaved",
    show_all: "Show all",
    n_notes_hidden: "%d notes hidden — click to expand",
    fold_all: "Fold all",
    unfold_all: "Unfold all",
  },
};

export interface NoteSettings {
  url: string;
  csrfToken: string;
  actions: {
    highlight: string;
    unhighlight: string;
    get_highlights: string;
    reaction: string;
    unsave_reaction: string;
    get_reactions: string;
    collapse: string;
    uncollapse: string;
    get_collapsed: string;
    set_fold_mode: string;
    get_fold_mode: string;
    collapse_all: string;
    uncollapse_all: string;
  };
  bugId: string;
  lang: {
    fold_unsaved: string;
    show_all: string;
    n_notes_hidden: string;
    fold_all: string;
    unfold_all: string;
  };
}

export async function getSettings(): Promise<NoteSettings> {
  const el : HTMLInputElement = document.querySelector<HTMLInputElement>('#imaticNoteHighlighting')!;
  const data = el.dataset.data;
  if (!data) {
    throw new Error('Missing data attribute on #imaticNoteHighlighting element');
  }
  return JSON.parse(data);
}



