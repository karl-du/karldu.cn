---
title: "RequireJS"
description: "随着网站功能逐渐丰富，网页中的js也变得越来越复杂和臃肿，原有通过script标签来导入一个个的js文件这种方式已经不能满足现在互联网开发模式，我们需要团队协作、模块复用、单元测试等等一系列复杂的需求"
pubDate: "2021-10-08T14:43:04.000Z"
updatedDate: "2021-11-15T03:26:17.000Z"
category: "JavaScript"
tags:
  - "javascript"
  - "模块化"
  - "RequireJS"
remoteId: "2bb2fe64-4f76-4af2-b69c-01f01eb9ec6e"
---
随着网站功能逐渐丰富，网页中的js也变得越来越复杂和臃肿，原有通过script标签来导入一个个的js文件这种方式已经不能满足现在互联网开发模式，我们需要团队协作、模块复用、单元测试等等一系列复杂的需求

RequireJS是一个非常小巧的JavaScript模块载入框架，是AMD规范最好的实现者之一。最新版本的RequireJS压缩后只有14K，堪称非常轻量。它还同时可以和其他的框架协同工作，使用RequireJS必将使您的前端代码质量得以提升。

## requirejs能带来什么好处

官方对requirejs的描述：

> *RequireJS is a JavaScript file and module loader. It is optimized for in-browser use, but it can be used in other JavaScript environments, like Rhino and Node. Using a modular script loader like RequireJS will improve the speed and quality of your code.*

大致意思：

在浏览器中可以作为js文件的模块加载器，也可以用在Node和Rhino环境，balabala...。这段话描述了requirejs的基本功能"模块化加载"，什么是模块化加载？我们要从之后的篇幅中一一解释

先来看一段常见的场景，通过示例讲解如何运用requirejs

**正常编写方式**

index.html

```html
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="https://karldu.cn/post/a.js"></script>
    </head>
    <body>
      <span>body</span>
    </body>
</html>
```

a.js

```javascript
function fun1(){
  alert("it works");
}

fun1();
```

可能你更喜欢这样写

```javascript
(function(){
    function fun1(){
      alert("it works");
    }

    fun1();
})()
```

第二种方法使用了块作用域来申明function防止污染全局变量，本质还是一样的，当运行上面两种例子时不知道你是否注意到，alert执行的时候，html内容是一片空白的，即`<span>body</span>`并未被显示，当点击确定后，才出现，这就是**JS阻塞浏览器渲染**导致的结果。

**require**写法

当然首先要到requirejs的网站去下载js -> [requirejs.org](http://requirejs.org/)

index.html

```html
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="https://karldu.cn/post/require.js"></script>
        <script type="text/javascript">
            require(["a"]);
        </script>
    </head>
    <body>
      <span>body</span>
    </body>
</html>
```

a.js

```javascript
define(function(){
    function fun1(){
      alert("it works");
    }

    fun1();
})
```

浏览器提示了"it works"，说明运行正确，但是有一点不一样，这次浏览器并不是一片空白，body已经出现在页面中，目前为止可以知道requirejs具有如下优点：

1. 防止js加载阻塞页面渲染
2. 使用程序调用的方式加载js，防出现如下丑陋的场景

 ```javascript
<script type="text/javascript" src="https://karldu.cn/post/a.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/b.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/c.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/d.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/e.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/f.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/g.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/h.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/i.js"></script>
<script type="text/javascript" src="https://karldu.cn/post/j.js"></script>
 ```

## 基本API

require会定义三个变量：define,require,requirejs，其中require === requirejs，一般使用require更简短

- define 从名字就可以看出这个api是用来定义一个模块
- require 加载依赖模块，并执行加载完后的回调函数

前一篇中的a.js：

```javascript
define(function(){
    function fun1(){
      alert("it works");
    }

    fun1();
})
```

通过define函数定义了一个模块，然后再页面中使用：

```javascript
require(["js/a"]);
```

来加载该模块(*注意require中的依赖是一个数组，即使只有一个依赖，你也必须使用数组来定义*)，require API的第二个参数是callback，一个function，是用来处理加载完毕后的逻辑，如：

```javascript
require(["js/a"],function(){
    alert("load finished");
})
```

## 加载文件

之前的例子中加载模块都是本地js，但是大部分情况下网页需要加载的JS可能来自本地服务器、其他网站或CDN，这样就不能通过这种方式来加载了，我们以加载一个jquery库为例：

```javascript
require.config({
    paths : {
        "jquery" : ["http://libs.baidu.com/jquery/2.0.3/jquery"]   
    }
})
require(["jquery","js/a"],function($){
    $(function(){
        alert("load finished");  
    })
})
```

这边涉及了`require.config`，`require.config`是用来配置模块加载位置，简单点说就是给模块起一个更短更好记的名字，比如将百度的jquery库地址标记为`jquery`，这样在require时只需要写`["jquery"]`就可以加载该js，本地的js我们也可以这样配置：

```javascript
require.config({
    paths : {
        "jquery" : ["http://libs.baidu.com/jquery/2.0.3/jquery"],
        "a" : "js/a"   
    }
})
require(["jquery","a"],function($){
    $(function(){
        alert("load finished");  
    })
})
```

通过paths的配置会使我们的模块名字更精炼，paths还有一个重要的功能，就是可以配置多个路径，如果远程cdn库没有加载成功，可以加载本地的库，如：

```javascript
require.config({
    paths : {
        "jquery" : ["http://libs.baidu.com/jquery/2.0.3/jquery", "js/jquery"],
        "a" : "js/a"   
    }
})
require(["jquery","a"],function($){
    $(function(){
        alert("load finished");  
    })
})
```

这样配置后，当百度的jquery没有加载成功后，会加载本地js目录下的jquery 

1. 在使用requirejs时，加载模块时不用写`.js`后缀的，当然也是不能写后缀
2. 上面例子中的callback函数中发现有`$`参数，这个就是依赖的`jquery`模块的输出变量，如果你依赖多个模块，可以依次写入多个参数来使用：

```java
require(["jquery","underscore"],function($, _){
    $(function(){
        _.each([1,2,3],alert);
    })
})
```

如果某个模块不输出变量值，则没有，所以尽量将输出的模块写在前面，防止位置错乱引发误解

## 全局配置

上面的例子中重复出现了`require.config`配置，如果每个页面中都加入配置，必然显得十分不雅，requirejs提供了一种叫"主数据"的功能，我们首先创建一个main.js：

```javascript
require.config({
    paths : {
        "jquery" : ["http://libs.baidu.com/jquery/2.0.3/jquery", "js/jquery"],
        "a" : "js/a"   
    }
})
```

然后再页面中使用下面的方式来使用requirejs：

```javascript
<script data-main="js/main" src="https://karldu.cn/post/js/require.js"></script>
```

解释一下，加载 requirejs 脚本的 script 标签加入了`data-main`属性，这个属性指定的 js 将在加载完 require.js 后处理，我们把`require.config`的配置加入到`data-main`后，就可以使每一个页面都使用这个配置，然后页面中就可以直接使用`require`来加载所有的短模块名

`data-main`还有一个重要的功能，当script标签指定data-main属性时，require会默认的将data-main指定的js为根路径，是什么意思呢？如上面的`data-main="js/main"`设定后，我们在使用`require(['jquery'])`后(不配置jquery的paths)，require会自动加载js/jquery.js这个文件，而不是jquery.js，相当于默认配置了：

```javascript
require.config({
    baseUrl : "js"
})
```

## 第三方模块

通过`require`加载的模块一般都需要符合AMD规范即使用`define`来申明模块，但是部分时候需要加载非AMD规范的js，这时候就需要用到另一个功能：shim，shim解释起来也比较难理解，shim直接翻译为"垫"，其实也是有这层意思的，目前我主要用在两个地方

1、非AMD模块输出，将非标准的AMD模块"垫"成可用的模块，例如：在老版本的jquery中，是没有继承AMD规范的，所以不能直接require["jquery"],这时候就需要shim，比如我要是用underscore类库，但是他并没有实现AMD规范，那我们可以这样配置

```javascript
require.config({
    shim: {
        "underscore" : {
            exports : "_";
        }
    }
})
```

这样配置后，我们就可以在其他模块中引用underscore模块：

```javascript
require(["underscore"], function(_){
    _.each([1,2,3], alert);
})
```

2、插件形式的非AMD模块，我们经常会用到jquery插件，而且这些插件基本都不符合AMD规范，比如jquery.form插件，这时候就需要将form插件"垫"到jquery中：

```javascript
require.config({
    shim: {
        "underscore" : {
            exports : "_";
        },
        "jquery.form" : {
            deps : ["jquery"]
        }
    }
})
```

也可以简写为：

```javascript
require.config({
    shim: {
        "underscore" : {
            exports : "_";
        },
        "jquery.form" : ["jquery"]
    }
})
```

这样配置之后我们就可以使用加载插件后的jquery了

```javascript
require.config(["jquery", "jquery.form"], function($){
    $(function(){
        $("#form").ajaxSubmit({...});
    })
})
```
