import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { BlockElementType, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { BlocksEnum } from '../enum/Blocks';
import { ScheduleEnum } from '../enum/Schedule';
import { getTasksPersistence } from '../lib/persistence';

export async function ScheduleListModal({ read, modify, user }: {
	read: IRead,
	modify: IModify,
    user: IUser,
}): Promise<IUIKitModalViewParam> {
	const viewId = ScheduleEnum.VIEW_LIST_ID;
	const block = modify.getCreator().getBlockBuilder();

    const tasks = await getTasksPersistence(read.getPersistenceReader(), user.id);
    if (tasks.length > 0) {
        for (const task of tasks) {
            const room = await read.getRoomReader().getById(task.roomId);

            let text = '';
            text += `*Message*: ${ task.message.substr(0, 100) + (task.message.length > 100 ? '...' : '') }`;
            text += `\n*Start*: ${ task.start.toISOString().split('T')[0] } ${ task.start.getHours() }:${ task.start.getMinutes() }`;
            text += `\n*Time*: ${ task.time.substr(0, 100) + (task.time.length > 100 ? '...' : '') }`;
            text += `\n*Room*: ${ room?.displayName || room?.slugifiedName }`;
            if (task.threadId) {
                const msg = await read.getMessageReader().getById(task.threadId);
                if (msg) {
                    text += `\n*Thread*: ${ msg.text?.substr(0, 100) + (msg.text && msg.text.length > 100 ? '...' : '') }`;
                }
            }

            block.addSectionBlock({
                text: block.newMarkdownTextObject(text),
                accessory: {
                    type: BlockElementType.BUTTON,
                    actionId: ScheduleEnum.CANCEL_ID,
                    text: block.newPlainTextObject(ScheduleEnum.CANCEL),
                    value: task.taskId,
                },
            });
        }
    } else {
        block.addSectionBlock({
            text: block.newMarkdownTextObject(ScheduleEnum.NO_TASKS_MESSAGE),
        });
    }

	return {
		id: viewId,
		title: {
			type: TextObjectType.PLAINTEXT,
			text: ScheduleEnum.TITLE,
		},
		close: block.newButtonElement({
			text: {
				type: TextObjectType.PLAINTEXT,
				text: BlocksEnum.CLOSE,
			},
		}),
		blocks: block.getBlocks(),
	};
}
