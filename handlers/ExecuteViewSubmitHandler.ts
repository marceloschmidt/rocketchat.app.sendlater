import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { Schedule } from '../actions/Schedule';
import { ScheduleEnum } from '../enum/Schedule';
import { dialogModal } from '../modals/DialogModal';
import { SendLaterApp } from '../SendLaterApp';

export class ExecuteViewSubmitHandler {
	constructor(
		private readonly app: SendLaterApp,
		private readonly read: IRead,
		private readonly http: IHttp,
		private readonly modify: IModify,
		private readonly persistence: IPersistence,
	) {}

	public async run(context: UIKitViewSubmitInteractionContext) {
		const { view } = context.getInteractionData();
        try {
            switch (view.id) {
                case ScheduleEnum.VIEW_ID: {
                    await Schedule.scheduleMessage({ appId: this.app.getID(), view, read: this.read, modify: this.modify, user: context.getInteractionData().user, persistence: this.persistence });
                    break;
                }
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
