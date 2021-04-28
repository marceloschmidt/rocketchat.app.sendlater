import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { sendRoomMessage } from "../lib/Rooms";
import { SendLaterApp } from "../SendLaterApp";

class HelpCommand {
    public async run({ app, context, read, modify }: { app: SendLaterApp, context: SlashCommandContext, read: IRead, modify: IModify }): Promise<void> {
        const room = context.getRoom();

        const text =
                `\`/sendlater new\` Starts a new scheduled message
                \`/sendlater list\` List scheduled messages
                \`/sendlater help\` Shows help message`;

        await sendRoomMessage({ app, read, modify, room, text });
    }
}

export const Help = new HelpCommand();
