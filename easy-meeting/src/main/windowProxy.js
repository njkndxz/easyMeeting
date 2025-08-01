const windowManage = new Map();

export const saveWindow = (id, window) => {
    windowManage.set(id, window)
}

export const getWindow = (id) => {
    return windowManage.get(id);
}

export const delWindow = (id) => {
    windowManage.delete(id)
}

export const getWindowManage = () => {
    return windowManage;
}

