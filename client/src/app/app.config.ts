import { OpaqueToken } from '@angular/core';
import { IAppConfig } from "./models/AppConfig";

export let APP_CONFIG = new OpaqueToken('app.config');

export const AppConfig: IAppConfig = {
  baseUrl: 'http://bookappserver-den2710.rhcloud.com'
};
