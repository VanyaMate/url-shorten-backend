export const getAliasFromUrl = function (url: string): string {
    try {
        return new URL(url).pathname.split('/').slice(-1)[0];
    } catch (_) {
        throw new Error(`Ссылка не валидная`);
    }
};