module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  extends: "airbnb-base",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  /*
    *ESLint规则的三种级别
    "off"或者0，不启用这个规则
    "warn"或者1，出现问题会有警告
    "error"或者2，出现问题会报错
  */
  rules: {
    "no-console": 0, //手动添加
    eqeqeq: 0, //手动添加
    camelcase: 0,
    "no-unused-vars": 0,
    "no-unused-expressions": 0,
    "no-param-reassign": 0,
    "no-useless-escape": 0,
    "no-empty": 0,
    "no-mixed-operators": 0,
    "linebreak-style": 0, //换行方式
    quotes: 0, //单引号
    "comma-dangle": 0, //数组末尾的逗号
    "import/newline-after-import": 0, //import换行导入
    "object-curly-newline": 0,
    "no-plusplus": 0,
    "max-len": 0,
    "consistent-return": 0,
    "array-callback-return": 0,
    "no-return-assign": 0,
    "no-restricted-globals": 0,
    "no-loop-func": 0
  },
};
