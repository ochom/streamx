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
  default: () => StreamX
});
module.exports = __toCommonJS(main_exports);
var StreamX = class {
  constructor(apiKey, instanceID, channelID, config) {
    const baseUrl = config?.baseUrl || "https://api.streamx.co.ke";
    this.es = new EventSource(
      `${baseUrl}/subscribe/${apiKey}/${instanceID}/${channelID}`
    );
  }
  on(eventName, callback) {
    if (!eventName) {
      eventName = "message";
    }
    this.es.addEventListener(eventName, (event) => {
      const data = {
        id: event.lastEventId,
        event: event.type,
        data: event.data
      };
      callback(data);
    });
  }
  close() {
    this.es.close();
  }
};
