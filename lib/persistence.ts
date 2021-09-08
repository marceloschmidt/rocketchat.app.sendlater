import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

export const setTasksPersistence = async (persistence: IPersistence, id: string, data: any): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#TASKS`);
    await persistence.updateByAssociation(association, data, true);
};

export const getTasksPersistence = async (persistenceRead: IPersistenceRead, id: string): Promise<any> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#TASKS`);
    const result = await persistenceRead.readByAssociation(association) as Array<any>;
    return result && result.length ? result[0] : [];
};

export const addTaskPersistence = async (persistenceRead: IPersistenceRead, persistence: IPersistence, id: string, task: any): Promise<void> => {
    const data = await getTasksPersistence(persistenceRead, id);
    data.push(task);
    await setTasksPersistence(persistence, id, data);
};

export const removeTaskPersistence = async (persistenceRead: IPersistenceRead, persistence: IPersistence, id: string, taskId?: string): Promise<void> => {
    if (taskId) {
        const data = await getTasksPersistence(persistenceRead, id);
        const newData = data.filter((task) => task.taskId !== taskId);
        await setTasksPersistence(persistence, id, newData);
    }
};

export const persistUIData = async (persistence: IPersistence, id: string, data: any): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    await persistence.updateByAssociation(association, data, true);
};

export const getUIData = async (persistenceRead: IPersistenceRead, id: string): Promise<any> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    const result = await persistenceRead.readByAssociation(association) as Array<any>;
    return result && result.length ? result[0] : null;
};

export const clearUIData = async (persistence: IPersistence, id: string): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    await persistence.removeByAssociation(association);
};
