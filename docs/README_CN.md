## 开发指南

[English](../README.md) | 中文

### 介绍

ODC 有集中化部署的 **Web 版**和本地运行的**客户端版本。**Web 版本需要依赖 ODC Server 运行，客户端版本会自动安装对应的依赖，并生成一个可独立运行的安装包。

### 初始化项目

#### 环境要求

1. [Nodejs](https://nodejs.org/zh-cn/download) 16 及以上
2. [pnpm](https://pnpm.io/zh/installation)
3. 最低 8G 内存
4. （非必需，如需生成 Mac 客户端，则必需）MacOS 系统

#### 客户端依赖安装（Web 版可跳过）

##### ODC Server

打包完 ODC Server Jar 包之后，需要在如下目录存放 Jar 包。[如何构建 Jar](https://github.com/oceanbase/odc/blob/main/docs/zh-CN/DEVELOPER_GUIDE.md#31-jar-%E6%9E%84%E5%BB%BA%E5%92%8C%E5%90%AF%E5%8A%A8)

```shell
libraries
 - java
   - odc.jar
   - plugins
     - plugins 相关包
   - starters
     - starters 相关包
```


##### JRE

```shell
# 使用ODC提供的JRE
pnpm run prepack jre
```

##### OBClient

```shell
# 使用ODC提供的 OBClient
pnpm run prepack obclient
```

#### 安装依赖

```shell
pnpm install
```

#### 配置 ODC Server 地址

修改 `config/config.js` 中的 `proxy` 字段，将其中的 `target` 属性**都更改**为 ODC Server 的地址。

```shell
proxy: {
    '/api/v1/webSocket/obclient': {
      target: 'ODC Server 地址',
      ws: true,
    },
    '/api/': {
      target: 'ODC Server 地址',
    },
    '/oauth2/': {
      target: 'ODC Server 地址',
    },
    '/login/': {
      target: 'ODC Server 地址',
    }
  }
```

### 开发

#### Web 版开发

```shell
pnpm run dev
```

此时会在默认的 `8000` 端口建立一个 web 服务器，访问[ http://localhost:8000](https://localhost:8000) 即可打开 ODC。

#### 客户端开发

ODC 客户端基于 Electron 来开发，我们需要启动 Web 服务与 Electron 服务两个服务。

##### 启动客户端 Web 服务

```shell
pnpm run dev:client
```

等待启动成功后，接着我们再启动 electron。

##### 启动 Electron

```shell
pnpm run start-electron
```

### 构建

#### Web 版构建

```shell
pnpm run build:odc
```

打包后的产物可以在 `dist/renderer`中查看

#### 客户端构建

```shell
# 构建win，linux，mac
node ./scripts/client/build.js all
```

可以通过调整命令参数来选择性的构建不同安装包，目前支持以下几种类型

1. **mac** - dmg 安装包
2. **linux_x86** - x86_64 版本 deb，AppImagean 安装包
3. **linux_aarch64** - arm64 版本 deb，AppImage 安装包
4. **win** - win32，win64 版本安装包
5. **all** - 全部安装包
