const regs = {
    email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
    number: /^\+?[1-9][0-9]*$/,
    password: /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*_]{8,}$/,
    version: /^[0-9\.]+$/
}

export const verify = (rule, value, reg, callback) => {
    if (value) {
        if (reg.test(value)) {
            callback()
        } else {
            callback(new Error(rule.message))
        }
    } else {
        callback()
    }
}

export const checkpassword = (value) => {
    return regs.password.test(value);
}

export const checkEmail = (value) => {
    return regs.email.test(value);
}

export const password = (rule, value, callback) => {
    return verify(rule, value, regs.password, callback)
}

export const number = (rule, value, callback) => {
    return verify(rule, value, regs.number, callback)
}