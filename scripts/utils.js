module.exports = {
  truncateThousands(post) {
    return post > 999 ? (post / 1000).toFixed(1) + 'k' : post
  },

  checkIfUrl(url) {
    return url.includes('http') ? url : ''
  }
}
