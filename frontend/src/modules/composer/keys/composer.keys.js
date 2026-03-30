export const composerKeys = {
  all: ['composer'],
  sources: (prompt) => [...composerKeys.all, 'sources', prompt],
};
