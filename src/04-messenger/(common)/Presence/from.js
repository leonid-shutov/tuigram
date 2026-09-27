// Shared by the one-shot fetch (mtcute `User`) and the push update (`UserStatusUpdate`) — both
// expose `.status`/`.lastOnline` in the same shape.
/** @type {typeof Presence.from} */
(entity) => (entity.status === 'bot' ? null : { status: entity.status, lastOnline: entity.lastOnline });
