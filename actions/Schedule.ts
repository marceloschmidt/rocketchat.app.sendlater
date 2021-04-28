import { IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { SendLaterApp } from "../SendLaterApp";
import { ScheduleModal } from "../modals/ScheduleModal";
import { ScheduleEnum } from "../enum/Schedule";
import { IUIKitView } from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

class ScheduleAction {
    public async run({ app, context, read, modify }: { app: SendLaterApp, context: SlashCommandContext, read: IRead, modify: IModify }): Promise<void> {
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

    public async scheduleMessage({ app, view, modify, user }: { app: SendLaterApp, view: IUIKitView, modify: IModify, user: IUser, persistence: IPersistence }): Promise<any> {
        const { time, message }: {
            time: string,
            message: string,
        } = view.state?.[ScheduleEnum.VIEW_ID] as any;

        await modify.getScheduler().scheduleOnce({
            id: 'sendlater',
            when: time,
            data: { message, user }
        })

        // const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, sender.id);

	}
}

export const Schedule = new ScheduleAction();
