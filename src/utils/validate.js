export default {
    isExternal: (path) => {
        return /^(https?:|mailto:|tel:)/.test(path)
    }
}