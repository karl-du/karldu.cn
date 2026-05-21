---
title: "C#中数组、ArrayList和List的区别"
description: "在C#中，数组、ArrayList、List 能够存储一组对象，那么他们区别是什么呢？"
pubDate: "2021-02-08T13:56:19.000Z"
updatedDate: "2022-05-12T14:39:10.000Z"
category: "C#"
tags:
  - "C#"
readingTimes: 18
author: "Karl Du"
remoteId: "febdf780-81db-401d-92a0-b6e18197f55e"
---
在`C#`中，数组、`ArrayList`、`List`都能够存储一组对象，那么他们的区别是什么呢？

## Array

数组在内存中是连续存储的，所以它的索引速度非常快，而且赋值和修改元素也很简单。但是缺点也十分明显

+ 在两个元素中间插入新元素很麻烦
+ 需要提前声明数组长度，而长度过长会造成内存浪费，过短又会造成溢出，无法确定长度不推荐使用

```csharp
string foo = new string[2];

foo[0] = "Hello";
foo[1] = "World";
```

## ArrayList

`ArrayList`处于`System.Collections`命名空间下，如果需要使用需要引入。同时继承了`IList`接口，提供了数据检索和存储。`ArrayList`对象的大小是按照其中存储的数据来动态扩充与收缩的。所以，在声明`ArrayList`对象时并不需要指定它的长度

```csharp
ArrayList foo = new ArrayList();

// 增加
foo.Add("Hello");
foo.Add("World");

// 删除
foo.RemoveAt("0");

// 修改
foo[0] = "hello";

// 插入数据
foo.Insert(0, " ");
```

如此来看，`ArrayList`解决了所有数组的痛点，那为什么还要有`List`呢？

我们如果注意观察，会发现，`foo.Add`这个方法参数类型是`Object`，也就是说我们可以给`ArrayList`添加任意类型的数据，如果我们使用不慎，会发生类型不匹配异常，也就是说`ArrayList`是不安全类型。在存储或检索值类型时通常发生装箱和取消装箱操作，带来很大的性能耗损。我们总结一下`ArrayList`的缺点

+ 不安全类型
+ 装箱拆箱性能损耗高

## List

因为`ArrayList`存在不安全类型与装箱拆箱的缺点，所以出现了泛型的概念。`List`类是`ArrayList`类的泛型等效类，它的大部分用法都与`ArrayList`相似，因为`List`类也继承了`IList`接口。最关键的区别在于，在声明`List`集合时，我们同时需要为其声明`List`集合内数据的对象类型

```csharp
List<string> foo = new List<string>();

// 增加
foo.Add("Hello");

// 修改
foo[0] = "hello";

// 删除
foo.RemoveAt(0);
```

上例中，我们可以看到，我们在声明时需要用`<Strintg>`形式传入类型，这样，我们往`List`集合中插入`String`数组`Hello`，`IDE`就会报错，且不能通过编译。这样就避免了前面讲的类型安全问题与装箱拆箱的性能问题了

## 版本

`Array`和`ArrayList`是`C# 1`语法，`List<>`是`C# 2`的重要改变。

|C#版本|发布时间|.Net 版本|VS 版本|
|-|-|-|-|
|C# 1.0|2002-02-13|.NET Framework 1.0|VS.NET 2002|
|C# 2.0|2005-11-07|.NET Framework 2.0|VS.NET 2005|

## 总结

相较于数组，`ArrayList`和`List`十分灵活，可以自动扩容、轻松插入新元素，此外，由于继承了`IList`，后者在检索数据十分强大

数组可以具有多个维度，而`ArrayList`或`List<T>`始终只具有一个维度。但是，您可以轻松创建数组列表或列表的列表。特定类型（`Object`除外）的数组的性能优于`ArrayList`的性能。这是因为`ArrayList`的元素属于`Object`类型；所以在存储或检索值类型时通常发生装箱和取消装箱操作。不过，在不需要重新分配时（即最初的容量十分接近列表的最大容量），`List<T>`的性能与同类型的数组十分相近

在决定使用`List<T>`还是使用`ArrayList`类（两者具有类似的功能）时，记住`List<T>`类在大多数情况下执行得更好并且是类型安全的。如果`List<T>`对类的类型`T`使用引用类型，则两个类的行为是完全相同的。但是，如果对类型`T`使用值类型，则需要考虑实现和装箱问题
