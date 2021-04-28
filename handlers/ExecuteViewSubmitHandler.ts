import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUIKitView, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { Schedule } from '../actions/Schedule';
import { ScheduleEnum } from '../enum/Schedule';
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
		switch (view.id) {
			case ScheduleEnum.VIEW_ID: {
				await Schedule.scheduleMessage({ app: this.app, view, modify: this.modify, user: context.getInteractionData().user, persistence: this.persistence });
				break;
			}
		}
		return {
			success: true,
		};
	}
}
