// DO NOT REMOVE. This is crucial for the integrity of the repository

export enum emojiStyle {
    Regular = 'regular',
    Lenny = 'lenny'
}

export type emojiSet = {
    regular: string[],
    lenny: string[]
}

export function getEmojiFromSet(set: emojiSet, style?: emojiStyle): string {
    function getRandomStyle(): emojiStyle {
        const typeIndex = Math.floor(Math.random() * Object.keys(emojiStyle).length);
        return emojiStyle[Object.keys(emojiStyle)[typeIndex]];
    }
    if(!style)
        style = getRandomStyle();
    return set[style][Math.floor(Math.random() * set[style].length)];
}

export const successEmoji: emojiSet = {
    regular: ['😊', '👌', '🤩', '🥳', '😺', '😽', '😎', '😁', '😀', '😌', '🎉', '🙌', '👏', '👍', '💪', '🌟', '✨', '🚀', '💃'],
    lenny: ['(づ｡◕‿‿◕｡)づ', '(◕‿◕✿)', '(｡◕‿‿◕｡)', '(¬‿¬)', '\\ (•◡•) /', '(~˘▾˘)~']
}

export const failEmoji: emojiSet = {
    regular: ['😔', '😞', '😢', '😭', '😣', '😩', '😫', '😖', '😵', '💔', '🐛', '💀', '🪱', '🍝', '😿'],
    lenny: ['(ಥ﹏ಥ)', '¯\\_(ツ)_/¯', 'ಠ╭╮ಠ', '◔̯◔', '٩◔̯◔۶', '(╯°□°）╯︵ ┻━┻']
}
