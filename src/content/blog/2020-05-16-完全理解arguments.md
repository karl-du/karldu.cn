---
title: "完全理解 arguments"
description: "它是JS的一个内置对象，常被人们所忽略，但实际上确很重要，JS不像JAVA是显示传递参数，JS传"
pubDate: "2020-05-16T04:24:57.000Z"
updatedDate: "2021-09-24T09:12:29.000Z"
category: "JavaScript"
tags:
  - "JavaScript"
remoteId: "d5cbda56-fdc2-465c-8039-c2570a6cfc6d"
---
# 完全理解 arguments

## 什么是 arguments

>它是JS的一个内置对象，常被人们所忽略，但实际上确很重要，`JS`不像`JAVA`是显示传递参数，`JS`传的是形参，可以传也可以不传，若方法里没有写参数却传入了参数，该如何拿到参数呢，答案就是`arguments`了，在一些插件里通常这样使用。

每一个函数都有一个`arguments`，它包含了函数所要调用的参数，通常我们把它当作数组，通过下标获取参数。然而它却不是数组

我们打印一下`arguments`看看到底是什么？

虽然`arguments`不是数组但是我们可以将它转换成数组

```javascript
[].slice.call(arguments);
```

## 参数与 arguments 的关系

先看代码：

```javascript
function a1(x) {
    x = 2;
    console.log(x, arguments[0]);
}
a1(); // 2 undefined

function a2(x) {
    arguments[0] = 2;
    console.log(x, arguments[0]);
}
a2(); // undefined 2
```

我们看到，如果缺省参数，`arguments`和参数是完全隔离开的。

如果传入参数：

```javascript
function a3(x) {
    x = 2;
    console.log(x, arguments[0]);
}
a3(1); // 2 2

function a4(x) {
    arguments[0] = 2;
    console.log(x, arguments[0]);
}
a4(1); // 2 2
```

我们看到这里`arguments`和参数是双向绑定的
