import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService();
turndownService.use(gfm);

function convertHtmlToMarkdown(html) {
  if (!html || typeof html !== 'string') {
    throw new Error('Invalid input: HTML string is required.');
  }
  return turndownService.turndown(html);
}

const purifyHtml = (html) => {
  if (typeof html !== 'string') {
    throw new Error('Invalid HTML content. Expected a string.');
  }

  const window = new JSDOM('').window;
  const purify = DOMPurify(window);
  const purifiedHtml = purify.sanitize(html);
  const convertedHtmlToMarkdown = convertHtmlToMarkdown(purifiedHtml);

  return convertedHtmlToMarkdown;
};

const extractTextWithCode = (content) => {
  const window = new JSDOM(content).window;
  const document = window.document;

  const result = [];
  const plainText = document.body.textContent.trim();
  if (plainText) {
    result.push({
      type: 'text',
      text: plainText,
    });
  }

  return result;
};

const processContent = (content) => {
  if (typeof content !== 'string') {
    throw new Error('Invalid content. Expected a string.');
  }

  const sanitizedHtml = purifyHtml(content);
  return extractTextWithCode(sanitizedHtml);
};

export function formatMarkdown(messages) {
  if (!messages || !Array.isArray(messages)) {
    return new Error('Invalid messages');
  }

  return messages.map((message) => {
    if (!message.messageHtml) {
      throw new Error(
        `Message with ID ${message.messageId} is missing 'messageHtml'.`,
      );
    }
    const processedContent = processContent(message.messageHtml);

    return {
      messageId: message.messageId,
      type: message.type,
      message: message.message,
      markdown: processedContent,
    };
  });
}
