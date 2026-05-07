class Mock {
  async then(res, rej) {
    res({ data: "ok" });
  }
}
Promise.allSettled([new Mock()]).then(console.log);
