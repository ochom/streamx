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
var StreamX = class {
  constructor(cfg) {
    this.baseUrl = "https://api.streamx.co.ke";
    if (cfg.topic) {
      this.channel = cfg.topic;
    }
    if (cfg.apiUrl) {
      this.baseUrl = cfg.apiUrl;
    }
    if (this.channel) {
      this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
    }
  }
  conect(url) {
    this.eventSource = new EventSource(url);
    this.eventSource.onopen = () => {
      console.log(`streamx listening to topic: ${this.channel}`);
    };
  }
  on(event, callback) {
    if (!this.eventSource) {
      console.error("EventSource is not initialized");
      return;
    }
    this.eventSource.addEventListener(event, (e) => {
      try {
        const data = JSON.parse(e.data);
        callback(data);
      } catch (error) {
        console.debug("Error parsing event data:", error);
        callback({ data: e.data });
      }
    });
  }
  listen(channel) {
    this.channel = channel;
    this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
  }
  destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log(`streamx connection closed`);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StreamX
});
