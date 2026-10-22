// Shared by the one-shot fetch (mtcute `User`) and the push update (`UserStatusUpdate`) — both
// expose `.status`/`.lastOnline`/`.nextOffline` in the same shape.
/** @type {MessengerSelf['toPresence']} */
(entity) => {
  if (entity.status === 'bot') return null;
  const until = entity.status === 'online' ? entity.nextOffline : null;
  return { status: entity.status, lastOnline: entity.lastOnline, until };
};
