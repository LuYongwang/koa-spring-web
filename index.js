/**
 * 模仿JAVA SpringMvc
 *
 * 由于使用适配器（注解） 在Node环境不支持 必须安装 bable-node
 *
 */
const Router = require('koa-router');


function RestController({
                            prefix
                        }) {
    // 初始化路由
    let router = new Router();
    if (prefix) {
        router.prefix(prefix);
    }
    return (target) => {
        let request_controller = Object.getOwnPropertyDescriptors(target.prototype);
        for (let method_name in request_controller) {
            // 排除类的构造方法
            // 如果是构造方法忽略
            if (method_name === "constructor") {
                continue
            }
            let callback_fun = request_controller[method_name].value;
            callback_fun && callback_fun(router);
        }
        return router;
    }
}

function RequestMapping({
                            url,
                            method
                        }) {
    return (target, name, descriptor) => {
        let fn = descriptor.value;
        descriptor.value = (router) => {
            // 提取 method 和请求方法 构建router内容
            router[method || RequestMethod.DEFAULT](url, async (ctx, next) => {
                await fn(ctx, next)
            })
        }
    }
}

// 请求方法
const RequestMethod = {
    DEFAULT: 'all',
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};

// 导出
module.exports = {
    RestController: RestController,
    RequestMapping: RequestMapping,
    RequestMethod: RequestMethod
};
