import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { IMessageAttachment } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { BlockBuilder } from '@rocket.chat/apps-engine/definition/uikit';
import { Logs } from '../enum/Logs';

export const sendRoomMessage = async ({ app, read, modify, room, text, attachments, blocks }: { app: IApp, read: IRead, modify: IModify, room: IRoom, text?: string, attachments?: Array<IMessageAttachment>, blocks?: BlockBuilder }): Promise<void> => {
    const appUser = await read.getUserReader().getAppUser(app.getID());
    if (!appUser) {
        throw new Error(Logs.ERROR_GETTING_APP_USER);
    }
    const msg = modify.getCreator().startMessage()
        .setGroupable(false)
        .setSender(appUser)
        .setRoom(room);

    if (text && text.length > 0) {
        msg.setText(text);
    }
    if (attachments && attachments.length > 0) {
        msg.setAttachments(attachments);
    }
    if (blocks !== undefined) {
        msg.setBlocks(blocks);
    }

    return read.getNotifier().notifyRoom(room, msg.getMessage());
};
