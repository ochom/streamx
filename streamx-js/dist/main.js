"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  StreamX: () => StreamX
});
module.exports = __toCommonJS(main_exports);
var StreamX = class _StreamX extends EventSource {
  constructor(cfg) {
    const base = cfg.apiUrl || "https://api.streamx.co.ke";
    super(`${base}/subscribe/${cfg.topic}`);
    this.baseUrl = base;
    console.log(`streamx listening for topic: ${cfg.topic}`);
  }
  isOpen() {
    return this.readyState === EventSource.OPEN;
  }
  on(event, callback) {
    this.addEventListener(event, (e) => {
      try {
        const data = JSON.parse(e.data);
        callback(data);
      } catch (error) {
        console.debug("Error parsing event data:", error);
        callback({ data: e.data });
      }
    });
  }
  listen(newChannel) {
    this.close();
    return new _StreamX({ apiUrl: this.baseUrl, topic: newChannel });
  }
  destroy() {
    this.close();
    console.log(`streamx connection closed`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StreamX
});
