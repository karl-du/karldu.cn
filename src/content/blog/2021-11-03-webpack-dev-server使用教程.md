---
title: "webpack-dev-server 使用教程"
description: "webpack-dev-server是我们在开发nodejs必须要掌握的工具，它可以帮助我们快速搭建开发环境。官网介绍如下"
pubDate: "2021-11-03T08:26:54.000Z"
updatedDate: "2022-05-12T13:29:00.000Z"
category: "JavaScript"
tags:
  - "webpack"
  - "webpack-dev-server"
readingTimes: 0
author: "Karl Du"
remoteId: "43003bda-50d9-4d7c-8dd0-dd382e0bb546"
---
`webpack-dev-server`是我们在开发`nodejs`必须要掌握的工具，它可以帮助我们快速搭建开发环境。官网介绍如下

> Use [webpack](https://webpack.js.org/) with a development server that provides live reloading. This should be used for **development only**.
>
> It uses [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) under the hood, which provides fast in-memory access to the webpack assets.

简单来说，`webpack-dev-server`就是一个小型的静态文件服务器。使用它可以为`wepack`打包生成的资源文件提供`Web`服务

## 安装

```bash
$ npm install webpack-dev-server --save-dev
```

*注意：虽然你可以全局安装`webpack-dev-server`，但我们建议在本地安装它*

## 使用

官方推荐两种主流的使用方式

### CLI

最简单的办法就是通过`webpack CLI`，在`webpack.config.js`文件目录下执行：

```bash
$ npx webpack serve
```

> *注意：*
>
> *1、你需要预装`npx`确保你以上命令执行新成果，关于`npx`介绍请参考此篇[文章](/post/2465fd4d-c142-4f8c-97dc-549d1bbc6d3d/)*
>
> *2、请注意你的`webpack`版本，`v5`版本才支持`webpack serve`*

### NPM Scripts

`NPM package.json`脚本是一种方便且有效的方法，可以运行本地安装的二进制文件，而不必担心它们的完整目录。示例如下：

```json
{
  "scripts": {
    "serve": "webpack serve"
  }
}
```

定义好脚本后在控制台或终端运行：

```bash
$ npm run serve
```

`NPM`会自动为你引用`node_modules`中的二进制文件，并执行文件或命令。

### 结果

这两种方法都将启动一个服务器实例并开始在端口 8080 上侦听来自`localhost`的连接

`webpack-dev-server`默认配置为支持在服务器运行时编辑代码时实时重新加载文件

## 常用配置

以下只介绍工作中的常用配置，有关更多用例和选项，请参阅[官方文档](https://webpack.js.org/api/webpack-dev-server/)

### 端口配置

1、`webpack`配置项配置

```javascript
module.exports = {
  //...
  devServer: {
    port: 8080,
  },
};
```

2、`CLI`命令启动配置

```bash
$ npx webpack serve --port 8080
```

### 自动刷新

`webpack-dev-server`有两种模式支持自动刷新——`iframe`模式和`inline`模式。

在`iframe`模式下：页面是嵌套在一个`iframe`下的，在代码发生改动的时候，这个`iframe`会重新加载；在`inline`模式下：一个小型的`webpack-dev-server`客户端会作为入口文件打包，这个客户端会在后端代码改变的时候刷新页面。

1、`iframe`模式

使用`iframe`模式无需额外的配置，只需在浏览器输入：http://localhost:8080/webpack-dev-server/index.html

2、`CLI`命令启动配置

```bash
webpack-dev-server --inline
```

### 反向代理

与`Nginx`类似，`webpack-dev-server`也是通过`url`正则匹配的方式进行`url`代理配置，常用配置参考如下：

```javascript
// webpack.config.js
module.exports = {
    // ...
    devServer: {
        hot: true,
        contentBase: false, // since we use CopyWebpackPlugin.
        compress: true,
        host: 'localhost',
        port: 8080,
        proxy: {
            "/api": {
                target: 'http://localhsot:5000',
                secure: false,
                changeOrigin: true,
                logLevel: 'debug'
            }
        }
    }
}
```

更多关于反向代理的配置，可以参考此篇[文章](https://segmentfault.com/a/1190000016314976)

### 域名白名单

配置该配置后，只有匹配的`host`地址才可以访问该服务，常用于开发阶段模拟网络网络防火墙对访问IP进行限制。当该配置项被配置为`all`时，会跳过`host`检查，但不建议这样做，因为有`DNS`攻击的风险

1、`webpack`配置项配置

```javascript
module.exports = {
  //...
  devServer: {
    allowedHosts: [
      'host.com',
      'subdomain.host.com',
      'subdomain2.host.com',
      'host2.com',
    ],
  },
};
```

2、`CLI`命令启动配置

```bash
$ npx webpack serve --allowed-hosts .host.com --allowed-hosts host2.com
```

## 参考

- [1] [webpack-dev-server GitHub](https://github.com/webpack/webpack-dev-server)

- [2] [webpack-dev-server NPM](https://www.npmjs.com/package/webpack-dev-server)

- [3] [webpack-dev-server 从入门到实战](https://juejin.cn/post/7010571347705200671?utm_source=gold_browser_extension#heading-0)

## 附录

[CLI配置 v3](https://github.com/webpack/webpack-cli/blob/master/SERVE-OPTIONS-v3.md)

[CLI配置 v4](https://github.com/webpack/webpack-cli/blob/master/SERVE-OPTIONS-v4.md)
