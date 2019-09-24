# node-hmr

旨在开启HMR功能。

# 原理

百度或者谷歌

# 注意事项

如果开启这个中间件，所有文件会打包到内存，只适合本地开发环境使用。

# 用法

```js
    // 开发环境开启热更新
     await require('@futu/node-hmr')(app, {
         views: {
             render: '@futu/render', // 渲染组件名称 比如koa-views或者内部@futu/render
             options: { // 渲染组件参数，同真实的参数
                 root: config.template.path, //类似于koa-views的root，指定模板文件目录
                 opts: config.template.options // 类似于koa-views的opts，指定渲染引擎,比如ejs啥的
             },
         },
         hotClient: {}, // 热更新配置
         devMiddleware:{ // WDM配置
             publicPath: '/dist/'  // webpack中publicPath一般为/dist/
         },
         // when compile done, you can get hello string
         compileDone: (middleware) => {
             console.log('hello');
         }
     });

```

# API

由于该中间件事对`koa-webpack`的封装，所以基本配置和`koa-webpack`一致。你可以从[这里](https://github.com/shellscape/koa-webpack)找到koaWebpack的配置。以下是本中间件特有的配置：

### views

Type: `object`

由于本中间件本质是封装了从内存中读取模板数据的功能，所以你可以通过设置该参数来查找。该参数本质是koa-views的配置项加了koa-views本身。

Example:
```js
    // middleware.js
     await require('@futu/node-hmr')(app, {
         views: {
             render: 'koa-views', 
         }
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