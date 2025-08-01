import Store from "electron-store"


const store = new Store()
let userId = null

export const initUserId = (_userId) => {
    userId = _userId
}

export const setData = (key, value) => {
    store.set(userId + key, value)
}

export const getData = (key) => {
    return store.get(userId + key)
}


export const getUserId = () => {
    return userId
}
