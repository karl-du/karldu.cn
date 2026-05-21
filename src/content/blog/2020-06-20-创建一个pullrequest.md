---
title: "创建一个pull request"
description: "单击fork，我们会发现个人仓库创建了一个克隆版。"
pubDate: "2020-06-20T15:01:09.000Z"
updatedDate: "2021-11-15T03:22:26.000Z"
category: "Git"
tags:
  - "Git"
  - "pullrequest"
remoteId: "7bf32ae2-f29f-403f-8f42-892e8ef09e01"
---
## fork project

单击fork，我们会发现个人仓库创建了一个克隆版。

![image](../../assets/blog-images/7bf32ae2-f29f-403f-8f42-892e8ef09e01/01.png)

## 添加远程库

```git
git remote add remote https://github.com/AcademicDog/onmyoji_bot.git
```

## 同步更新远程库

```git
git pull remote master:master
```

## 提交代码

```git
git commit -am 'edit readme'
```

## 创建pull request

![image](../../assets/blog-images/7bf32ae2-f29f-403f-8f42-892e8ef09e01/02.png)

然后选择对应分支，提交，便完成了一次`pull request`创建

