// @ts-check
/**
 * @param {Pick<import('../../../../../../types/domain').AppMessage, 'text' | 'media'>} message
 * @returns {string}
 */
({ text, media }) => text || Media.placeholder(media) || '';
