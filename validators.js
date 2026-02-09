exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

exports.isValidPassword = (password) => {
    if (typeof password !== 'string') return false
    if (password.length < 8) return false
    return /[a-zA-Z]/.test(password)
}