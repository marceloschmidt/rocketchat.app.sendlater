import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { Schedule } from '../actions/Schedule';
import { CommandsEnum } from '../enum/Commands';
import { ErrorsEnum } from '../enum/Errors';

import { notifyUser } from "../lib/Message";
import { SendLaterApp } from '../SendLaterApp';
import { Help } from './HelpCommand';

export class SendLaterCommand implements ISlashCommand {
    public command = 'sendlater';
    public i18nParamsExample = 'Params';
    public i18nDescription = 'Description';
    public providesPreview = false;

    constructor(private readonly app: SendLaterApp) { }
    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        try {
            const [command, ...params] = context.getArguments();

            switch (command) {
                case CommandsEnum.HELP:
                    await Help.run({ app: this.app, context, read, modify });
                    break;
                case CommandsEnum.CANCEL:
                    const jobId = params[0];
                    if (jobId) {
                        await modify.getScheduler().cancelJob(jobId);
                    }
                    break;
                case CommandsEnum.LIST:
                    await Schedule.list({ app: this.app, triggerId: context.getTriggerId(), sender: context.getSender(), read, modify, persistence });
                    break;
                default:
                    await Schedule.run({ app: this.app, context, read, modify, persistence });
                    break;
            }
        } catch (error) {
            const appId = this.app.getID();
            await notifyUser({ appId, read, modify, room: context.getRoom(), user: context.getSender(), text: error.message || ErrorsEnum.OPERATION_FAILED, threadId: context.getThreadId() });
            this.app.getLogger().error(error.message);
        }
    }
}
