export * from "./instance";

import { Node, Fragment } from "./jsx";
export * from "./reactive/index";
export * from "./utils/index";

export default {
  Node,
  Fragment,
};

// TODO - global
// [ ] - Добавить возможность использовать <template>
/*
  Если пользовать пишет <template> -> в props.template.default = <CODE>
  Если пользовате указывет <template name="..."> -> в props.template[... <- name] = <CODE>
*/
