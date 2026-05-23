import {
  createCliRenderer,
  Box,
  Text,
  TextareaRenderable,
  defaultTextareaKeyBindings,
  Select,
  SelectRenderableEvents,
  RenderableEvents,
} from '@opentui/core';
import { createLineEditor } from './lineEditor.js';

const dialogs = [
  { name: 'Alice', preview: 'see you tomorrow' },
  { name: 'Bob', preview: 'ok thanks' },
  { name: 'Work', preview: 'deploy is green' },
  { name: 'Mom', preview: 'call me' },
  { name: 'TUIgram', preview: 'v0.1 shipped' },
];

const messages = [
  { from: 'Alice', body: 'hey, are you around?\nI wanted to ask you something' },
  { from: 'me', body: "yeah, what's up?" },
  {
    from: 'Alice',
    body: 'so I was thinking we could meet tomorrow\naround noon if that works\nwe could grab lunch too',
  },
  { from: 'me', body: 'sounds good!\nI know a nice place nearby' },
  { from: 'Alice', body: 'see you tomorrow' },
];

const renderer = await createCliRenderer({ exitOnCtrlC: true });

const DIALOGS_PANEL_WIDTH = 28;

// --- Dialog list ---

const dialogSelect = Select({
  width: DIALOGS_PANEL_WIDTH - 2,
  height: '100%',
  options: dialogs.map((d) => ({ name: d.name, description: d.preview })),
  showDescription: true,
  selectedBackgroundColor: '#2d4f2d',
  focusedBackgroundColor: '#1a1a1a',
});

const dialogsPanel = Box(
  {
    width: DIALOGS_PANEL_WIDTH,
    height: '100%',
    borderStyle: 'rounded',
    title: ' Chats ',
    flexDirection: 'column',
  },
  dialogSelect,
);

// --- Chat messages ---

const chatBox = Box({
  flexGrow: 1,
  flexDirection: 'column',
  paddingX: 1,
  paddingY: 1,
  gap: 1,
  overflowY: 'scroll',
});

function addMessage(box, msg) {
  const isMe = msg.from === 'me';
  const lines = msg.body.split('\n');

  const bubble = Box(
    {
      flexDirection: 'column',
      borderStyle: 'rounded',
      borderColor: isMe ? '#7aa2f7' : '#565f89',
      backgroundColor: isMe ? '#283457' : '#1f2335',
      paddingX: 1,
    },
    ...lines.map((line) => Text({ content: line, fg: '#c0caf5' })),
  );

  box.add(
    Box(
      {
        flexDirection: 'row',
        width: '100%',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
      },
      bubble,
    ),
  );
}

for (const msg of messages) {
  addMessage(chatBox, msg);
}

// --- Input ---

const ACCENT = '#7aa2f7';
const MUTED  = '#3b4261';

const textarea = new TextareaRenderable(renderer, {
  width: '100%',
  height: 1,
  maxHeight: 5,
  paddingX: 1,
  placeholder: 'Type a message...',
  backgroundColor: '#1a1b26',
  focusedBackgroundColor: '#24283b',
  textColor: '#c0caf5',
  focusedTextColor: '#c0caf5',
  cursorColor: '#7aa2f7',
  wrapMode: 'word',
  keyBindings: [...defaultTextareaKeyBindings, { name: 'return', ctrl: true, action: 'submit' }],
  onContentChange: () => {
    const target = Math.min(5, Math.max(1, textarea.lineCount));
    if (textarea.height !== target) textarea.height = target;
  },
  onSubmit: () => {
    const value = textarea.plainText;
    if (!value.trim()) return;
    addMessage(chatBox, { from: 'me', body: value });
    textarea.setText('');
    textarea.height = 1;
  },
});

export const inputEditor = createLineEditor(textarea);
globalThis.inputEditor = inputEditor;

const composerBox = Box(
  { width: '100%', flexDirection: 'column', borderStyle: 'rounded', borderColor: MUTED, title: ' ⌃↵ ' },
  textarea,
);

textarea.on(RenderableEvents.FOCUSED, () => { composerBox.borderColor = ACCENT; });
textarea.on(RenderableEvents.BLURRED,  () => { composerBox.borderColor = MUTED;  });

// --- Right pane ---

const rightPane = Box(
  {
    flexGrow: 1,
    height: '100%',
    flexDirection: 'column',
    borderStyle: 'rounded',
    title: ` ${dialogs[0].name} `,
  },
  chatBox,
  composerBox,
);

// --- Root ---

renderer.root.add(Box({ flexDirection: 'row', width: '100%', height: '100%' }, dialogsPanel, rightPane));

// --- Events ---

dialogSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index) => {
  rightPane.title = ` ${dialogs[index].name} `;
  textarea.focus();
});

renderer.keyInput.on('keypress', (key) => {
  if (key.name === 'tab') {
    dialogSelect.focus();
  }
});

dialogSelect.focus();
textarea.focus();
inputEditor.setLines([
  'Hey Alice!',
  'Are you free tomorrow?',
  "Let's grab lunch",
  "Let's grab lunch",
  "Let's grab lunch",
  "Let's grab lunch",
  "Let's grab lunch",
  "Let's grab lunch",
]);
inputEditor.textarea.setCursor(1, 2);
