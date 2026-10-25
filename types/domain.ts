/**
 * The parts of an image-bearing medium the chat needs to draw a thumbnail. Every field is
 * available straight off the fetched message — none of it costs a download.
 */
export type MediaImage = {
  /** Complete JPEG of the ~40px stripped thumbnail; mtcute inflates it for us. */
  preview: Uint8Array | null;
  /** File id of the larger background-downloaded thumbnail (800px box, falling back to 320px), for `messenger.downloadThumb`. */
  thumbId: string | null;
  /** Stable id of that same thumbnail: `thumbId` embeds a file reference Telegram rotates, so
   * the one picture arrives under many ids, while this stays put. Names its file in the cache. */
  thumbKey: string | null;
  /** Path to the larger thumbnail on disk, once `actions.loadThumb` has downloaded it. */
  thumb: string | null;
  /** Dimensions of the full medium, used to size the bubble before any pixels arrive. */
  width: number;
  height: number;
};

/** A medium that can be downloaded and opened in an external viewer. */
export type MediaFile = {
  /** File id the client can download the full medium with. */
  fileId: string;
  /** Stable id of the same file, unlike `fileId` (see `thumbKey`): what tells two copies apart. */
  fileKey: string;
  /** Original file name provided by the sender, when available. */
  fileName: string | null;
  /** MIME type of the full medium. */
  mimeType: string;
};

/** The two variants that carry a drawable image, and so the only ones with `preview`/`thumbId`/`thumb`. */
export type ImageMedia =
  | ({ type: 'video'; duration: number; isAnimation: boolean; isRound: boolean } & MediaImage & MediaFile)
  | ({ type: 'photo' } & MediaImage & MediaFile);

export type Media =
  | ImageMedia
  | ({ type: 'voice'; duration: number } & MediaFile)
  | ({ type: 'audio'; duration: number; title: string | null; performer: string | null } & MediaFile)
  | ({ type: 'sticker'; emoji: string } & MediaFile)
  | ({ type: 'document' } & MediaFile)
  | { type: 'contact'; firstName: string; lastName: string | null }
  | { type: 'poll'; question: string }
  | { type: 'dice'; emoji: string; value: number }
  | { type: 'game' | 'invoice' | 'venue'; title: string }
  | { type: 'todo'; title: string }
  | { type: 'call'; isVideo: boolean; duration: number; reason: 'missed' | 'busy' | 'disconnect' | null }
  | { type: 'location' | 'live_location' | 'story' | 'paid' | 'webpage' | 'unknown' };

/** Every variant of `Media` that carries something downloadable — what `openMedia` can act on. */
export type FileMedia = Extract<Media, MediaFile>;

/** Who a message can be deleted for: `everyone` revokes it in the chat, `me` removes only our copy. */
export type DeleteScope = 'everyone' | 'me';

export type Message = {
  /** Telegram sends an album as one message per picture; tuigram folds it into one message. Its
   * id is the Telegram message carrying the text — the caption's part, or the first part when
   * there is no caption — so an edit targets it directly. */
  id: number;
  text: string;
  /** How `text` is formatted; empty for plain text. */
  entities: Entity[];
  /** Everything attached: nothing, one medium, or every picture of an album in the order sent. */
  media: Media[];
  pending: boolean;
  sender: { id: number | null; isSelf: boolean; displayName: string | null };
  chatId: number;
  chatName: string;
  isGroup: boolean;
  /** Set when the message was forwarded; `id` is null for a sender with forwards hidden. */
  forwardedFrom: { id: number | null; displayName: string } | null;
  /** Set when the message answers another. A reply within the chat carries only the id, so
   * `sender` and `preview` stay null until `actions.loadReplies` resolves them; `deleted` when the
   * original is gone. `id` is null for a reply to a story or to a private chat's message. */
  replyTo: {
    id: number | null;
    sender: { id: number | null; displayName: string } | null;
    preview: string | null;
    deleted: boolean;
  } | null;
  /** When it was sent; a pending message's is when we sent it. */
  date: Date;
  /** What the delete picker offers, as the official clients decide it; empty when it can't be deleted. */
  deleteScopes: DeleteScope[];
  /** Every reaction on it, in Telegram's order (most counted first); empty when there are none.
   * An album's are its reacted part's. */
  reactions: Reaction[];
  /** Every Telegram message behind it: the one id, every part of an album, none while pending.
   * A reaction or an edit may name any of them. */
  partIds: number[];
};

/** A formatted span of `Message.text`, in UTF-16 units, so `text.slice` cuts it out. `url` is set
 * on a `link` only, and null there when the target is not one to hand a terminal (anything but
 * http(s) or mailto). `mention` covers everything Telegram highlights as a name or a tag:
 * @mentions, #hashtags, $cashtags, bot commands, and mentions by name. */
export type Entity = { offset: number; length: number; kind: EntityKind; url?: string | null };

export type EntityKind =
  'bold' | 'italic' | 'underline' | 'strikethrough' | 'spoiler' | 'code' | 'pre' | 'blockquote' | 'link' | 'mention';

/** One reaction and how many gave it. `emoji` is null for a custom emoji, which is a sticker a
 * terminal cannot draw; a paid reaction is `⭐`. `key` tells reactions apart where `emoji` can't:
 * the emoji, `custom:<document id>`, or `paid`. `mine` is null when Telegram didn't say — a `min`
 * set, whose counts are the same for everyone and so carry nobody's own choice. */
export type Reaction = { key: string; emoji: string | null; count: number; mine: boolean | null };

export type PendingMessage = Omit<Message, 'chatId' | 'chatName'> & { chatId: undefined; chatName: undefined };

export type Dialog = {
  chatId: number;
  name: string;
  lastMessage: Message | null;
  isPinned: boolean;
  unreadCount: number;
  isUnread: boolean;
  /** The newest of the peer's messages we have read: Telegram's inbox read mark. */
  inboxReadUpTo: number;
  /** The newest of our messages the peer has read: Telegram's outbox read mark. */
  outboxReadUpTo: number;
  isMuted: boolean | null;
  /** Whether this dialog's peer is a real, non-self user — the only kind with a presence. */
  isUser: boolean;
  /** What the peer is, as a folder's rules classify it. */
  kind: 'user' | 'bot' | 'group' | 'channel' | 'other';
  /** Whether the peer is a user in our contacts. */
  isContact: boolean;
  /** Whether the chat sits in the archive folder. */
  isArchived: boolean;
  /** When the last message arrived, in ms; what a folder's unpinned chats are ordered by. */
  activity: number;
};

/** Where a chat's unread messages began when it came into view, and how many Telegram counted:
 * what the unread divider marks. Messages from others past `after` are the unread ones. */
export type InboxUnread = { after: number; count: number };

/**
 * A Telegram chat folder: a filter over the dialogs, never a list of its own. `id` 0 is
 * "All chats", which the dialogs store renders as its own list rather than through the filter.
 */
export type Folder = {
  id: number;
  title: string;
  /** A shared folder: exactly its pinned and included chats, with no rules. */
  isChatlist: boolean;
  /** Chats pinned inside this folder, in their order; they head the folder above the rest. */
  pinnedIds: number[];
  includeIds: Set<number>;
  excludeIds: Set<number>;
  rules: {
    contacts: boolean;
    nonContacts: boolean;
    groups: boolean;
    broadcasts: boolean;
    bots: boolean;
    excludeMuted: boolean;
    excludeRead: boolean;
    excludeArchived: boolean;
  };
};

/** A person's online/last-seen state, straight off mtcute's `UserStatus`, minus the `bot` case. */
/** What someone is doing toward a message, as the stream reports it: typing, or recording or
 * sending something. mtcute's statuses but for the ones that end it or aren't about a message. */
export type TypingStatus =
  | 'typing'
  | 'record_video'
  | 'upload_video'
  | 'record_voice'
  | 'upload_voice'
  | 'upload_photo'
  | 'upload_document'
  | 'geo'
  | 'contact'
  | 'game'
  | 'record_round'
  | 'upload_round'
  | 'speak_call'
  | 'history_import'
  | 'sticker';

/** Someone typing in the open chat, as the pane shows them: their name, or null when it has none
 * to show (the partner of a private chat, or a member the cached messages don't name). */
export type Typist = { name: string | null; status: TypingStatus };

export type Presence = {
  status: 'online' | 'offline' | 'recently' | 'within_week' | 'within_month' | 'long_time_ago';
  lastOnline: Date | null;
  /** When an `online` runs out unless word comes first; null for every other status. */
  until: Date | null;
};

/**
 * `marker` is the unread count or dot that ends `name`, repainted in its own colour ('' when none):
 * the theme's `unread`, or `muted` (the preview line's colour) for a muted chat.
 */
export type DialogOption = { chatId: number; name: string; description: string; marker: string; isMuted: boolean };

export type LinkedDialogsHandle = {
  find(chatId: number): Dialog | null;
  findNode(chatId: number): import('./collections').LinkedListNode<Dialog> | null;
  bump(node: import('./collections').LinkedListNode<Dialog>): void;
  unshift(dialog: Dialog): void;
  /** Add a dialog at the end of its half, pinned or not; the list mustn't have its chat yet. */
  push(dialog: Dialog): void;
  [Symbol.iterator](): Iterator<Dialog>;
};
