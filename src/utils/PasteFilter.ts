import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

export const PasteFilter = Extension.create({
  name: "pasteFilter",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain") || "";
            view.dispatch(view.state.tr.insertText(text));
            return true;
          },
        },
      }),
    ];
  },
});
