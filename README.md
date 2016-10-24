# efes 


## 概述 Overview
***e代驾前端助手 edaijia fe assistant***
## 
>efes的git commit检测规则中，eslint、csslint，和图片必须add提交为强制检测，error将导致提交失败。version字符串检测只做提示，供开发人员参考。

## 
>本助手是在前端自动化工具 [gsp](https://github.com/viclm/gsp) 的基础上做的定制开发。后期对整个结构做了重构，采用类REST风格，每个命令作为一个独立的模块（放置在commonds目录下，通过load自动加载）。在此感谢 gsp 的开发者 [viclm](https://github.com/viclm)

## 准备 Prepare

### 1 安装环境 Requirements

* node 4.1.0+ 下载地址：http://npm.taobao.org/mirrors/node
* python 2.x
* nginx

### 2 安装/更新 Install/Update

`npm install -g efes`

## 开始 Getting Started

### 1 创建工作目录 Create The Work Space

#### 1.1 创建目录 Mkdir

```shell
mkdir WorkSpaceEfes
```

#### 1.2 创建`efesproject.json`配置文件 Create The Config File `efesproject.json`

```shell
touch efesproject.json
vim efesproject.json
```

>这里只是一个简单的示例，详细文档查看下面对`efesproject.josn`的说明。

```json
{
  "global": {
    "git": {
      "host": "https://github.com/",
      "config": {
        "user.name": "your_github_user_name",
        "user.email": "your_github_user_email"
      },
      "branch": {
        "local": "master",
        "remote": "origin/master"
      }
    },
    "domain": {
      "publish": "static.resource.com",
      "dev": "static.test.resource.ccom"
    }
  },
  "projects": [{
    "name": "wap",
    "git": {
      "repo": "edaijia-fe/efes-exp-wap"
    },
    "rewrite": {
      "root": "efes-exp-wap/main",
      "request": "/"
    },
    "domain": {
      "publish": "wap.efes.com",
      "dev": "wap.test.efes.com"
    }
  }, {
    "name": "www",
    "git": {
      "repo": "edaijia-fe/efes-exp-www"
    },
    "rewrite": {
      "root": "efes-exp-www",
      "request": "/"
    },
    "domain": {
      "publish": "www.efes.com",
      "dev": "www.test.efes.com"
    }
  }]
}
```

#### 1.3 拉去git仓库 Clone Git Repositorys

#### 1.4 配置nginx

#### 1.5 配置host

#### 1.6 运行`efes start` Run `efes start`

### 2 创建新项目 Build A New Efes Project

#### 2.1 初始化/脚手架生成项目 Init/Scaffold

#### 2.2 创建源文件文件

#### 2.3 编辑文件合并规则

#### 2.4 开发

### 3 发布项目 Publish The Project

#### 3.1 publish

#### 3.2 commit

## 命令 Commands

#### project
#####运行：
`efes project`
#####运行目录：
`efes 工作区目录，efesproject.json所在目录。`
#####功能简介：
`根据efesproject.json文件中的配置，克隆/更新git仓库的代码。`
#####efesproject.json：
```json
{
  "global": {
    "git": {
      "host": "ssh://host.you-git-resource.com/",
      "config": {
        "user.name": "hbxeagle",
        "user.email": "hbxeagle@domain1.com"
      },
      "branch": {
        "local": "develop",
        "remote": "origin/develop"
      }
    },
    "domain": {
      "publish": "static.resource.com",
      "dev": "static.test.resource.ccom"
    }
  },
  "projects": [{
    "name": "project0",
    "git": {
      "repo": "project0"
    },
    "rewrite": {
      "root": "pj0/main",
      "request": "/"
    },
    "domain": {
      "publish": "static1.resource.ccom",
      "dev": "static1.test.resource.ccom"
    }
  }, {
    "name": "project1",
    "git": {
      "repo": "project1"
    },
    "rewrite": {
      "root": "project1",
      "request": "/pj1/"
    }
  }, {
    "name": "project1 subProject",
    "rewrite": {
      "root": "fe-edaijia-events",
      "request": "/spj/"
    }
  }, {
    "name": "project2",
    "git": {
      "repo": "project2"
    },
    "rewrite": {
      "root": "project2",
      "request": "/"
    }
  }, {
    "name": "project3",
    "git": {
      "repo": "project3"
    },
    "rewrite": {
      "root": "project3",
      "request": "/"
    }
  }, {
  	"name": "other-host-git-project0",
  	"git": {
      "host": "https://host.you-git-resource-2.com/",
      "config": {
        "user.name": "eagle",
        "user.email": "eagle@aaa.com"
      },
      "branch": {
        "local": "develop",
        "remote": "origin/develop"
      },
      "repo": "project0"
    },
    "domain": {
      "publish": "static.resource1.ccom",
      "dev": "static.test.resource1.ccom"
    },
    "rewrite": {
      "root":"o-project0",
      "request":"/"
    }
  }, {
  	"name": "local-project0",
  	"domain": {
  	  "publish": "local.mydomain.com",
  	  "dev": "local.test.mydomain.com"
  	},
  	"rewrite": {
      "root":"local-project0",
      "request":"/"
    }
  }]
}
```

##### 参数说明：
```
global：全局配置
	git：git配置
		host：git仓库的host
		config：git config配置项（key:value）
		branch：默认git分支
			local：本地分支名称
			remote：远程分支名称
	domain：域名
		publish：线上访问域名（最顶部的为全局配置。此外，每个项目看自定义其域名）
		dev：测试、开发访问域名（最顶部的为全局配置。此外，每个项目看自定义其域名）
projects：项目信息
	name：项目名称
	git：git自定义配置（非必填）
		repo：git仓库名称（不需要 .git 后缀）
	rewrite：rewrite对应关系
		root：项目的本地路径，具体参照上面的例子。
		request：项目的访问路径，规则如下：
			1、请求地址为：http://h5.edaijia.cn/core/，则配置为： /core/
			2、请求地址为：http://h5.edaijia.cn/，则配置为：/
			3、支持多个本地路径配置同一个访问路径
```

#### start
##### 运行：
`efes start`
##### 运行目录：
`efes 工作区目录，efesproject.json所在目录。`
##### 功能简介：
```
开启node http server。前端开发者可以不用开启gulp，efes会根据配置文件efesproject.json中标注每个目录的域名、访问路径，以及每个目录的.efesconfig、concatfile.json中配置的信息，解析请求动态编译jsx、coffee、s6、less、sass、sass、jade，动态合并js、css，动态发布html，动态处理webp图片。用于本地开发、调试。
```
##### options
* -p, --port [value] node http server监听端口，默认为7070，注意要与下面nginx配置相同。
* -d, --direct 直接访问文件，不做任何处理。
* -b, --browsersync 开启browsersync功能(自动刷新功能暂时不能使用)。
* -c, --compress 开启压缩功能。
* --publish 访问资源同时，将最终需要生产的资源发布到发布目录(可能会影响性能，建议使用 efes publish 命令发布)

##### hosts的配置：
```
127.0.0.1 static.resource.com
127.0.0.1 static.test.resource.com
127.0.0.1 static.resource1.com
127.0.0.1 static.test.resource1.com
127.0.0.1 local.mydomain.com
127.0.0.1 local.test.mydomain.com
```

##### nginx的配置：
```conf
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
  listen       80;
  server_name  static.resource.com static.test.resource.com static.resource1.com static.test.resource1.com local.mydomain.com local.test.mydomain.com;
  charset utf-8;
  autoindex       on;
  autoindex_exact_size    on;
  index index.html;

  # BrowserSync websocket
  location ^~ /browser-sync/socket.io/ {
      proxy_pass http://127.0.0.1:7070/browser-sync/socket.io/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
  }

  location ~* \.(?:ttf|eot|woff)$ { #|ttc|otf
      add_header "Access-Control-Allow-Origin" "*";
      expires 1M;
      access_log off;
      add_header Cache-Control "public";
      proxy_set_header x-request-filename $request_filename;
      proxy_set_header Host             $host;
      proxy_pass http://127.0.0.1:7070;
  }
  
  location ~ / {
      proxy_set_header x-request-filename $request_filename;
      proxy_set_header Host             $host;
      proxy_pass http://127.0.0.1:7070;
  }
}
```

#### publish
##### 运行
`efes publish`
##### 运行目录
`efes项目目录，配置了.efesconfig和concatfile.json的目录`
##### 功能简介
`将efes项目下的源码、图片源文件、html/jade源文件编辑、合并到开发目录`
##### options
* -c, --compress  压缩代码
* -a, --all git commit 的 -a参数，此参数触发 git commit 操作。
* -m, --message git commit 的 -m参数，此参数触发 git commit 操作。
* --outpath [value] 发布目录，支持相对路径和绝对路径，在不设置outpath 时，默认为项目中 .efesconfig 配置的发布目录。


#### hook
##### 运行：
`efes hook`
##### 运行目录：
`git仓库根目录`
##### 功能简介：
>初始化git commit提交验证。此命令会在.git/hooks目录下添加pre-commit文件，在git commit时，会触发此文件中的操作，进行lint、图片Add提交、version字符串检查（只针对新添加或修改的文件）。


#### init
##### 运行：
`efes init [-f]`
##### 运行目录：
`本地项目根目录`
##### 功能简介：

>生成efes项目配置文件和lint检测规则文件。在项目的根目录下使用。
>PS：为了避免错误，efes init在windows下请在cmd下运行。

##### options
* -f, --force 在非空目录强制执行。

##### 选择脚手架为『no』时，生成如下几个文件：
* .eslintrc：eslint监测规则(此文件同时也是Sublime的插件Sublime-contrib-eslint配置文件)
* .eslintignore：eslint监测忽略规则
* .csslintrc：csslint监测规则，Sublime的插件支持
* .csslintignore：csslint监测忽略规则，Sublime的插件不支持。
* .efesconfig：efes配置文件

##### 选择脚手架为『yes』时，efes会在项目根目录创建完整的目录结构，和gulp配置。
##### 生成文件目录结构：
```
    |— fonts                          字体
    |— images                       图片
    |— styles                         样式
    |— scripts                        脚本
    |— concatfile.json           合并配置文件
    |— gulpfile.js                   gulp任务配置文件
    |— package.json             npm配置文件
    |— .eslintrc                      eslint规则文件
    |— .eslintignore               eslint监测忽略规则
    |— .csslintrc                    csslint规则文件
    |— .csslintignore             csslint监测忽略规则
    |— .efesconfig                efes项目配置文件
    |— src                             开发目录
        |— js                           js文件开发目录
        |- icons                       icons精灵图小图片文件目录
        |- images                    图片文件（将自动压缩、生成webp至根目录下的images文件夹中）
        |— css                        css文件开发目录
```


#### scaffold
##### 运行
`efes scaffold` 或 `efes sc`
##### 运行目录
`本地项目根目录`
##### 功能简介
`前端脚手架。在脚手架中封装了一些常用的功能，让开发者免于复制粘贴文件的烦恼。
PS：为了避免错误，efes init在windows下请在cmd下运行。`
##### options
* -f, --force 在非空目录强制执行


##### h5 脚手架包含功能
1. loading模板
2. 横屏提示模板
3. 重力感应示例
4. webp监测，自动替换
5. 唤起客户端或跳转到下载<br>
PS：由于使用的是WebViewJavascriptBridge，作为和客户端通讯的规则，调用时需要和客户端定好WebViewJavascriptBridge接口
6. 客户端内部调用原生功能插件<br>
PS：经测试，ios9和Android有新的规则，现有代码只能在微信中唤起客户端。

##### h5 脚手架目录结构
```
    |— fonts                字体
    |— images               图片
    |— styles               样式
    |— scripts              脚本
    |— concatfile.json      合并配置文件
    |— gulpfile.js gulp     任务配置文件
    |— package.json         npm配置文件
    |— .eslintrc            eslint规则文件
    |— .csslintrc           csslint规则文件
    |— .efesconfig          efes项目配置文件
    |— index.html           首页
    |— src                  开发目录
        |— js               js文件开发目录
            |- index.js
            |- mod
                |- call-client.js       客户端内部调用原生功能
                |- download.js          唤起客户端或跳转到下载
                |- landscape-tip.js     横屏提示js
                |- loading.js           loading
                |- transation.js        滑屏js
                |- webp.js              webp监测，手动触发替换
                |- webp.lazy.js         webp监测，自动触发替换，有lazy效果
                |- weight.js            重力感应示例
        |- images            图片文件（将自动压缩至根目录下的images文件夹中。对不需要压缩的文件在concatfile.json中配置）
        |— css              css文件开发目录
            |- index.css
            |- mod
                |- animations.css       滑屏css
                |- swipe-page.css       滑屏css
                |- landscape-tip.css    横屏提示css
                |- loading.css          loading
                |- weight.css           重力感应示例
```
##### concatfile.json的示例：
```json
{
  "pkg": {
    "scripts/base.js": [
      "/other-project/src/**/*.*",
      "!/other-project/src/**/*cookie.*",
      "src/base.babel"
    ],
    "scripts/index.js": [
      "/other-project/libs/zepto.min.js",
      "/other-project/libs/base.js",
      "/other-project/libs/react.min.js",
      "/other-project/libs/react-dom.min.js",
      "libs/redux.min.js",
      "libs/react-redux.js",
      "src/index.jsx"
    ],
    "scripts/aaa.js": [
      "src/bbb.jsx"
    ],
    "styles/index.css": [
      "/other-project/libs/reset.mobile.min.css",
      "src/css/index.less"
    ]
  }
}
```
##### concatfile.json说明：
1. 在efes的项目中，如果需要自动编译或合并js、css就需要配置concatfile.json文件，efes会根据这个文件编译、合并、发布js和css文件。如果没有配置此文件对js、css的处理为，把开发目录（默认为src。.efesconfig中所配置）所有的js、css文件复制到发布目录（默认为项目根目录。.efesconfig中所配置）。
2. concatfile.json的配置的目录支持minimatch的规则（gulp.src的目录规则）。
3. 配置的less、jsx、es6等文件都是单个编译的，如果需要先合并后编译其他文件，请在该文件中使用import语句。


#### ver
##### 运行：
`efes ver [-s xxxx]`
##### 运行目录：
`任意项目目录`
##### 功能简介：
```
为当前目录下所有的html中引用的js、css（只处理相对路径）添加/替换版本号字符串，默认为：VERSION。
```
##### options
* -s [value] 自定义的版本号字符串。


### gulp自动化功能
1. 自动编译coffee、es6、less、jade<br>
2. 根据concatfile.json配置的内容，自动合并js(coffee、es6)、css(less)<br>
3. 支持sourcemap功能。<br>
4. 文件有改变时自动刷新页面。<br>
5. 图片自动压缩；icons精灵图自动合并；自动转换为webp图片

### Sublime 配套插件(建议安装Sublime3)
下面的插件，请先确认下列 npm 包是否已经安装：

* elint 安装命令：npm install -g elint
* csslint 安装命令：npm install -g csslint

Sublim插件：

* Sub­limeLin­ter：https://sublime.wbond.net/packages/SublimeLinter
* SublimeLinter-csslint：https://sublime.wbond.net/packages/SublimeLinter-csslint
* Sublime​Linter-contrib-eslint：https://packagecontrol.io/packages/SublimeLinter-contrib-eslint
* Js​Format：https://packagecontrol.io/packages/JsFormat

### git commit 中文乱码解决方案

  git 中文文件名 乱码 mac<br>
  git 默认中文文件名是 xx%<br>
  是因为 对0x80以上的字符进行quote<br>
  只需要<br>
  git config core.quotepath false<br>
  core.quotepath设为false的话，就不会对0x80以上的字符进行quote。中文显示正常<br>

### 更新日志

#### v0.1.35更新
1. 修复windows下，efes start启动是路径错误bug。

#### v0.1.34更新
1. 修复由v0.1.28造成的publish在npm4.*下的bug。
2. 修改错误的git地址和issue地址。

#### v0.1.32更新
1. 添加请求路径 index 默认匹配 index.html。（http://static.resource.com/ 访问 http://static.resource.com/index.html）

#### v0.1.30更新
1. 兼容使用concatfile的方式合并jsx或es6时，使用browserify造成的多个闭包的错误。

#### v0.1.28更新
1. efes publish 合并 git commit功能，当配置参数 -a, -m "xxxx" 或 -am "xxx"时，将自动触发git commit命令提交git。

#### v0.1.28更新
1. 使用browserify&babelify替换gulp-babel，添加对es6 import的支持。

#### v0.1.26更新
1. concatfile.json配置支持跨库和mimimatch匹配规则。
2. 取消git配置中的mapping参数，防止多人合作，git仓库本地目录不一致导致的跨库合目录不一致。

#### v0.1.20更新
1. 添加start命令，本地代理服务器，替换每次需要开启gulp的繁琐操作。
2. 添加publish命令，编译、合并、生成发布代码
3. 修改脚手架和gulp，将原有编译策略按目录查询改为按文件名后缀判断文件类型。
4. efesconfig增加dev_dir(开发目录，默认为src)，publish_dir(发布目录，默认为当前路径)配置。
5. webp文件不单独生成到webps目录下，改为同目录，只改变后缀名。


#### v0.1.16更新
1. 添加lint ignore配置，分别对应 .eslintignore 和 .csslintignore两个文件。<br>
PS：.eslintignore sublime的linter插件支持，.csslintignore不支持
2. 优化lint速度。
3. 删除脚手架生产的不必要的文件。
4. 修复h5脚手架中 webp.js的使用'let'关键字的bug.

#### v0.1.15更新
修复init、scaffold命令不能生成脚手架文件bug

#### v0.1.14更新
1. 添加 efes scaffold 脚手架h5模块代码
2. 添加图片 webp 自动转换功能

#### v0.1.13更新
脚手架添加icons精灵图自动合并功能。

#### v0.1.12更新
修复init生成项目初始文件时，部分文件不能正确生成bug

#### v0.1.10更新
1. 新增替换版本号字符串命令『efes ver』。
2. gulp提供图片压缩支持（使用pngquant压缩引擎）。
3. src目录中增加html，方便自动刷新。
bugs fixed

1. 修复gulp编译es6时的错误。
2. 优化commit的速度。

#### v0.1.9更新
bugs fixed

1. 修复windows下不能init不能生成文件、目录的bug。


#### v0.1.8更新
1. 调整init命令的脚手架选项，改为选择是否使用脚手架。
2. 支持脚手架生成文件结构
3. 支持sourcemap功能

遗留bug：

1. sourcemap 对同名的css、js文件不能正确区分。
