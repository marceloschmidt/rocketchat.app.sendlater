import { IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { SendLaterApp } from "../SendLaterApp";
import { ScheduleModal } from "../modals/ScheduleModal";
import { ScheduleEnum } from "../enum/Schedule";
import { BlockElementType, IButtonElement, IUIKitView, TextObjectType, UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { addTaskPersistence, clearUIData, getUIData, persistUIData } from "../lib/persistence";
import { ScheduleListModal } from "../modals/ScheduleListModal";
import { ErrorsEnum } from "../enum/Errors";
import { notifyUser } from "../lib/Message";

class ScheduleAction {
    public async run({ context, read, modify, persistence }: { app: SendLaterApp, context: SlashCommandContext, read: IRead, modify: IModify, persistence: IPersistence }): Promise<void> {
        await persistUIData(persistence, context.getSender().id, context);
        const triggerId = context.getTriggerId();
        if (triggerId) {
            try {
                const modal = await ScheduleModal({ modify, read });
                return modify.getUiController().openModalView(modal, { triggerId }, context.getSender());
            } catch (error) {
                console.log(error);
            }
        }
    }

    public async scheduleMessage({ appId, view, read, modify, user, persistence }: { appId: string, view: IUIKitView, read: IRead, modify: IModify, user: IUser, persistence: IPersistence }): Promise<any> {
        const { time, message }: {
            time: string,
            message: string,
        } = (view.state?.[ScheduleEnum.VIEW_ID] || {}) as any;

        if (!time || !message) {
            throw new Error(ErrorsEnum.MISSING_TIME_MESSAGE);
        }

        const uiData = await getUIData(read.getPersistenceReader(), user.id);
        const taskId = await modify.getScheduler().scheduleOnce({
            id: 'sendlater',
            when: time,
            data: { message, user, roomId: uiData.room?.id, threadId: uiData.threadId }
        });

        await addTaskPersistence(read.getPersistenceReader(), persistence, user.id, { taskId, time, message, roomId: uiData.room?.id, threadId: uiData.threadId, start: new Date() });
        await clearUIData(persistence, user.id);

        const blocks = modify.getCreator().getBlockBuilder();
        blocks.addSectionBlock({
            text: {
                type: TextObjectType.MARKDOWN,
                text: ScheduleEnum.MESSAGE_SCHEDULED,
            },
        });
        blocks.addActionsBlock({
            elements: [{
                type: BlockElementType.BUTTON,
                text: {
                    type: TextObjectType.PLAINTEXT,
                    text: ScheduleEnum.CANCEL,
                },
                value: taskId,
                actionId: ScheduleEnum.CANCEL_ID,
            } as IButtonElement,
            {
                type: BlockElementType.BUTTON,
                text: {
                    type: TextObjectType.PLAINTEXT,
                    text: ScheduleEnum.VIEW_LIST,
                },
                value: '1',
                actionId: ScheduleEnum.VIEW_LIST_ID,
            } as IButtonElement,
            ],
        });
        await notifyUser({ appId, read, modify, room: uiData.room, user, threadId: uiData.threadId, blocks });
	}

    public async list({ triggerId, sender, read, modify, persistence }: { app: SendLaterApp, triggerId?: string, sender: IUser, read: IRead, modify: IModify, persistence: IPersistence }): Promise<void> {
        if (triggerId) {
            try {
                const modal = await ScheduleListModal({ user: sender, read, modify });
                return modify.getUiController().openModalView(modal, { triggerId }, sender);
            } catch (error) {
                console.log(error);
            }
        }
    }
}

export const Schedule = new ScheduleAction();
