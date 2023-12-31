console.log('waiting to load hooks');
setTimeout(() => {
  console.log('loading hooks');
  Object.keys(universal.plugins).forEach((plugin) => {
    const data = universal.plugins[plugin];
    if (!data.jsCHook) return;
    const scr = document.createElement('script');
    scr.src = '/hooks/' + data.jsCHook;
    document.body.appendChild(scr);
  });
}, 350);
