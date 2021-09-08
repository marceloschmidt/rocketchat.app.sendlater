import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { notifyUser } from "../lib/Message";
import { SendLaterApp } from "../SendLaterApp";

class HelpCommand {
    public async run({ app, context, read, modify }: { app: SendLaterApp, context: SlashCommandContext, read: IRead, modify: IModify }): Promise<void> {
        const appId = app.getID();
        const room = context.getRoom();
        const user = context.getSender();

        const text =
                `\`/sendlater\` Starts a new scheduled message
                \`/sendlater list\` List scheduled messages
                \`/sendlater help\` Shows help message`;

        await notifyUser({ appId, read, modify, room, user, text });
    }
}

export const Help = new HelpCommand();
