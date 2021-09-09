import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUIKitView, UIKitBlockInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { Schedule } from '../actions/Schedule';
import { ErrorsEnum } from '../enum/Errors';
import { ScheduleEnum } from '../enum/Schedule';
import { notifyUser } from '../lib/Message';
import { removeTaskPersistence } from '../lib/persistence';
import { dialogModal } from '../modals/DialogModal';
import { ScheduleListModal } from '../modals/ScheduleListModal';
import { SendLaterApp } from '../SendLaterApp';

export class ExecuteBlockActionHandler {
	constructor(
		private readonly app: SendLaterApp,
		private readonly read: IRead,
		private readonly http: IHttp,
		private readonly modify: IModify,
		private readonly persistence: IPersistence,
	) {}

	public async run(context: UIKitBlockInteractionContext) {
        try {
            const data = context.getInteractionData();
            switch (data.actionId) {
                case ScheduleEnum.CANCEL_ID:
                    if (data.value) {
                        await this.modify.getScheduler().cancelJob(data.value);
                        await removeTaskPersistence(this.read.getPersistenceReader(), this.persistence, data.user.id, data.value);
                        if (data.container?.type === 'view') {
                            const modal = await ScheduleListModal({ read: this.read, modify: this.modify, user: data.user });
                            return context.getInteractionResponder().updateModalViewResponse(modal);
                        } else if (data.room) {
                            await notifyUser({ appId: this.app.getID(), read: this.read, modify: this.modify, room: data.room, user: data.user, text: ScheduleEnum.CANCELLED });
                        }
                    } else if (data.room) {
                        await notifyUser({ appId: this.app.getID(), read: this.read, modify: this.modify, room: data.room, user: data.user, text: ErrorsEnum.OPERATION_FAILED });
                    }
                    break;
                case ScheduleEnum.VIEW_LIST_ID:
                    await Schedule.list({ app: this.app, triggerId: data.triggerId, sender: data.user, read: this.read, modify: this.modify, persistence: this.persistence });
            }
            return {
                success: true,
            };
        } catch (err) {
            const alert = await dialogModal({ text: err.message, modify: this.modify });
            return context.getInteractionResponder().openModalViewResponse(alert);
        }
	}
}
