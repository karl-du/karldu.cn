---
title: "JavaScript模块化"
description: "近年来，随着 Web 应用程序的快速发展，JavaScript\n代码越来越庞大，越来越复杂。人们迫切的需要模块化编程来解决代码体积问题。通过模块化，我们可以专注核心业务代码，其他的都可以引入别人封装好的模块。JavaScript\n社区为此付出巨大的努力，涌现了不少优秀的模块加载解决方案。"
pubDate: "2020-04-29T13:53:31.000Z"
updatedDate: "2021-09-24T09:13:31.000Z"
category: "JavaScript"
tags:
  - "JavaScript"
  - "模块化"
  - "import"
  - "require"
readingTimes: 15
author: "Karl Du"
remoteId: "a1a7d74a-3684-4877-992c-efa10d8ccf8e"
---
## 为什么需要模块化

近年来，随着 Web 应用程序的快速发展，JavaScript 代码越来越庞大，越来越复杂。人们迫切的需要模块化编程来解决代码体积问题。通过模块化，我们可以专注核心业务代码，其他的都可以引入别人封装好的模块。JavaScript 社区为此付出巨大的努力，涌现了不少优秀的模块加载解决方案。

整理一下，共有以下几点原因：

+ 网站正在变成网络应用
+ 代码复杂度随着站点变大而增加
+ 需要高度解耦的JS文件/模块
+ 部署需要在很少的HTTP调用中优化代码

## require

requirejs 是一个基于 javascript 语言的文件和模块加载器。

其实用非常简单，官方资料也比较充分。模块体现在 requirejs 中，可如下所示：定义了一个名称为 myModule 的模块，它依赖于 dep1 和 dep2 两个模块，此模块返回了一个对象，此对象包含一个名称为 name 的属性。

```javascript
define('myModule', ['dep1','dep2'], function(dep1, dep2) {
  return {
    name:'hello world'
  }
})
```

模块可以使用依赖模块的文件路径，此时依赖模块的相对路径是相对当前模块所在的路径。

```javascript
define('myModule', ['./modules/dep1','dep2'], function(dep1,dep2) {
  return {
    name:'hello world'
  }
})
```

在 requirejs 中，可以直接将 vue 作为一个模块引入使用。

使用插件：当存在模板文件时，依赖的模块名称前面增加"text!"即表示此依赖为文本文件，这样即可将 vue 的模板文件异步加载进来，使用“css!”，css 文件也可这样引用。

## import

import语法声明用于从已导出的模块、脚本中导入函数、对象、指定文件（或模块）的原始值。

import模块导入与export模块导出功能相对应，也存在两种模块导入方式：命名式导入（名称导入）和默认导入（定义式导入）。

> import的语法跟require不同，而且import必须放在文件的最开始，且前面不允许有其他逻辑代码，这和其他所有编程语言风格一致

```javascript
import defaultMember from "module-name";
import * as name from "module-name";
import { member } from "module-name";
import { member as alias } from "module-name";
import { member1 , member2 } from "module-name";
import { member1 , member2 as alias2 , [...] } from "module-name";
import defaultMember, { member [ , [...] ] } from "module-name";
import defaultMember, * as name from "module-name";
import "module-name";
```

## import 和 require

require/exports: CommonJs/AMD 中为了解决模块化语法而引入的
import/export: ES6 引入的新规范

### 调用时间

require 是运行时调用，所以理论上可以运作在代码的任何地方
import 是编译时调用，所以必须放在文件的开头

### 本质

require 是赋值过程，其实 require 的结果就是对象、数字、字符串、函数等，再把结果赋值给某个变量，它就是普通的值传递。

import 是结构过程，使用 import 导入模块的属性或者方法是引用传递，且 import 是 readonly，值是单向传递的.

### 用法展示

#### require

```javascript
// module.js
module.exports = {
  print: function() {
    console.log(123);
  }
};

// sample.js
var obj = require('./module.js');
obj.a();
```

#### import

```javascript
// module.js
export default function test(args) {
  console.log(args);
};

// sample.js
import test from './module.js';
test();
```

### 总结

- 通过 require 引入基础数据类型时，属于复制改变量
- 通过 require 引入复杂数据类型时，属于浅拷贝该对象
- 出现模块之间循环引用时，会输出已执行的模块，未执行的模块不会输出
- CommonJs 规范默认 export 是一个对象，即使对象导出的是一个基础数据类型
