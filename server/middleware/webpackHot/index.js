import webpack from "webpack";
import fs from "fs";
import path from "path";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotServerMiddleware from "webpack-hot-server-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import ReactLoadableSSRAddon from "react-loadable-ssr-addon";

let {
  NODE_ENV, // 环境参数
  WEB_ENV, // 环境参数
  target, // 环境参数
  htmlWebpackPluginOptions = ""
} = process.env; // 环境参数

const isSsr = target == "ssr";
//    是否是生产环境
const isEnvProduction = NODE_ENV === "production";
//   是否是测试开发环境
const isEnvDevelopment = NODE_ENV === "development";

console.log("target==========", target);

class WebpackHot {
  constructor(app) {
    this.app = app;
    this.compilerOptions = {};
    this.init();
  }
  async init() {
    var _this = this;

    const { compiler, config } = await import("../../../webpack");

    for (let [index, item] of config[0].plugins.entries()) {
      if (item instanceof ReactLoadableSSRAddon) {
        item.writeAssetsFile = function () {
          const filePath = this.manifestOutputPath;
          const fileDir = path.dirname(filePath);
          const json = JSON.stringify(this.manifest, null, 2);
          try {
            if (!fs.existsSync(fileDir)) {
              fs.mkdirSync(fileDir, { recursive: true });
            }
          } catch (err) {
            if (err.code !== "EEXIST") {
              throw err;
            }
          }
          _this.compilerOptions.assetsManifest = json;
          fs.writeFileSync(filePath, json);
        };
        config[0].plugins[index] = item;
        break;
      }
    }
    // 编译
    this.compiler = webpack(isSsr ? config : config[0]);
    this.addMiddleware();
  }
  addMiddleware() {
    this.addWebpackDevMiddleware();
    // this.addWebpackHotMiddleware();
    if (isSsr) {
      this.addWebpackHotServerMiddleware();
    }
  }
  addWebpackDevMiddleware() {
    const _this = this;
    this.app.use(
      _this.koaDevware(
        webpackDevMiddleware(_this.compiler, {
          noInfo: true,
          serverSideRender: true, // 是否是服务器渲染
          publicPath: "/",
          writeToDisk: true //是否写入本地磁盘
        }),
        _this.compiler
      )
    );
  }

  addWebpackHotMiddleware() {
    const _this = this;
    this.app.use(
      webpackHotMiddleware(
        _this.compiler.compilers.find((compiler) => compiler.name === "client")
      )
    );
  }

  addWebpackHotServerMiddleware() {
    const _this = this;
    this.app.use(
      webpackHotServerMiddleware(_this.compiler, {
        createHandler: webpackHotServerMiddleware.createKoaHandler,
        serverRendererOptions: {
          foo: "Bar",
          options: _this.compilerOptions // 引用传参
        }
      })
    );
  }
  // // 做兼容
  hook(compiler, hookName, pluginName, fn) {
    if (arguments.length === 3) {
      fn = pluginName;
      pluginName = hookName;
    }
    if (compiler.hooks) {
      compiler.hooks[hookName].tap(pluginName, fn);
    } else {
      compiler.plugin(pluginName, fn);
    }
  }
  koaDevware(dev, compiler) {
    var _this = this;
    const waitMiddleware = () =>
      new Promise((resolve, reject) => {
        dev.waitUntilValid(() => {
          resolve(true);
        });

        _this.hook(compiler, "failed", (error) => {
          reject(error);
        });
      });

    return async (ctx, next) => {
      await waitMiddleware();
      await dev(
        ctx.req,
        {
          end(content) {
            ctx.body = content;
          },
          setHeader: ctx.set.bind(ctx),
          locals: ctx.state
        },
        next
      );
    };
  }
}

export default WebpackHot;
