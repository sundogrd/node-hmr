# node-hmr

旨在开启HMR（hot module replacement--模块热替换）功能。提供类似于webpack-dev-server(WDS)的开发体验

# 原理

百度或者谷歌

# 注意事项

如果开启这个中间件，所有文件会同webpack-dev-server一样打包到内存，只适合本地开发环境使用。

# 用法

```js
    // 开发环境开启热更新
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        await require('node-hmr')(app, {
            views: {
                render: 'koa-views', // koa-views
                root: require('path').resolve(__dirname, '../views'), // 类似于koa-views，指定模板文件目录
                opt: {map: {ejs: 'html'}} // koa-views 的第二个选项
            },
            config: require('../../webpack.config'), // your webpack config
            hotClient: { //webpack-hot-client 参数
                reload: false,
                hmr: true
            },
            devMiddleware: {}, // webpack-dev-middleware 中间件参数
            // when compile done, you can get hello string
            compileDone: (middleware) => {
                console.log('hello');
            }
        });
    }
```

# API

由于该中间件事对`koa-webpack`的封装，所以基本配置和`koa-webpack`一致。你可以从[这里](https://github.com/shellscape/koa-webpack)找到koaWebpack的配置。以下是本中间件特有的配置：

### views

Type: `object`

由于本中间件本质是封装了从内存中读取模板数据的功能，所以你可以通过设置该参数来查找。该参数本质是koa-views的配置项加了koa-views本身。

Example:
```js
// middleware.js
await hmr(app, {
   views: {
       render: 'koa-views', // 使用的模板渲染库 类koa-views库
       root: 'server/views', // koa-views 的root参数
       opt: {map: {ejs: 'html'}} // koa-views 的options 可以指定渲染引擎
   },
   config: require('../../webpack.config'), // your webpack config
});

// controller.js
async function (ctx) {
    await ctx.render('index', {
        env: 'develop',
        someRenderData: ''
    });
};
```

### compileDone

Type: `function`

webpack编译完成时进行的回调。你可以再这里做一下自定义动作。