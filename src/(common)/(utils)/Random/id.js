// Random integer for temporary client-side ids (e.g. a message that hasn't been
// confirmed by the server yet). Large enough that collisions are implausible.
/** @type {typeof Random.id} */
() => node.crypto.randomInt(2 ** 48);
