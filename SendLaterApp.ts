import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUIKitInteractionHandler, UIKitBlockInteractionContext, UIKitViewCloseInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { SendLaterCommand } from './commands/SendLaterCommand';
import { ErrorsEnum } from './enum/Errors';
import { ExecuteBlockActionHandler } from './handlers/ExecuteBlockActionHandler';
import { ExecuteViewClosedHandler } from './handlers/ExecuteViewClosedHandler';
import { ExecuteViewSubmitHandler } from './handlers/ExecuteViewSubmitHandler';
import { dialogModal } from './modals/DialogModal';
import { sendLaterProcessor } from './processors/SendLaterProcessor';

export class SendLaterApp extends App implements IUIKitInteractionHandler {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new SendLaterCommand(this));

        configuration.scheduler.registerProcessors([
            {
                id: 'sendlater',
                processor: sendLaterProcessor
            }
        ]);
    }

    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
		try {
			const handler = new ExecuteViewSubmitHandler(this, read, http, modify, persistence);
			return await handler.run(context);
		} catch (err) {
			this.getLogger().log(`${ err.message }`);
			const alert = await dialogModal({ text: ErrorsEnum.OPERATION_FAILED, modify });
			return context.getInteractionResponder().openModalViewResponse(alert);
		}
	}

    public async executeViewClosedHandler(context: UIKitViewCloseInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        try {
            const handler = new ExecuteViewClosedHandler(this, read, http, modify, persistence);
            return await handler.run(context);
        } catch (err) {
            console.log(err);
            this.getLogger().log(`${ err.message }`);
			const alert = await dialogModal({ text: ErrorsEnum.OPERATION_FAILED, modify });
			return context.getInteractionResponder().openModalViewResponse(alert);
        }
    }

    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        try {
            const handler = new ExecuteBlockActionHandler(this, read, http, modify, persistence);
            return await handler.run(context);
        } catch (err) {
            console.log(err);
            this.getLogger().log(`${ err.message }`);
			const alert = await dialogModal({ text: ErrorsEnum.OPERATION_FAILED, modify });
			return context.getInteractionResponder().openModalViewResponse(alert);
        }
    }
}
