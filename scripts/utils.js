module.exports = {
  truncateThousands(post) {
    console.log(post);
    return post > 999 ? (post / 1000).toFixed(1) + "k" : post;
  }
};
