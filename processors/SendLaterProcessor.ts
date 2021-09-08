import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IJobContext } from "@rocket.chat/apps-engine/definition/scheduler";
import { sendMessage } from "../lib/Message";
import { removeTaskPersistence } from "../lib/persistence";

export const sendLaterProcessor = async (jobContext: IJobContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence) => {
    await removeTaskPersistence(read.getPersistenceReader(), persis, jobContext.user?.id, jobContext.jobId);
    await sendMessage({
        appId: jobContext.appId,
        read,
        modify,
        room: await read.getRoomReader().getById(jobContext.roomId) as IRoom,
        sender: jobContext.user,
        text: jobContext.message,
        threadId: jobContext.threadId,
    });
}
