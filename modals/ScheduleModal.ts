import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { BlocksEnum } from '../enum/Blocks';
import { ScheduleEnum } from '../enum/Schedule';

export async function ScheduleModal({ modify, read }: {
	modify: IModify,
	read: IRead,
}): Promise<IUIKitModalViewParam> {
	const viewId = ScheduleEnum.VIEW_ID;
	const block = modify.getCreator().getBlockBuilder();

    block.addInputBlock({
        blockId: ScheduleEnum.VIEW_ID,
        element: block.newPlainTextInputElement({ actionId: ScheduleEnum.TIME_ACTION_ID }),
        label: {
            type: TextObjectType.PLAINTEXT,
            text: ScheduleEnum.TIME_LABEL,
            emoji: true,
        },
    });

    block.addInputBlock({
        blockId: ScheduleEnum.VIEW_ID,
        element: block.newPlainTextInputElement({ actionId: ScheduleEnum.MESSAGE_ACTION_ID }),
        label: {
            type: TextObjectType.PLAINTEXT,
            text: ScheduleEnum.MESSAGE_LABEL,
            emoji: true,
        },
    });

	return {
		id: viewId,
		title: {
			type: TextObjectType.PLAINTEXT,
			text: ScheduleEnum.TITLE,
		},
        submit: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: BlocksEnum.SAVE,
            },
        }),
		close: block.newButtonElement({
			text: {
				type: TextObjectType.PLAINTEXT,
				text: BlocksEnum.CLOSE,
			},
		}),
		blocks: block.getBlocks(),
	};
}
