import {
  createCliRenderer,
  Box,
  Text,
  TextareaRenderable,
  defaultTextareaKeyBindings,
  Select,
  SelectRenderableEvents,
  RenderableEvents,
  ScrollBoxRenderable,
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
  { from: 'Alice', body: 'oh nice, what kind of food?' },
  { from: 'me', body: 'small italian spot on 4th' },
  { from: 'me', body: 'they do a really good cacio e pepe' },
  { from: 'Alice', body: 'sold' },
  { from: 'Alice', body: 'do they take reservations though?\nlast time we waited 40 min somewhere' },
  { from: 'me', body: 'I think they do, let me check' },
  { from: 'me', body: 'yep, opentable. booking for 2 at 12:30?' },
  { from: 'Alice', body: 'perfect' },
  { from: 'Alice', body: 'btw did you see the email from work?' },
  { from: 'me', body: 'which one' },
  { from: 'Alice', body: 'the all-hands one' },
  { from: 'Alice', body: 'apparently the deploy went green on the first try\nfirst time in like 3 months lol' },
  { from: 'me', body: 'ha, miracles do happen' },
  { from: 'me', body: 'I owe the SRE team a coffee' },
  { from: 'Alice', body: 'you owe them at least an espresso machine' },
  { from: 'me', body: 'fair' },
  { from: 'Alice', body: 'anyway' },
  { from: 'Alice', body: 'should I drive or you?' },
  { from: 'me', body: "I'll drive, easier to park near the place" },
  { from: 'Alice', body: 'cool, pick me up at 12?' },
  { from: 'me', body: '12 sharp, be ready' },
  { from: 'Alice', body: 'when am I not 😤' },
  { from: 'me', body: '...last tuesday' },
  { from: 'Alice', body: 'that was ONE time' },
  { from: 'me', body: 'mhm' },
  { from: 'Alice', body: 'ok ok' },
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

const SELECTED_BORDER = '#e0af68';
const messageBubbles = [];
let selectedMessageIndex = -1;

const chatScroll = new ScrollBoxRenderable(renderer, {
  flexGrow: 1,
  scrollY: true,
  scrollX: false,
  stickyScroll: true,
  stickyStart: 'bottom',
  focusable: true,
  contentOptions: {
    flexDirection: 'column',
    gap: 1,
    paddingX: 1,
    paddingY: 1,
  },
});

function addMessage(scrollBox, msg) {
  const isMe = msg.from === 'me';
  const baseBorder = isMe ? '#7aa2f7' : '#565f89';
  const lines = msg.body.split('\n');
  const index = messageBubbles.length;

  const bubble = Box(
    {
      flexDirection: 'column',
      borderStyle: 'rounded',
      borderColor: baseBorder,
      backgroundColor: isMe ? '#283457' : '#1f2335',
      paddingX: 1,
    },
    ...lines.map((line) => Text({ content: line, fg: '#c0caf5' })),
  );

  const row = Box(
    {
      id: `bubble-${index}`,
      flexDirection: 'row',
      width: '100%',
      justifyContent: isMe ? 'flex-end' : 'flex-start',
    },
    bubble,
  );

  scrollBox.add(row);

  const rowRenderable = scrollBox.content.getChildren().at(-1);
  const bubbleRenderable = rowRenderable.getChildren()[0];
  messageBubbles.push({ row: rowRenderable, bubble: bubbleRenderable, baseBorder });
}

function setSelectedMessage(i) {
  if (messageBubbles.length === 0) return;
  const clamped = Math.max(0, Math.min(i, messageBubbles.length - 1));
  if (selectedMessageIndex >= 0 && selectedMessageIndex < messageBubbles.length) {
    const prev = messageBubbles[selectedMessageIndex];
    prev.bubble.borderColor = prev.baseBorder;
  }
  selectedMessageIndex = clamped;
  const next = messageBubbles[clamped];
  next.bubble.borderColor = SELECTED_BORDER;
  chatScroll.scrollChildIntoView(next.row.id);
}

for (const msg of messages) {
  addMessage(chatScroll, msg);
}

// --- Input ---

const ACCENT = '#7aa2f7';
const MUTED = '#3b4261';

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
    addMessage(chatScroll, { from: 'me', body: value });
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

textarea.on(RenderableEvents.FOCUSED, () => {
  composerBox.borderColor = ACCENT;
});
textarea.on(RenderableEvents.BLURRED, () => {
  composerBox.borderColor = MUTED;
});

// --- Right pane ---

const rightPane = Box(
  {
    flexGrow: 1,
    height: '100%',
    flexDirection: 'column',
    borderStyle: 'rounded',
    borderColor: MUTED,
    title: ` ${dialogs[0].name} `,
  },
  chatScroll,
  composerBox,
);

chatScroll.on(RenderableEvents.FOCUSED, () => {
  rightPane.borderColor = ACCENT;
});
chatScroll.on(RenderableEvents.BLURRED, () => {
  rightPane.borderColor = MUTED;
});

const defaultChatHandleKey = chatScroll.handleKeyPress.bind(chatScroll);
chatScroll.handleKeyPress = (key) => {
  switch (key.name) {
    case 'up':
    case 'k':
      setSelectedMessage(selectedMessageIndex < 0 ? messageBubbles.length - 1 : selectedMessageIndex - 1);
      return true;
    case 'down':
    case 'j':
      setSelectedMessage(selectedMessageIndex < 0 ? 0 : selectedMessageIndex + 1);
      return true;
    case 'g':
    case 'home':
      setSelectedMessage(0);
      return true;
    case 'G':
    case 'end':
      setSelectedMessage(messageBubbles.length - 1);
      return true;
  }
  return defaultChatHandleKey(key);
};

// --- Root ---

renderer.root.add(Box({ flexDirection: 'row', width: '100%', height: '100%' }, dialogsPanel, rightPane));

// --- Events ---

dialogSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index) => {
  rightPane.title = ` ${dialogs[index].name} `;
  textarea.focus();
});

const focusCycle = [dialogSelect, chatScroll, textarea];
renderer.keyInput.on('keypress', (key) => {
  if (key.name !== 'tab') return;
  const idx = focusCycle.findIndex((r) => r.focused);
  const start = idx < 0 ? 0 : idx;
  const step = key.shift ? -1 : 1;
  const next = (start + step + focusCycle.length) % focusCycle.length;
  focusCycle[next].focus();
});

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
