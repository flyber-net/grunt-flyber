// Generated by LiveScript 1.3.1
(function(){
  module.exports = function(grunt){
    return grunt.registerTask('xonom', 'Generate api service and route for express', function(){
      var input, output, prefix, ref$, makeService, makeRoute, fs, map, makeObj, join, makeAngularService, getMethods, getMethodsFromFile, camelize, generateObj, path, mapRoute, applyTemplate;
      input = this.options().input;
      output = this.options().output;
      prefix = (ref$ = this.options().prefix) != null ? ref$ : '/';
      makeService = (ref$ = this.options().makeService) != null
        ? ref$
        : function(name){
          return function(){
            var args, callback, options;
            args = [].slice.call(arguments);
            callback = args.pop();
            options = {
              method: 'POST',
              url: name,
              headers: {
                internal: "yes"
              },
              data: args
            };
            $http(options).then(function(data){
              return callback(null, data.result);
            }, function(err){
              return callback(err);
            });
          };
        };
      makeRoute = (ref$ = this.options().makeRoute) != null
        ? ref$
        : function(func){
          return function(req, resp, next){
            var body, ref$;
            if (req.headers.internal === 'yes') {
              body = (ref$ = req.body) != null
                ? ref$
                : [];
              body.push(function(result){
                return resp.send({
                  result: result
                });
              });
              func.apply(this, body);
            } else {
              next();
            }
          };
        };
      fs = require('fs');
      map = curry$(function(f, xs){
        var i$, len$, x, results$ = [];
        for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
          x = xs[i$];
          results$.push(f(x));
        }
        return results$;
      });
      makeObj = function(it){
        return "{" + it + "}";
      };
      join = curry$(function(d, arr){
        return arr.join(d);
      });
      makeAngularService = function(content){
        return "angular.module('xonom', []).service('$xonom', function($http) {\r\n var make = " + makeService.toString() + ";\r\n return " + content + " \r\n});";
      };
      getMethods = function(str){
        var module, require, res, exports, m;
        module = {};
        require = function(){
          return function(){};
        };
        eval(str, module, require);
        res = [];
        exports = (function(){
          switch (false) {
          case typeof module.exports !== 'function':
            return module.exports();
          default:
            return module.exports;
          }
        }());
        for (m in exports) {
          if (typeof exports[m] === 'function') {
            res.push(m);
          }
        }
        return res;
      };
      getMethodsFromFile = compose$(fs.readFileSync, function(it){
        return it.toString('utf-8');
      }, getMethods);
      camelize = function(str){
        var cp;
        cp = function(m, c){
          if (c) {
            return c.toUpperCase();
          } else {
            return "";
          }
        };
        return str.replace(/[-_\s]+(.)?/g, cp);
      };
      generateObj = function(filename){
        var module, ref$, wrap, camel, makeNamedObj, generateObject;
        module = (ref$ = filename.match(/([a-z-]+)\.api/i)) != null ? ref$[1] : void 8;
        wrap = function(it){
          return "(" + it + ")";
        };
        camel = camelize(module);
        makeNamedObj = function(content){
          return "\r\n   " + camel + " : " + content;
        };
        generateObject = function(name){
          return "\r\n     " + name + " : make('" + prefix + module + "/" + name + "')";
        };
        return makeNamedObj(
        makeObj(
        join(',')(
        map(generateObject)(
        getMethodsFromFile(
        filename)))));
      };
      fs.writeFileSync(output.angularService, makeAngularService(
      makeObj(
      join(',')(
      map(generateObj)(
      input.controllers)))));
      path = require('path');
      mapRoute = function(filename){
        var module, camel, abs, wrapController, applyRoute;
        module = filename.match(/([a-z-]+)\.api/i)[1];
        camel = camelize(module);
        abs = path.resolve(filename);
        wrapController = function(content){
          return " var " + camel + " = $xonom.require('" + abs + "');\r\n" + content + "";
        };
        applyRoute = function(name){
          return " $router.post('" + prefix + module + "/" + name + "', make(" + camel + "." + name + "));";
        };
        return wrapController(
        join('\r\n')(
        map(applyRoute)(
        getMethodsFromFile(
        filename))));
      };
      applyTemplate = function(content){
        return "module.exports = function($router, $xonom) {\r\nvar make = " + makeRoute.toString() + ";\r\n" + content + " \r\n}";
      };
      return fs.writeFileSync(output.expressRoute, applyTemplate(
      join('\r\n')(
      map(mapRoute)(
      input.controllers))));
    });
  };
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
  function compose$() {
    var functions = arguments;
    return function() {
      var i, result;
      result = functions[0].apply(this, arguments);
      for (i = 1; i < functions.length; ++i) {
        result = functions[i](result);
      }
      return result;
    };
  }
}).call(this);
